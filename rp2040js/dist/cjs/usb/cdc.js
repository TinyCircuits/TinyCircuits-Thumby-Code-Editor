"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USBCDC = exports.extractEndpointNumbers = void 0;
const fifo_1 = require("../utils/fifo");
const interfaces_1 = require("./interfaces");
const setup_1 = require("./setup");
// CDC stuff
const CDC_REQUEST_SET_CONTROL_LINE_STATE = 0x22;
const CDC_DTR = 1 << 0;
const CDC_RTS = 1 << 1;
const CDC_DATA_CLASS = 10;
const ENDPOINT_BULK = 2;
const TX_FIFO_SIZE = 512;
const ENDPOINT_ZERO = 0;
const CONFIGURATION_DESCRIPTOR_SIZE = 9;
function extractEndpointNumbers(descriptors) {
    let index = 0;
    let foundInterface = false;
    const result = {
        in: -1,
        out: -1,
    };
    while (index < descriptors.length) {
        const len = descriptors[index];
        if (len < 2 || descriptors.length < index + len) {
            break;
        }
        const type = descriptors[index + 1];
        if (type === interfaces_1.DescriptorType.Interface && len === 9) {
            const numEndpoints = descriptors[index + 4];
            const interfaceClass = descriptors[index + 5];
            foundInterface = numEndpoints === 2 && interfaceClass === CDC_DATA_CLASS;
        }
        if (foundInterface && type === interfaces_1.DescriptorType.Endpoint && len === 7) {
            const address = descriptors[index + 2];
            const attributes = descriptors[index + 3];
            if ((attributes & 0x3) === ENDPOINT_BULK) {
                if (address & 0x80) {
                    result.in = address & 0xf;
                }
                else {
                    result.out = address & 0xf;
                }
            }
        }
        index += descriptors[index];
    }
    return result;
}
exports.extractEndpointNumbers = extractEndpointNumbers;
class USBCDC {
    constructor(usb) {
        this.usb = usb;
        this.txFIFO = new fifo_1.FIFO(TX_FIFO_SIZE);
        this.initialized = false;
        this.descriptorsSize = null;
        this.descriptors = [];
        this.outEndpoint = -1;
        this.inEndpoint = -1;
        this.usb.onUSBEnabled = () => {
            this.usb.resetDevice();
        };
        this.usb.onResetReceived = () => {
            this.usb.sendSetupPacket(setup_1.setDeviceAddressPacket(1));
        };
        this.usb.onEndpointWrite = (endpoint, buffer) => {
            var _a, _b;
            if (endpoint === ENDPOINT_ZERO && buffer.length === 0) {
                if (this.descriptorsSize == null) {
                    this.usb.sendSetupPacket(setup_1.getDescriptorPacket(interfaces_1.DescriptorType.Configration, CONFIGURATION_DESCRIPTOR_SIZE));
                }
                // Acknowledgement
                else if (!this.initialized) {
                    this.cdcSetControlLineState();
                    (_a = this.onDeviceConnected) === null || _a === void 0 ? void 0 : _a.call(this);
                }
            }
            if (endpoint === ENDPOINT_ZERO && buffer.length > 1) {
                if (buffer.length === CONFIGURATION_DESCRIPTOR_SIZE &&
                    buffer[1] === interfaces_1.DescriptorType.Configration &&
                    this.descriptorsSize == null) {
                    this.descriptorsSize = (buffer[3] << 8) | buffer[2];
                    this.usb.sendSetupPacket(setup_1.getDescriptorPacket(interfaces_1.DescriptorType.Configration, this.descriptorsSize));
                }
                else if (this.descriptorsSize != null && this.descriptors.length < this.descriptorsSize) {
                    this.descriptors.push(...buffer);
                }
                if (this.descriptorsSize === this.descriptors.length) {
                    const endpoints = extractEndpointNumbers(this.descriptors);
                    this.inEndpoint = endpoints.in;
                    this.outEndpoint = endpoints.out;
                    // Now configure the device
                    this.usb.sendSetupPacket(setup_1.setDeviceConfigurationPacket(1));
                }
            }
            if (endpoint === this.inEndpoint) {
                (_b = this.onSerialData) === null || _b === void 0 ? void 0 : _b.call(this, buffer);
            }
        };
        this.usb.onEndpointRead = (endpoint, size) => {
            if (endpoint === this.outEndpoint) {
                const buffer = new Uint8Array(Math.min(size, this.txFIFO.itemCount));
                for (let i = 0; i < buffer.length; i++) {
                    buffer[i] = this.txFIFO.pull();
                }
                this.usb.endpointReadDone(this.outEndpoint, buffer);
            }
        };
    }
    cdcSetControlLineState(value = CDC_DTR | CDC_RTS, interfaceNumber = 0) {
        this.usb.sendSetupPacket(setup_1.createSetupPacket({
            dataDirection: interfaces_1.DataDirection.HostToDevice,
            type: interfaces_1.SetupType.Class,
            recipient: interfaces_1.SetupRecipient.Device,
            bRequest: CDC_REQUEST_SET_CONTROL_LINE_STATE,
            wValue: value,
            wIndex: interfaceNumber,
            wLength: 0,
        }));
        this.initialized = true;
    }
    sendSerialByte(data) {
        this.txFIFO.push(data);
    }
}
exports.USBCDC = USBCDC;
