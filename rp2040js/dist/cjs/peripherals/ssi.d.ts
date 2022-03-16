import { BasePeripheral, Peripheral } from './peripheral.js';
export declare class RPSSI extends BasePeripheral implements Peripheral {
    private dr0;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}
