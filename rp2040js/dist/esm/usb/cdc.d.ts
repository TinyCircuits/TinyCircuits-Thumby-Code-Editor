import { RPUSBController } from '../peripherals/usb.js';
import { FIFO } from '../utils/fifo.js';
export declare function extractEndpointNumbers(descriptors: ArrayLike<number>): {
    in: number;
    out: number;
};
export declare class USBCDC {
    readonly usb: RPUSBController;
    readonly txFIFO: FIFO;
    onSerialData?: (buffer: Uint8Array) => void;
    onDeviceConnected?: () => void;
    private initialized;
    private descriptorsSize;
    private descriptors;
    private outEndpoint;
    private inEndpoint;
    constructor(usb: RPUSBController);
    private cdcSetControlLineState;
    sendSerialByte(data: number): void;
}
