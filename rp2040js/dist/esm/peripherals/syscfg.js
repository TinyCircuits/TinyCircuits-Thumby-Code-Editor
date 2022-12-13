import { BasePeripheral } from './peripheral.js';
const PROC0_NMI_MASK = 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROC1_NMI_MASK = 4;
export class RP2040SysCfg extends BasePeripheral {
    readUint32(offset) {
        switch (offset) {
            case PROC0_NMI_MASK:
                return this.rp2040.interruptNMIMask;
        }
        return super.readUint32(offset);
    }
    writeUint32(offset, value) {
        switch (offset) {
            case PROC0_NMI_MASK:
                this.rp2040.interruptNMIMask = value;
                break;
            default:
                super.writeUint32(offset, value);
        }
    }
}
