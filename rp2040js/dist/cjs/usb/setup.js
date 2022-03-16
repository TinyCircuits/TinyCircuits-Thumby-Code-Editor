"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDeviceConfigurationPacket = exports.getDescriptorPacket = exports.setDeviceAddressPacket = exports.createSetupPacket = void 0;
const interfaces_js_1 = require("./interfaces.js");
function createSetupPacket(params) {
    const setupPacket = new Uint8Array(8);
    setupPacket[0] = (params.dataDirection << 7) | (params.type << 5) | params.recipient;
    setupPacket[1] = params.bRequest;
    setupPacket[2] = params.wValue & 0xff;
    setupPacket[3] = (params.wValue >> 8) & 0xff;
    setupPacket[4] = params.wIndex & 0xff;
    setupPacket[5] = (params.wIndex >> 8) & 0xff;
    setupPacket[6] = params.wLength & 0xff;
    setupPacket[7] = (params.wLength >> 8) & 0xff;
    return setupPacket;
}
exports.createSetupPacket = createSetupPacket;
function setDeviceAddressPacket(address) {
    return createSetupPacket({
        dataDirection: interfaces_js_1.DataDirection.HostToDevice,
        type: interfaces_js_1.SetupType.Standard,
        recipient: interfaces_js_1.SetupRecipient.Device,
        bRequest: interfaces_js_1.SetupRequest.SetAddress,
        wValue: address,
        wIndex: 0,
        wLength: 0,
    });
}
exports.setDeviceAddressPacket = setDeviceAddressPacket;
function getDescriptorPacket(type, length, index = 0) {
    return createSetupPacket({
        dataDirection: interfaces_js_1.DataDirection.DeviceToHost,
        type: interfaces_js_1.SetupType.Standard,
        recipient: interfaces_js_1.SetupRecipient.Device,
        bRequest: interfaces_js_1.SetupRequest.GetDescriptor,
        wValue: type << 8,
        wIndex: index,
        wLength: length,
    });
}
exports.getDescriptorPacket = getDescriptorPacket;
function setDeviceConfigurationPacket(configurationNumber) {
    return createSetupPacket({
        dataDirection: interfaces_js_1.DataDirection.HostToDevice,
        type: interfaces_js_1.SetupType.Standard,
        recipient: interfaces_js_1.SetupRecipient.Device,
        bRequest: interfaces_js_1.SetupRequest.SetDeviceConfiguration,
        wValue: configurationNumber,
        wIndex: 0,
        wLength: 0,
    });
}
exports.setDeviceConfigurationPacket = setDeviceConfigurationPacket;
