import { RP2040 } from '../rp2040.js';
import { BasePeripheral, Peripheral } from './peripheral.js';
export declare enum DREQChannel {
    DREQ_PIO0_TX0 = 0,
    DREQ_PIO0_TX1 = 1,
    DREQ_PIO0_TX2 = 2,
    DREQ_PIO0_TX3 = 3,
    DREQ_PIO0_RX0 = 4,
    DREQ_PIO0_RX1 = 5,
    DREQ_PIO0_RX2 = 6,
    DREQ_PIO0_RX3 = 7,
    DREQ_PIO1_TX0 = 8,
    DREQ_PIO1_TX1 = 9,
    DREQ_PIO1_TX2 = 10,
    DREQ_PIO1_TX3 = 11,
    DREQ_PIO1_RX0 = 12,
    DREQ_PIO1_RX1 = 13,
    DREQ_PIO1_RX2 = 14,
    DREQ_PIO1_RX3 = 15,
    DREQ_SPI0_TX = 16,
    DREQ_SPI0_RX = 17,
    DREQ_SPI1_TX = 18,
    DREQ_SPI1_RX = 19,
    DREQ_UART0_TX = 20,
    DREQ_UART0_RX = 21,
    DREQ_UART1_TX = 22,
    DREQ_UART1_RX = 23,
    DREQ_PWM_WRAP0 = 24,
    DREQ_PWM_WRAP1 = 25,
    DREQ_PWM_WRAP2 = 26,
    DREQ_PWM_WRAP3 = 27,
    DREQ_PWM_WRAP4 = 28,
    DREQ_PWM_WRAP5 = 29,
    DREQ_PWM_WRAP6 = 30,
    DREQ_PWM_WRAP7 = 31,
    DREQ_I2C0_TX = 32,
    DREQ_I2C0_RX = 33,
    DREQ_I2C1_TX = 34,
    DREQ_I2C1_RX = 35,
    DREQ_ADC = 36,
    DREQ_XIP_STREAM = 37,
    DREQ_XIP_SSITX = 38,
    DREQ_XIP_SSIRX = 39,
    DREQ_MAX = 40
}
declare enum TREQ {
    Timer0 = 59,
    Timer1 = 60,
    Timer2 = 61,
    Timer3 = 62,
    Permanent = 63
}
export declare class RPDMAChannel {
    readonly dma: RPDMA;
    readonly rp2040: RP2040;
    readonly index: number;
    private ctrl;
    private readAddr;
    private writeAddr;
    private transCount;
    private dreqCounter;
    private transCountReload;
    private treqValue;
    private dataSize;
    private chainTo;
    private ringMask;
    private transferFn;
    private transferTimer;
    constructor(dma: RPDMA, rp2040: RP2040, index: number);
    start(): void;
    get treq(): number;
    get active(): number;
    transfer8: () => void;
    transfer16: () => void;
    transferSwap16: () => void;
    transfer32: () => void;
    transferSwap32: () => void;
    transfer: () => void;
    scheduleTransfer(): void;
    abort(): void;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
    reset(): void;
}
export declare class RPDMA extends BasePeripheral implements Peripheral {
    readonly channels: RPDMAChannel[];
    intRaw: number;
    private intEnable0;
    private intForce0;
    private intEnable1;
    private intForce1;
    private timer0;
    private timer1;
    private timer2;
    private timer3;
    readonly dreq: boolean[];
    get intStatus0(): number;
    get intStatus1(): number;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
    setDREQ(dreqChannel: DREQChannel): void;
    clearDREQ(dreqChannel: DREQChannel): void;
    /**
     * Returns the number of microseconds for a cycle of the given DMA timer, or 0 if the timer is disabled.
     */
    getTimer(treq: TREQ): number;
    checkInterrupts(): void;
}
export {};
