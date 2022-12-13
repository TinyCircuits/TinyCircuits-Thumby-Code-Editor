import { RP2040 } from '../rp2040.js';
import { BasePeripheral, Peripheral } from './peripheral.js';
export declare class RPUART extends BasePeripheral implements Peripheral {
    readonly irq: number;
    private ctrlRegister;
    private lineCtrlRegister;
    private rxFIFO;
    private interruptMask;
    private interruptStatus;
    onByte?: (value: number) => void;
    constructor(rp2040: RP2040, name: string, irq: number);
    get enabled(): boolean;
    get txEnabled(): boolean;
    get rxEnabled(): boolean;
    get fifosEnabled(): boolean;
    /**
     * Number of bits per UART character
     */
    get wordLength(): 8 | 7 | 5 | 6 | undefined;
    get flags(): number;
    checkInterrupts(): void;
    feedByte(value: number): void;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}
