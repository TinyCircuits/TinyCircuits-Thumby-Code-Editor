"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPIO = void 0;
const peripheral_1 = require("./peripheral");
const GPIO_CTRL_LAST = 0x0ec;
const INTR0 = 0xf0;
const PROC0_INTE0 = 0x100;
const PROC0_INTF0 = 0x110;
const PROC0_INTS0 = 0x120;
const PROC0_INTS3 = 0x12c;
class RPIO extends peripheral_1.BasePeripheral {
    constructor(rp2040, name) {
        super(rp2040, name);
    }
    getPinFromOffset(offset) {
        const gpioIndex = offset >>> 3;
        return {
            gpio: this.rp2040.gpio[gpioIndex],
            isCtrl: !!(offset & 0x4),
        };
    }
    readUint32(offset) {
        if (offset <= GPIO_CTRL_LAST) {
            const { gpio, isCtrl } = this.getPinFromOffset(offset);
            return isCtrl ? gpio.ctrl : gpio.status;
        }
        if (offset >= INTR0 && offset <= PROC0_INTS3) {
            const startIndex = (offset & 0xf) * 2;
            const register = offset & ~0xf;
            const { gpio } = this.rp2040;
            let result = 0;
            for (let index = 7; index >= 0; index--) {
                const pin = gpio[index + startIndex];
                if (!pin) {
                    continue;
                }
                result <<= 4;
                switch (register) {
                    case INTR0:
                        result |= pin.irqStatus;
                        break;
                    case PROC0_INTE0:
                        result |= pin.irqEnableMask;
                        break;
                    case PROC0_INTF0:
                        result |= pin.irqForceMask;
                        break;
                    case PROC0_INTS0:
                        result |= (pin.irqStatus & pin.irqEnableMask) | pin.irqForceMask;
                        break;
                }
            }
            return result;
        }
        return super.readUint32(offset);
    }
    writeUint32(offset, value) {
        if (offset <= GPIO_CTRL_LAST) {
            const { gpio, isCtrl } = this.getPinFromOffset(offset);
            if (isCtrl) {
                gpio.ctrl = value;
                gpio.checkForUpdates();
            }
            return;
        }
        if (offset >= INTR0 && offset <= PROC0_INTS3) {
            const startIndex = (offset & 0xf) * 2;
            const register = offset & ~0xf;
            const { gpio } = this.rp2040;
            for (let index = 0; index < 8; index++) {
                const pin = gpio[index + startIndex];
                if (!pin) {
                    continue;
                }
                const pinValue = (value >> (index * 4)) & 0xf;
                const pinRawWriteValue = (this.rawWriteValue >> (index * 4)) & 0xf;
                switch (register) {
                    case INTR0:
                        pin.updateIRQValue(pinRawWriteValue);
                        break;
                    case PROC0_INTE0:
                        pin.irqEnableMask = pinValue;
                        break;
                    case PROC0_INTF0:
                        pin.irqForceMask = pinValue;
                        break;
                }
            }
            return;
        }
        super.writeUint32(offset, value);
    }
}
exports.RPIO = RPIO;
