import { RP2040 } from '../rp2040.js';
import { BasePeripheral, Peripheral } from './peripheral.js';
export declare class RPIO extends BasePeripheral implements Peripheral {
    constructor(rp2040: RP2040, name: string);
    getPinFromOffset(offset: number): {
        gpio: import("../gpio-pin.js").GPIOPin;
        isCtrl: boolean;
    };
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}
