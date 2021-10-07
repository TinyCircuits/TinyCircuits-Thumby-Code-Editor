import { RP2040 } from '../rp2040';
export declare function atomicUpdate(currentValue: number, atomicType: number, newValue: number): number;
export interface Peripheral {
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
    writeUint32Atomic(offset: number, value: number, atomicType: number): void;
}
export declare class BasePeripheral implements Peripheral {
    protected rp2040: RP2040;
    readonly name: string;
    protected rawWriteValue: number;
    constructor(rp2040: RP2040, name: string);
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
    writeUint32Atomic(offset: number, value: number, atomicType: number): void;
    debug(msg: string): void;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
}
export declare class UnimplementedPeripheral extends BasePeripheral {
}
