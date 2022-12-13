const ATOMIC_NORMAL = 0;
const ATOMIC_XOR = 1;
const ATOMIC_SET = 2;
const ATOMIC_CLEAR = 3;
export function atomicUpdate(currentValue, atomicType, newValue) {
    switch (atomicType) {
        case ATOMIC_XOR:
            return currentValue ^ newValue;
        case ATOMIC_SET:
            return currentValue | newValue;
        case ATOMIC_CLEAR:
            return currentValue & ~newValue;
        default:
            console.warn('Atomic update called with invalid writeType', atomicType);
            return newValue;
    }
}
export class BasePeripheral {
    constructor(rp2040, name) {
        this.rp2040 = rp2040;
        this.name = name;
        this.rawWriteValue = 0;
    }
    readUint32(offset) {
        this.warn(`Unimplemented peripheral read from ${offset.toString(16)}`);
        if (offset > 0x1000) {
            this.warn('Unimplemented read from peripheral in the atomic operation region');
        }
        return 0xffffffff;
    }
    writeUint32(offset, value) {
        this.warn(`Unimplemented peripheral write to ${offset.toString(16)}: ${value}`);
    }
    writeUint32Atomic(offset, value, atomicType) {
        this.rawWriteValue = value;
        const newValue = atomicType != ATOMIC_NORMAL
            ? atomicUpdate(this.readUint32(offset), atomicType, value)
            : value;
        this.writeUint32(offset, newValue);
    }
    debug(msg) {
        this.rp2040.logger.debug(this.name, msg);
    }
    info(msg) {
        this.rp2040.logger.info(this.name, msg);
    }
    warn(msg) {
        this.rp2040.logger.warn(this.name, msg);
    }
    error(msg) {
        this.rp2040.logger.error(this.name, msg);
    }
}
export class UnimplementedPeripheral extends BasePeripheral {
}
