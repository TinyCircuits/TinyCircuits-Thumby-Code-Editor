import { BasePeripheral, Peripheral } from './peripheral.js';
export declare class RP2040SysCfg extends BasePeripheral implements Peripheral {
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}
