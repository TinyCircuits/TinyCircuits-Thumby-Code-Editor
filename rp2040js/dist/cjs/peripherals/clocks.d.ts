import { RP2040 } from '../rp2040';
import { BasePeripheral, Peripheral } from './peripheral';
export declare class RPClocks extends BasePeripheral implements Peripheral {
    constructor(rp2040: RP2040, name: string);
    readUint32(offset: number): number;
}
