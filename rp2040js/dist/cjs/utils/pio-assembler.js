"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pioSET = exports.pioIRQ = exports.pioMOV = exports.pioPULL = exports.pioPUSH = exports.pioOUT = exports.pioIN = exports.pioWAIT = exports.pioJMP = exports.PIO_COND_NOTEMPTYOSR = exports.PIO_COND_PIN = exports.PIO_COND_XNEY = exports.PIO_COND_YDEC = exports.PIO_COND_NOTY = exports.PIO_COND_XDEC = exports.PIO_COND_NOTX = exports.PIO_COND_ALWAYS = exports.PIO_WAIT_SRC_IRQ = exports.PIO_WAIT_SRC_PIN = exports.PIO_WAIT_SRC_GPIO = exports.PIO_OP_BITREV = exports.PIO_OP_INVERT = exports.PIO_OP_NONE = exports.PIO_MOV_DEST_OSR = exports.PIO_MOV_DEST_ISR = exports.PIO_MOV_DEST_PC = exports.PIO_MOV_DEST_EXEC = exports.PIO_MOV_DEST_Y = exports.PIO_MOV_DEST_X = exports.PIO_MOV_DEST_PINS = exports.PIO_DEST_EXEC = exports.PIO_DEST_ISR = exports.PIO_DEST_PC = exports.PIO_DEST_PINDIRS = exports.PIO_DEST_NULL = exports.PIO_DEST_Y = exports.PIO_DEST_X = exports.PIO_DEST_PINS = exports.PIO_SRC_OSR = exports.PIO_SRC_ISR = exports.PIO_SRC_STATUS = exports.PIO_SRC_NULL = exports.PIO_SRC_Y = exports.PIO_SRC_X = exports.PIO_SRC_PINS = void 0;
exports.PIO_SRC_PINS = 0;
exports.PIO_SRC_X = 1;
exports.PIO_SRC_Y = 2;
exports.PIO_SRC_NULL = 3;
exports.PIO_SRC_STATUS = 5;
exports.PIO_SRC_ISR = 6;
exports.PIO_SRC_OSR = 7;
exports.PIO_DEST_PINS = 0;
exports.PIO_DEST_X = 1;
exports.PIO_DEST_Y = 2;
exports.PIO_DEST_NULL = 3;
exports.PIO_DEST_PINDIRS = 4;
exports.PIO_DEST_PC = 5;
exports.PIO_DEST_ISR = 6;
exports.PIO_DEST_EXEC = 7;
exports.PIO_MOV_DEST_PINS = 0;
exports.PIO_MOV_DEST_X = 1;
exports.PIO_MOV_DEST_Y = 2;
exports.PIO_MOV_DEST_EXEC = 4;
exports.PIO_MOV_DEST_PC = 5;
exports.PIO_MOV_DEST_ISR = 6;
exports.PIO_MOV_DEST_OSR = 7;
exports.PIO_OP_NONE = 0;
exports.PIO_OP_INVERT = 1;
exports.PIO_OP_BITREV = 2;
exports.PIO_WAIT_SRC_GPIO = 0;
exports.PIO_WAIT_SRC_PIN = 1;
exports.PIO_WAIT_SRC_IRQ = 2;
exports.PIO_COND_ALWAYS = 0;
exports.PIO_COND_NOTX = 1;
exports.PIO_COND_XDEC = 2;
exports.PIO_COND_NOTY = 3;
exports.PIO_COND_YDEC = 4;
exports.PIO_COND_XNEY = 5;
exports.PIO_COND_PIN = 6;
exports.PIO_COND_NOTEMPTYOSR = 7;
function pioJMP(cond = 0, address, delay = 0) {
    return ((delay & 0x1f) << 8) | ((cond & 0x7) << 5) | (address & 0x1f);
}
exports.pioJMP = pioJMP;
function pioWAIT(polarity, src, index, delay = 0) {
    return ((1 << 13) |
        ((delay & 0x1f) << 8) |
        ((polarity ? 1 : 0) << 7) |
        ((src & 0x3) << 5) |
        (index & 0x1f));
}
exports.pioWAIT = pioWAIT;
function pioIN(src, bitCount, delay = 0) {
    return (2 << 13) | ((delay & 0x1f) << 8) | ((src & 0x7) << 5) | (bitCount & 0x1f);
}
exports.pioIN = pioIN;
function pioOUT(Dest, bitCount, delay = 0) {
    return (3 << 13) | ((delay & 0x1f) << 8) | ((Dest & 0x7) << 5) | (bitCount & 0x1f);
}
exports.pioOUT = pioOUT;
function pioPUSH(ifFull, noBlock, delay = 0) {
    return (4 << 13) | ((delay & 0x1f) << 8) | ((ifFull ? 1 : 0) << 6) | ((noBlock ? 1 : 0) << 5);
}
exports.pioPUSH = pioPUSH;
function pioPULL(ifEmpty, noBlock, delay = 0) {
    return ((4 << 13) |
        ((delay & 0x1f) << 8) |
        (1 << 7) |
        ((ifEmpty ? 1 : 0) << 6) |
        ((noBlock ? 1 : 0) << 5));
}
exports.pioPULL = pioPULL;
function pioMOV(dest, op = 0, src, delay = 0) {
    return (5 << 13) | ((delay & 0x1f) << 8) | ((dest & 0x7) << 5) | ((op & 0x3) << 3) | (src & 0x7);
}
exports.pioMOV = pioMOV;
function pioIRQ(clear, wait, index, delay = 0) {
    return ((6 << 13) |
        ((delay & 0x1f) << 8) |
        ((clear ? 1 : 0) << 6) |
        ((wait ? 1 : 0) << 5) |
        (index & 0x1f));
}
exports.pioIRQ = pioIRQ;
function pioSET(dest, data, delay = 0) {
    return (7 << 13) | ((delay & 0x1f) << 8) | ((dest & 0x7) << 5) | (data & 0x1f);
}
exports.pioSET = pioSET;
