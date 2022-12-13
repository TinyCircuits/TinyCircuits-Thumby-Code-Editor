import { RP2040 } from '../rp2040.js';
import { FIFO } from '../utils/fifo.js';
import { BasePeripheral, Peripheral } from './peripheral.js';
export declare class RPADC extends BasePeripheral implements Peripheral {
    readonly numChannels = 5;
    /** ADC resolution (in bits) */
    readonly resolution = 12;
    /** Time to read a single sample, in microseconds */
    readonly sampleTime = 2;
    /**
     * ADC Channel values. Channels 0...3 are connected to GPIO 26...29, and channel 4 is connected to the built-in
     * temperature sensor: T=27-(ADC_voltage-0.706)/0.001721.
     *
     * Changing the values will change the ADC reading, unless you override onADCRead() with a custom implementation.
     */
    readonly channelValues: number[];
    /**
     * Invoked whenever the emulated code performs an ADC read.
     *
     * The default implementation reads the result from the `channelValues` array, and then calls
     * completeADCRead() after `sampleTime` milliseconds.
     *
     * If you override the default implementation, make sure to call `completeADCRead()` after
     * `sampleTime` milliseconds (or else the ADC read will never complete).
     */
    onADCRead: (channel: number) => void;
    readonly fifo: FIFO;
    cs: number;
    fcs: number;
    clockDiv: number;
    intEnable: number;
    intForce: number;
    result: number;
    busy: boolean;
    err: boolean;
    get temperatueEnable(): number;
    get enabled(): number;
    get divider(): number;
    get intRaw(): number;
    get intStatus(): number;
    private get activeChannel();
    private set activeChannel(value);
    constructor(rp2040: RP2040, name: string);
    checkInterrupts(): void;
    startADCRead(): void;
    completeADCRead(value: number, error: boolean): void;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}
