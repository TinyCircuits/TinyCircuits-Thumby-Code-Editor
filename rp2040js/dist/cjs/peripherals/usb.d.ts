import { BasePeripheral } from './peripheral.js';
export declare class RPUSBController extends BasePeripheral {
    private mainCtrl;
    private intRaw;
    private intEnable;
    private intForce;
    private sieStatus;
    private buffStatus;
    onUSBEnabled?: () => void;
    onResetReceived?: () => void;
    onEndpointWrite?: (endpoint: number, buffer: Uint8Array) => void;
    onEndpointRead?: (endpoint: number, byteCount: number) => void;
    readDelayMicroseconds: number;
    writeDelayMicroseconds: number;
    get intStatus(): number;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
    private readEndpointControlReg;
    private getEndpointBufferOffset;
    DPRAMUpdated(offset: number, value: number): void;
    endpointReadDone(endpoint: number, buffer: Uint8Array, delay?: number): void;
    private finishRead;
    private checkInterrupts;
    resetDevice(): void;
    sendSetupPacket(setupPacket: Uint8Array): void;
    private indicateBufferReady;
    private buffStatusUpdated;
    private sieStatusUpdated;
}
