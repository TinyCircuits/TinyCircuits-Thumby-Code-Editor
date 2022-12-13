"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPUART = void 0;
const fifo_js_1 = require("../utils/fifo.js");
const peripheral_js_1 = require("./peripheral.js");
const UARTDR = 0x0;
const UARTFR = 0x18;
const UARTLCR_H = 0x2c;
const UARTCR = 0x30;
const UARTIMSC = 0x38;
const UARTIRIS = 0x3c;
const UARTIMIS = 0x40;
const UARTICR = 0x44;
// UARTFR bits:
const RXFF = 1 << 6;
const RXFE = 1 << 4;
// UARTLCR_H bits:
const FEN = 1 << 4;
// UARTCR bits:
const RXE = 1 << 9;
const TXE = 1 << 8;
const UARTEN = 1 << 0;
// Interrupt bits
const UARTRXINTR = 1 << 4;
class RPUART extends peripheral_js_1.BasePeripheral {
    constructor(rp2040, name, irq) {
        super(rp2040, name);
        this.irq = irq;
        this.ctrlRegister = RXE | TXE;
        this.lineCtrlRegister = 0;
        this.rxFIFO = new fifo_js_1.FIFO(32);
        this.interruptMask = 0;
        this.interruptStatus = 0;
    }
    get enabled() {
        return !!(this.ctrlRegister & UARTEN);
    }
    get txEnabled() {
        return !!(this.ctrlRegister & TXE);
    }
    get rxEnabled() {
        return !!(this.ctrlRegister & RXE);
    }
    get fifosEnabled() {
        return !!(this.lineCtrlRegister & FEN);
    }
    /**
     * Number of bits per UART character
     */
    get wordLength() {
        switch ((this.lineCtrlRegister >>> 5) & 0x3) {
            case 0b00:
                return 5;
            case 0b01:
                return 6;
            case 0b10:
                return 7;
            case 0b11:
                return 8;
        }
    }
    get flags() {
        return (this.rxFIFO.full ? RXFF : 0) | (this.rxFIFO.empty ? RXFE : 0);
    }
    checkInterrupts() {
        this.rp2040.setInterrupt(this.irq, !!(this.interruptStatus & this.interruptMask));
    }
    feedByte(value) {
        this.rxFIFO.push(value);
        // TODO check if the FIFO has reached the threshold level
        this.interruptStatus |= UARTRXINTR;
        this.checkInterrupts();
    }
    readUint32(offset) {
        switch (offset) {
            case UARTDR: {
                const value = this.rxFIFO.pull();
                if (!this.rxFIFO.empty) {
                    this.interruptStatus |= UARTRXINTR;
                    this.checkInterrupts();
                }
                return value;
            }
            case UARTFR:
                return this.flags;
            case UARTLCR_H:
                return this.lineCtrlRegister;
            case UARTCR:
                return this.ctrlRegister;
            case UARTIMSC:
                return this.interruptMask;
            case UARTIRIS:
                return this.interruptStatus;
            case UARTIMIS:
                return this.interruptStatus & this.interruptMask;
        }
        return super.readUint32(offset);
    }
    writeUint32(offset, value) {
        var _a;
        switch (offset) {
            case UARTDR:
                (_a = this.onByte) === null || _a === void 0 ? void 0 : _a.call(this, value & 0xff);
                break;
            case UARTLCR_H:
                this.lineCtrlRegister = value;
                break;
            case UARTCR:
                this.ctrlRegister = value;
                break;
            case UARTIMSC:
                this.interruptMask = value & 0x7ff;
                this.checkInterrupts();
                break;
            case UARTICR:
                this.interruptStatus &= ~this.rawWriteValue;
                this.checkInterrupts();
                break;
            default:
                super.writeUint32(offset, value);
        }
    }
}
exports.RPUART = RPUART;
