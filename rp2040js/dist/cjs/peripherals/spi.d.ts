import { RP2040 } from '../rp2040.js';
import { FIFO } from '../utils/fifo.js';
import { BasePeripheral, Peripheral } from './peripheral.js';
export declare class RPSPI extends BasePeripheral implements Peripheral {
    readonly irq: number;
    readonly rxFIFO: FIFO;
    readonly txFIFO: FIFO;
    onTransmit: (value: number) => void;
    private busy;
    private control0;
    private control1;
    private dmaControl;
    private clockDivisor;
    private intRaw;
    private intEnable;
    get intStatus(): number;
    get enabled(): boolean;
    /** Data size in bits: 4 to 16 bits */
    get dataBits(): number;
    get masterMode(): boolean;
    get spiMode(): 2 | 3 | 0 | 1;
    get clockFrequency(): number;
    constructor(rp2040: RP2040, name: string, irq: number);
    private doTX;
    completeTransmit(rxValue: number): void;
    checkInterrupts(): void;
    private fifosUpdated;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}
