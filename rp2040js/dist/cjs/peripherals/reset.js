"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPReset = void 0;
const peripheral_1 = require("./peripheral");
const RESET = 0x0; //Reset control.
const WDSEL = 0x4; //Watchdog select.
const RESET_DONE = 0x8; //Reset Done
class RPReset extends peripheral_1.BasePeripheral {
    constructor() {
        super(...arguments);
        this.reset = 0;
        this.wdsel = 0;
        this.reset_done = 0x1ffffff;
    }
    readUint32(offset) {
        switch (offset) {
            case RESET:
                return this.reset;
            case WDSEL:
                return this.wdsel;
            case RESET_DONE:
                return this.reset_done;
        }
        return super.readUint32(offset);
    }
    writeUint32(offset, value) {
        switch (offset) {
            case RESET:
                this.reset = value & 0x1ffffff;
                break;
            case WDSEL:
                this.wdsel = value & 0x1ffffff;
                break;
            default:
                super.writeUint32(offset, value);
                break;
        }
    }
}
exports.RPReset = RPReset;
