import { RP2040 } from '../rp2040';
import { FIFO } from '../utils/fifo';
import { DREQChannel } from './dma';
import { BasePeripheral, Peripheral } from './peripheral';
export declare enum WaitType {
    None = 0,
    Pin = 1,
    rxFIFO = 2,
    txFIFO = 3,
    IRQ = 4,
    Out = 5
}
export declare class StateMachine {
    readonly rp2040: RP2040;
    readonly pio: RPPIO;
    readonly index: number;
    enabled: boolean;
    x: number;
    y: number;
    pc: number;
    inputShiftReg: number;
    inputShiftCount: number;
    outputShiftReg: number;
    outputShiftCount: number;
    cycles: number;
    execOpcode: number;
    execValid: boolean;
    updatePC: boolean;
    clockDivInt: number;
    clockDivFrac: number;
    execCtrl: number;
    shiftCtrl: number;
    pinCtrl: number;
    readonly rxFIFO: FIFO;
    readonly txFIFO: FIFO;
    outPinValues: number;
    outPinDirection: number;
    waiting: boolean;
    waitType: WaitType;
    waitIndex: number;
    waitPolarity: boolean;
    waitDelay: number;
    readonly dreqRx: DREQChannel;
    readonly dreqTx: DREQChannel;
    constructor(rp2040: RP2040, pio: RPPIO, index: number);
    private updateDMATx;
    private updateDMARx;
    writeFIFO(value: number): void;
    readFIFO(): number;
    get status(): 0 | 4294967295;
    jmpCondition(condition: number): boolean | import("..").GPIOPinState;
    get inPins(): number;
    inSourceValue(source: number): number;
    writeOutValue(destination: number, value: number, bitCount: number): void;
    get pushThreshold(): number;
    get pullThreshold(): number;
    get sidesetCount(): number;
    get setCount(): number;
    get outCount(): number;
    get inBase(): number;
    get sidesetBase(): number;
    get setBase(): number;
    get outBase(): number;
    get jmpPin(): number;
    get wrapTop(): number;
    get wrapBottom(): number;
    setOutPinDirs(value: number): void;
    setOutPins(value: number): void;
    outInstruction(arg: number): void;
    executeInstruction(opcode: number): void;
    wait(type: WaitType, polarity: boolean, index: number): void;
    nextPC(): void;
    step(): void;
    setSetPinDirs(value: number): void;
    setSetPins(value: number): void;
    setSideset(value: number, count: number): void;
    transformMovValue(value: number, op: number): number;
    setMovDestination(destination: number, value: number): void;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
    get fifoStat(): number;
    restart(): void;
    clkDivRestart(): void;
    checkWait(): void;
}
export declare class RPPIO extends BasePeripheral implements Peripheral {
    readonly firstIrq: number;
    readonly index: number;
    readonly instructions: Uint32Array;
    readonly dreqRx: DREQChannel[];
    readonly dreqTx: DREQChannel[];
    readonly machines: StateMachine[];
    stopped: boolean;
    fdebug: number;
    inputSyncBypass: number;
    irq: number;
    pinValues: number;
    pinDirections: number;
    oldPinValues: number;
    oldPinDirections: number;
    private runTimer;
    irq0IntEnable: number;
    irq0IntForce: number;
    irq1IntEnable: number;
    irq1IntForce: number;
    constructor(rp2040: RP2040, name: string, firstIrq: number, index: number);
    get intRaw(): number;
    get irq0IntStatus(): number;
    get irq1IntStatus(): number;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
    pinValuesChanged(value: number, firstPin: number, count: number): void;
    pinDirectionsChanged(value: number, firstPin: number, count: number): void;
    checkInterrupts(): void;
    irqUpdated(): void;
    checkChangedPins(): void;
    step(): void;
    run(): void;
    stop(): void;
}
