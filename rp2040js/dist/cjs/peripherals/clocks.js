"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPClocks = void 0;
const peripheral_1 = require("./peripheral");
const CLK_REF_SELECTED = 0x38;
const CLK_SYS_SELECTED = 0x44;
class RPClocks extends peripheral_1.BasePeripheral {
    constructor(rp2040, name) {
        super(rp2040, name);
    }
    readUint32(offset) {
        switch (offset) {
            case CLK_REF_SELECTED:
                return 1;
            case CLK_SYS_SELECTED:
                return 1;
        }
        return super.readUint32(offset);
    }
}
exports.RPClocks = RPClocks;
