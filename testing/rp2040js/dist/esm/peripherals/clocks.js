import { BasePeripheral } from './peripheral.js';
const CLK_REF_SELECTED = 0x38;
const CLK_SYS_SELECTED = 0x44;
export class RPClocks extends BasePeripheral {
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
