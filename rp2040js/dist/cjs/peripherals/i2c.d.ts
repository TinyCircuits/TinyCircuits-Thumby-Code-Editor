import { RP2040 } from '../rp2040.js';
import { BasePeripheral, Peripheral } from './peripheral.js';
export declare enum I2CMode {
    Write = 0,
    Read = 1
}
export declare enum I2CSpeed {
    Invalid = 0,
    Standard = 1,
    FastMode = 2,
    HighSpeedMode = 3
}
export declare class RPI2C extends BasePeripheral implements Peripheral {
    readonly irq: number;
    private state;
    private busy;
    private stop;
    private pendingRestart;
    private firstByte;
    private rxFIFO;
    private txFIFO;
    onStart: (repeatedStart: boolean) => void;
    onConnect: (address: number, mode: I2CMode) => void;
    onWriteByte: (value: number) => void;
    onReadByte: (ack: boolean) => void;
    onStop: () => void;
    enable: number;
    rxThreshold: number;
    txThreshold: number;
    control: number;
    targetAddress: number;
    slaveAddress: number;
    abortSource: number;
    intRaw: number;
    intEnable: number;
    get intStatus(): number;
    get speed(): I2CSpeed;
    get masterBits(): 7 | 10;
    constructor(rp2040: RP2040, name: string, irq: number);
    checkInterrupts(): void;
    protected clearInterrupts(mask: number): 0 | 1;
    protected setInterrupts(mask: number): void;
    protected abort(reason: number): void;
    protected nextCommand(): void;
    protected pushRX(value: number): void;
    completeStart(): void;
    completeConnect(ack: boolean, nackByte?: number): void;
    completeWrite(ack: boolean): void;
    completeRead(value: number): void;
    completeStop(): void;
    arbitrationLost(): void;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}
