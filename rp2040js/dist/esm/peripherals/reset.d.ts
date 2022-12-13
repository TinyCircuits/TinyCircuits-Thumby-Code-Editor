import { BasePeripheral, Peripheral } from './peripheral.js';
export declare class RPReset extends BasePeripheral implements Peripheral {
    private reset;
    private wdsel;
    private reset_done;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}
