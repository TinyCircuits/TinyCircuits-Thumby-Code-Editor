import { BasePeripheral, Peripheral } from './peripheral';
export declare class RP2040RTC extends BasePeripheral implements Peripheral {
    running: boolean;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}
