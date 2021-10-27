"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPPADS = void 0;
const peripheral_1 = require("./peripheral");
const VOLTAGE_SELECT = 0;
const GPIO_FIRST = 0x4;
const GPIO_LAST = 0x78;
const QSPI_FIRST = 0x4;
const QSPI_LAST = 0x18;
class RPPADS extends peripheral_1.BasePeripheral {
    constructor(rp2040, name, bank) {
        super(rp2040, name);
        this.bank = bank;
        this.voltageSelect = 0;
        this.firstPadRegister = this.bank === 'qspi' ? QSPI_FIRST : GPIO_FIRST;
        this.lastPadRegister = this.bank === 'qspi' ? QSPI_LAST : GPIO_LAST;
    }
    getPinFromOffset(offset) {
        const gpioIndex = (offset - this.firstPadRegister) >>> 2;
        if (this.bank === 'qspi') {
            return this.rp2040.qspi[gpioIndex];
        }
        else {
            return this.rp2040.gpio[gpioIndex];
        }
    }
    readUint32(offset) {
        if (offset >= this.firstPadRegister && offset <= this.lastPadRegister) {
            const gpio = this.getPinFromOffset(offset);
            return gpio.padValue;
        }
        switch (offset) {
            case VOLTAGE_SELECT:
                return this.voltageSelect;
        }
        return super.readUint32(offset);
    }
    writeUint32(offset, value) {
        if (offset >= this.firstPadRegister && offset <= this.lastPadRegister) {
            const gpio = this.getPinFromOffset(offset);
            gpio.padValue = value;
            gpio.checkForUpdates();
            return;
        }
        switch (offset) {
            case VOLTAGE_SELECT:
                this.voltageSelect = value & 1;
                break;
            default:
                super.writeUint32(offset, value);
        }
    }
}
exports.RPPADS = RPPADS;
