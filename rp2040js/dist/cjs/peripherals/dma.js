"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPDMA = exports.RPDMAChannel = exports.DREQChannel = void 0;
const irq_js_1 = require("../irq.js");
const peripheral_js_1 = require("./peripheral.js");
var DREQChannel;
(function (DREQChannel) {
    DREQChannel[DREQChannel["DREQ_PIO0_TX0"] = 0] = "DREQ_PIO0_TX0";
    DREQChannel[DREQChannel["DREQ_PIO0_TX1"] = 1] = "DREQ_PIO0_TX1";
    DREQChannel[DREQChannel["DREQ_PIO0_TX2"] = 2] = "DREQ_PIO0_TX2";
    DREQChannel[DREQChannel["DREQ_PIO0_TX3"] = 3] = "DREQ_PIO0_TX3";
    DREQChannel[DREQChannel["DREQ_PIO0_RX0"] = 4] = "DREQ_PIO0_RX0";
    DREQChannel[DREQChannel["DREQ_PIO0_RX1"] = 5] = "DREQ_PIO0_RX1";
    DREQChannel[DREQChannel["DREQ_PIO0_RX2"] = 6] = "DREQ_PIO0_RX2";
    DREQChannel[DREQChannel["DREQ_PIO0_RX3"] = 7] = "DREQ_PIO0_RX3";
    DREQChannel[DREQChannel["DREQ_PIO1_TX0"] = 8] = "DREQ_PIO1_TX0";
    DREQChannel[DREQChannel["DREQ_PIO1_TX1"] = 9] = "DREQ_PIO1_TX1";
    DREQChannel[DREQChannel["DREQ_PIO1_TX2"] = 10] = "DREQ_PIO1_TX2";
    DREQChannel[DREQChannel["DREQ_PIO1_TX3"] = 11] = "DREQ_PIO1_TX3";
    DREQChannel[DREQChannel["DREQ_PIO1_RX0"] = 12] = "DREQ_PIO1_RX0";
    DREQChannel[DREQChannel["DREQ_PIO1_RX1"] = 13] = "DREQ_PIO1_RX1";
    DREQChannel[DREQChannel["DREQ_PIO1_RX2"] = 14] = "DREQ_PIO1_RX2";
    DREQChannel[DREQChannel["DREQ_PIO1_RX3"] = 15] = "DREQ_PIO1_RX3";
    DREQChannel[DREQChannel["DREQ_SPI0_TX"] = 16] = "DREQ_SPI0_TX";
    DREQChannel[DREQChannel["DREQ_SPI0_RX"] = 17] = "DREQ_SPI0_RX";
    DREQChannel[DREQChannel["DREQ_SPI1_TX"] = 18] = "DREQ_SPI1_TX";
    DREQChannel[DREQChannel["DREQ_SPI1_RX"] = 19] = "DREQ_SPI1_RX";
    DREQChannel[DREQChannel["DREQ_UART0_TX"] = 20] = "DREQ_UART0_TX";
    DREQChannel[DREQChannel["DREQ_UART0_RX"] = 21] = "DREQ_UART0_RX";
    DREQChannel[DREQChannel["DREQ_UART1_TX"] = 22] = "DREQ_UART1_TX";
    DREQChannel[DREQChannel["DREQ_UART1_RX"] = 23] = "DREQ_UART1_RX";
    DREQChannel[DREQChannel["DREQ_PWM_WRAP0"] = 24] = "DREQ_PWM_WRAP0";
    DREQChannel[DREQChannel["DREQ_PWM_WRAP1"] = 25] = "DREQ_PWM_WRAP1";
    DREQChannel[DREQChannel["DREQ_PWM_WRAP2"] = 26] = "DREQ_PWM_WRAP2";
    DREQChannel[DREQChannel["DREQ_PWM_WRAP3"] = 27] = "DREQ_PWM_WRAP3";
    DREQChannel[DREQChannel["DREQ_PWM_WRAP4"] = 28] = "DREQ_PWM_WRAP4";
    DREQChannel[DREQChannel["DREQ_PWM_WRAP5"] = 29] = "DREQ_PWM_WRAP5";
    DREQChannel[DREQChannel["DREQ_PWM_WRAP6"] = 30] = "DREQ_PWM_WRAP6";
    DREQChannel[DREQChannel["DREQ_PWM_WRAP7"] = 31] = "DREQ_PWM_WRAP7";
    DREQChannel[DREQChannel["DREQ_I2C0_TX"] = 32] = "DREQ_I2C0_TX";
    DREQChannel[DREQChannel["DREQ_I2C0_RX"] = 33] = "DREQ_I2C0_RX";
    DREQChannel[DREQChannel["DREQ_I2C1_TX"] = 34] = "DREQ_I2C1_TX";
    DREQChannel[DREQChannel["DREQ_I2C1_RX"] = 35] = "DREQ_I2C1_RX";
    DREQChannel[DREQChannel["DREQ_ADC"] = 36] = "DREQ_ADC";
    DREQChannel[DREQChannel["DREQ_XIP_STREAM"] = 37] = "DREQ_XIP_STREAM";
    DREQChannel[DREQChannel["DREQ_XIP_SSITX"] = 38] = "DREQ_XIP_SSITX";
    DREQChannel[DREQChannel["DREQ_XIP_SSIRX"] = 39] = "DREQ_XIP_SSIRX";
    DREQChannel[DREQChannel["DREQ_MAX"] = 40] = "DREQ_MAX";
})(DREQChannel = exports.DREQChannel || (exports.DREQChannel = {}));
var TREQ;
(function (TREQ) {
    TREQ[TREQ["Timer0"] = 59] = "Timer0";
    TREQ[TREQ["Timer1"] = 60] = "Timer1";
    TREQ[TREQ["Timer2"] = 61] = "Timer2";
    TREQ[TREQ["Timer3"] = 62] = "Timer3";
    TREQ[TREQ["Permanent"] = 63] = "Permanent";
})(TREQ || (TREQ = {}));
// Per-channel registers
const CHn_READ_ADDR = 0x000; // DMA Channel n Read Address pointer
const CHn_WRITE_ADDR = 0x004; // DMA Channel n Write Address pointer
const CHn_TRANS_COUNT = 0x008; // DMA Channel n Transfer Count
const CHn_CTRL_TRIG = 0x00c; // DMA Channel n Control and Status
const CHn_AL1_CTRL = 0x010; // Alias for channel n CTRL register
const CHn_AL1_READ_ADDR = 0x014; // Alias for channel n READ_ADDR register
const CHn_AL1_WRITE_ADDR = 0x018; // Alias for channel n WRITE_ADDR register
const CHn_AL1_TRANS_COUNT_TRIG = 0x01c; // Alias for channel n TRANS_COUNT register
const CHn_AL2_CTRL = 0x020; // Alias for channel n CTRL register
const CHn_AL2_TRANS_COUNT = 0x024; // Alias for channel n TRANS_COUNT register
const CHn_AL2_READ_ADDR = 0x028; // Alias for channel n READ_ADDR register
const CHn_AL2_WRITE_ADDR_TRIG = 0x02c; // Alias for channel n WRITE_ADDR register
const CHn_AL3_CTRL = 0x030; // Alias for channel n CTRL register
const CHn_AL3_WRITE_ADDR = 0x034; // Alias for channel n WRITE_ADDR register
const CHn_AL3_TRANS_COUNT = 0x038; // Alias for channel n TRANS_COUNT register
const CHn_AL3_READ_ADDR_TRIG = 0x03c; // Alias for channel n READ_ADDR register
const CHn_DBG_CTDREQ = 0x800;
const CHn_DBG_TCR = 0x804;
const CHANNEL_REGISTERS_SIZE = 12 * 0x40;
const CHANNEL_REGISTERS_MASK = 0x83f;
// General DMA registers
const INTR = 0x400; // Interrupt Status (raw)
const INTE0 = 0x404; // Interrupt Enables for IRQ 0
const INTF0 = 0x408; // Force Interrupts
const INTS0 = 0x40c; // Interrupt Status for IRQ 0
const INTE1 = 0x414; // Interrupt Enables for IRQ 1
const INTF1 = 0x418; // Force Interrupts for IRQ 1
const INTS1 = 0x41c; // Interrupt Status (masked) for IRQ 1
const TIMER0 = 0x420; // Pacing (X/Y) Fractional Timer
const TIMER1 = 0x424; // Pacing (X/Y) Fractional Timer
const TIMER2 = 0x428; // Pacing (X/Y) Fractional Timer
const TIMER3 = 0x42c; // Pacing (X/Y) Fractional Timer
const MULTI_CHAN_TRIGGER = 0x430; // Trigger one or more channels simultaneously
const SNIFF_CTRL = 0x434; // Sniffer Control
const SNIFF_DATA = 0x438; // Data accumulator for sniff hardware
const FIFO_LEVELS = 0x440; // Debug RAF, WAF, TDF levels
const CHAN_ABORT = 0x444; // Abort an in-progress transfer sequence on one or more channels
const N_CHANNELS = 0x448;
// CHn_CTRL_TRIG bits
const AHB_ERROR = 1 << 31;
const READ_ERROR = 1 << 30;
const WRITE_ERROR = 1 << 29;
const BUSY = 1 << 24;
const SNIFF_EN = 1 << 23;
const BSWAP = 1 << 22;
const IRQ_QUIET = 1 << 21;
const TREQ_SEL_MASK = 0x3f;
const TREQ_SEL_SHIFT = 15;
const CHAIN_TO_MASK = 0xf;
const CHAIN_TO_SHIFT = 11;
const RING_SEL = 1 << 10;
const RING_SIZE_MASK = 0xf;
const RING_SIZE_SHIFT = 6;
const INCR_WRITE = 1 << 5;
const INCR_READ = 1 << 4;
const DATA_SIZE_MASK = 0x3;
const DATA_SIZE_SHIFT = 2;
const HIGH_PRIORITY = 1 << 1;
const EN = 1 << 0;
const CHn_CTRL_TRIG_WRITE_MASK = 0xffffff;
const CHn_CTRL_TRIG_WC_MASK = READ_ERROR | WRITE_ERROR;
class RPDMAChannel {
    constructor(dma, rp2040, index) {
        this.dma = dma;
        this.rp2040 = rp2040;
        this.index = index;
        this.ctrl = 0;
        this.readAddr = 0;
        this.writeAddr = 0;
        this.transCount = 0;
        this.dreqCounter = 0;
        this.transCountReload = 0;
        this.treqValue = 0;
        this.dataSize = 1;
        this.chainTo = 0;
        this.ringMask = 0;
        this.transferFn = () => 0;
        this.transferTimer = null;
        this.transfer8 = () => {
            const { rp2040 } = this;
            rp2040.writeUint8(this.writeAddr, rp2040.readUint8(this.readAddr));
        };
        this.transfer16 = () => {
            const { rp2040 } = this;
            rp2040.writeUint16(this.writeAddr, rp2040.readUint16(this.readAddr));
        };
        this.transferSwap16 = () => {
            const { rp2040 } = this;
            const input = rp2040.readUint16(this.readAddr);
            rp2040.writeUint16(this.writeAddr, ((input & 0xff) << 8) | (input >> 8));
        };
        this.transfer32 = () => {
            const { rp2040 } = this;
            rp2040.writeUint32(this.writeAddr, rp2040.readUint32(this.readAddr));
        };
        this.transferSwap32 = () => {
            const { rp2040 } = this;
            const input = rp2040.readUint32(this.readAddr);
            rp2040.writeUint32(this.writeAddr, ((input & 0x000000ff) << 24) |
                ((input & 0x0000ff00) << 8) |
                ((input & 0x00ff0000) >> 8) |
                ((input >> 24) & 0xff));
        };
        this.transfer = () => {
            var _a;
            const { ctrl, dataSize, ringMask } = this;
            this.transferTimer = null;
            this.transferFn();
            if (ctrl & INCR_READ) {
                if (ringMask && !(ctrl & RING_SEL)) {
                    this.readAddr = (this.readAddr & ~ringMask) | ((this.readAddr + dataSize) & ringMask);
                }
                else {
                    this.readAddr += dataSize;
                }
            }
            if (ctrl & INCR_WRITE) {
                if (ringMask && ctrl & RING_SEL) {
                    this.writeAddr = (this.writeAddr & ~ringMask) | ((this.writeAddr + dataSize) & ringMask);
                }
                else {
                    this.writeAddr += dataSize;
                }
            }
            this.transCount--;
            if (this.transCount > 0) {
                this.scheduleTransfer();
            }
            else {
                this.ctrl &= ~BUSY;
                if (!(this.ctrl & IRQ_QUIET)) {
                    this.dma.intRaw |= 1 << this.index;
                    this.dma.checkInterrupts();
                }
                if (this.chainTo !== this.index) {
                    (_a = this.dma.channels[this.chainTo]) === null || _a === void 0 ? void 0 : _a.start();
                }
            }
        };
        this.reset();
    }
    start() {
        if (!(this.ctrl & EN) || this.ctrl & BUSY) {
            return;
        }
        this.ctrl |= BUSY;
        this.transCount = this.transCountReload;
        if (this.transCount) {
            this.scheduleTransfer();
        }
    }
    get treq() {
        return this.treqValue;
    }
    get active() {
        return this.ctrl & EN && this.ctrl & BUSY;
    }
    scheduleTransfer() {
        if (this.transferTimer) {
            // Already scheduled; do nothing.
            return;
        }
        if (this.dma.dreq[this.treqValue] || this.treqValue === TREQ.Permanent) {
            this.transferTimer = this.rp2040.clock.createTimer(0, this.transfer);
        }
        else {
            const delay = this.dma.getTimer(this.treqValue);
            if (delay) {
                this.transferTimer = this.rp2040.clock.createTimer(delay, this.transfer);
            }
        }
    }
    abort() {
        this.ctrl &= ~BUSY;
        if (this.transferTimer) {
            this.rp2040.clock.deleteTimer(this.transferTimer);
            this.transferTimer = null;
        }
    }
    readUint32(offset) {
        switch (offset) {
            case CHn_READ_ADDR:
            case CHn_AL1_READ_ADDR:
            case CHn_AL2_READ_ADDR:
            case CHn_AL3_READ_ADDR_TRIG:
                return this.readAddr;
            case CHn_WRITE_ADDR:
            case CHn_AL1_WRITE_ADDR:
            case CHn_AL2_WRITE_ADDR_TRIG:
            case CHn_AL3_WRITE_ADDR:
                return this.writeAddr;
            case CHn_TRANS_COUNT:
            case CHn_AL1_TRANS_COUNT_TRIG:
            case CHn_AL2_TRANS_COUNT:
            case CHn_AL3_TRANS_COUNT:
                return this.transCount;
            case CHn_CTRL_TRIG:
            case CHn_AL1_CTRL:
            case CHn_AL2_CTRL:
            case CHn_AL3_CTRL:
                return this.ctrl;
            case CHn_DBG_CTDREQ:
                return this.dreqCounter;
            case CHn_DBG_TCR:
                return this.transCountReload;
        }
        return 0;
    }
    writeUint32(offset, value) {
        switch (offset) {
            case CHn_READ_ADDR:
            case CHn_AL1_READ_ADDR:
            case CHn_AL2_READ_ADDR:
            case CHn_AL3_READ_ADDR_TRIG:
                this.readAddr = value;
                break;
            case CHn_WRITE_ADDR:
            case CHn_AL1_WRITE_ADDR:
            case CHn_AL2_WRITE_ADDR_TRIG:
            case CHn_AL3_WRITE_ADDR:
                this.writeAddr = value;
                break;
            case CHn_TRANS_COUNT:
            case CHn_AL1_TRANS_COUNT_TRIG:
            case CHn_AL2_TRANS_COUNT:
            case CHn_AL3_TRANS_COUNT:
                this.transCountReload = value;
                break;
            case CHn_CTRL_TRIG:
            case CHn_AL1_CTRL:
            case CHn_AL2_CTRL:
            case CHn_AL3_CTRL: {
                this.ctrl = (this.ctrl & ~CHn_CTRL_TRIG_WRITE_MASK) | (value & CHn_CTRL_TRIG_WRITE_MASK);
                this.ctrl &= ~(value & CHn_CTRL_TRIG_WC_MASK); // Handle write-clear (WC) bits
                this.treqValue = (this.ctrl >> TREQ_SEL_SHIFT) & TREQ_SEL_MASK;
                this.chainTo = (this.ctrl >> CHAIN_TO_SHIFT) & CHAIN_TO_MASK;
                const ringSize = (this.ctrl >> RING_SIZE_SHIFT) & RING_SIZE_MASK;
                this.ringMask = ringSize ? (1 << ringSize) - 1 : 0;
                switch ((this.ctrl >> DATA_SIZE_SHIFT) & DATA_SIZE_MASK) {
                    case 1:
                        this.dataSize = 2;
                        this.transferFn = this.ctrl & BSWAP ? this.transferSwap16 : this.transfer16;
                        break;
                    case 2:
                        this.dataSize = 4;
                        this.transferFn = this.ctrl & BSWAP ? this.transferSwap32 : this.transfer32;
                        break;
                    case 0:
                    default:
                        this.transferFn = this.transfer8;
                        this.dataSize = 1;
                }
                if (this.ctrl & EN && this.ctrl & BUSY) {
                    this.scheduleTransfer();
                }
                if (!(this.ctrl & EN) && this.transferTimer) {
                    this.rp2040.clock.deleteTimer(this.transferTimer);
                    this.transferTimer = null;
                }
                break;
            }
            case CHn_DBG_CTDREQ:
                this.dreqCounter = 0;
                break;
        }
        if (offset === CHn_AL3_READ_ADDR_TRIG ||
            offset === CHn_AL2_WRITE_ADDR_TRIG ||
            offset === CHn_AL1_TRANS_COUNT_TRIG ||
            offset === CHn_CTRL_TRIG) {
            if (value) {
                this.start();
            }
            else if (this.ctrl & IRQ_QUIET) {
                // Null trigger interrupts
                this.dma.intRaw |= 1 << this.index;
                this.dma.checkInterrupts();
            }
        }
    }
    reset() {
        this.writeUint32(CHn_CTRL_TRIG, this.index << CHAIN_TO_SHIFT);
    }
}
exports.RPDMAChannel = RPDMAChannel;
class RPDMA extends peripheral_js_1.BasePeripheral {
    constructor() {
        super(...arguments);
        this.channels = [
            new RPDMAChannel(this, this.rp2040, 0),
            new RPDMAChannel(this, this.rp2040, 1),
            new RPDMAChannel(this, this.rp2040, 2),
            new RPDMAChannel(this, this.rp2040, 3),
            new RPDMAChannel(this, this.rp2040, 4),
            new RPDMAChannel(this, this.rp2040, 5),
            new RPDMAChannel(this, this.rp2040, 6),
            new RPDMAChannel(this, this.rp2040, 7),
            new RPDMAChannel(this, this.rp2040, 8),
            new RPDMAChannel(this, this.rp2040, 9),
            new RPDMAChannel(this, this.rp2040, 10),
            new RPDMAChannel(this, this.rp2040, 11),
        ];
        this.intRaw = 0;
        this.intEnable0 = 0;
        this.intForce0 = 0;
        this.intEnable1 = 0;
        this.intForce1 = 0;
        this.timer0 = 0;
        this.timer1 = 0;
        this.timer2 = 0;
        this.timer3 = 0;
        this.dreq = Array(DREQChannel.DREQ_MAX);
    }
    get intStatus0() {
        return (this.intRaw & this.intEnable0) | this.intForce0;
    }
    get intStatus1() {
        return (this.intRaw & this.intEnable1) | this.intForce1;
    }
    readUint32(offset) {
        if ((offset & 0x7ff) <= CHANNEL_REGISTERS_SIZE) {
            const channelIndex = (offset & 0x7ff) >> 6;
            return this.channels[channelIndex].readUint32(offset & CHANNEL_REGISTERS_MASK);
        }
        switch (offset) {
            case TIMER0:
                return this.timer0;
            case TIMER1:
                return this.timer1;
            case TIMER2:
                return this.timer2;
            case TIMER3:
                return this.timer3;
            case INTR:
                return this.intRaw;
            case INTE0:
                return this.intEnable0;
            case INTF0:
                return this.intForce0;
            case INTS0:
                return this.intStatus0;
            case INTE1:
                return this.intEnable1;
            case INTF1:
                return this.intForce1;
            case INTS1:
                return this.intStatus1;
            case N_CHANNELS:
                return this.channels.length;
        }
        return super.readUint32(offset);
    }
    writeUint32(offset, value) {
        if ((offset & 0x7ff) <= CHANNEL_REGISTERS_SIZE) {
            const channelIndex = (offset & 0x7ff) >> 6;
            this.channels[channelIndex].writeUint32(offset & CHANNEL_REGISTERS_MASK, value);
            return;
        }
        switch (offset) {
            case TIMER0:
                this.timer0 = value;
                return;
            case TIMER1:
                this.timer1 = value;
                return;
            case TIMER2:
                this.timer2 = value;
                return;
            case TIMER3:
                this.timer3 = value;
                return;
            case INTR:
            case INTS0:
            case INTS1:
                this.intRaw &= ~this.rawWriteValue;
                this.checkInterrupts();
                return;
            case INTE0:
                this.intEnable0 = value & 0xffff;
                this.checkInterrupts();
                return;
            case INTF0:
                this.intForce0 = value & 0xffff;
                this.checkInterrupts();
                return;
            case INTE1:
                this.intEnable1 = value & 0xffff;
                this.checkInterrupts();
                return;
            case INTF1:
                this.intForce1 = value & 0xffff;
                this.checkInterrupts();
                return;
            case MULTI_CHAN_TRIGGER:
                for (const chan of this.channels) {
                    if (value & (1 << chan.index)) {
                        chan.start();
                    }
                }
                return;
            case CHAN_ABORT:
                for (const chan of this.channels) {
                    if (value & (1 << chan.index)) {
                        chan.abort();
                    }
                }
                return;
            default:
                super.writeUint32(offset, value);
        }
    }
    setDREQ(dreqChannel) {
        const { dreq } = this;
        if (!dreq[dreqChannel]) {
            dreq[dreqChannel] = true;
            for (const channel of this.channels) {
                if (channel.treq === dreqChannel && channel.active) {
                    channel.scheduleTransfer();
                }
            }
        }
    }
    clearDREQ(dreqChannel) {
        this.dreq[dreqChannel] = false;
    }
    /**
     * Returns the number of microseconds for a cycle of the given DMA timer, or 0 if the timer is disabled.
     */
    getTimer(treq) {
        let dividend = 0, divisor = 1;
        switch (treq) {
            case TREQ.Permanent:
                dividend = 1;
                divisor = 1;
                break;
            case TREQ.Timer0:
                dividend = this.timer0 >>> 16;
                divisor = this.timer0 & 0xffff;
                break;
            case TREQ.Timer1:
                dividend = this.timer1 >>> 16;
                divisor = this.timer1 & 0xffff;
                break;
            case TREQ.Timer2:
                dividend = this.timer2 >>> 16;
                divisor = this.timer2 & 0xffff;
                break;
            case TREQ.Timer3:
                dividend = this.timer3 >>> 36;
                divisor = this.timer3 & 0xffff;
                break;
        }
        if (divisor === 0) {
            return 0;
        }
        return ((dividend / divisor) * 1e6) / this.rp2040.clkSys;
    }
    checkInterrupts() {
        this.rp2040.setInterrupt(irq_js_1.IRQ.DMA_IRQ0, !!this.intStatus0);
        this.rp2040.setInterrupt(irq_js_1.IRQ.DMA_IRQ1, !!this.intStatus1);
    }
}
exports.RPDMA = RPDMA;
