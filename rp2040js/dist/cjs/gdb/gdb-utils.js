"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gdbMessage = exports.gdbChecksum = exports.decodeHexUint32 = exports.decodeHexUint32Array = exports.decodeHexBuf = exports.encodeHexUint32 = exports.encodeHexUint32BE = exports.encodeHexBuf = exports.encodeHexByte = void 0;
function encodeHexByte(value) {
    return (value >> 4).toString(16) + (value & 0xf).toString(16);
}
exports.encodeHexByte = encodeHexByte;
function encodeHexBuf(buf) {
    return Array.from(buf).map(encodeHexByte).join('');
}
exports.encodeHexBuf = encodeHexBuf;
function encodeHexUint32BE(value) {
    return encodeHexBuf(new Uint8Array([(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]));
}
exports.encodeHexUint32BE = encodeHexUint32BE;
function encodeHexUint32(value) {
    const buf = new Uint32Array([value]);
    return encodeHexBuf(new Uint8Array(buf.buffer));
}
exports.encodeHexUint32 = encodeHexUint32;
function decodeHexBuf(encoded) {
    const result = new Uint8Array(encoded.length / 2);
    for (let i = 0; i < result.length; i++) {
        result[i] = parseInt(encoded.substr(i * 2, 2), 16);
    }
    return result;
}
exports.decodeHexBuf = decodeHexBuf;
function decodeHexUint32Array(encoded) {
    return new Uint32Array(decodeHexBuf(encoded).buffer);
}
exports.decodeHexUint32Array = decodeHexUint32Array;
function decodeHexUint32(encoded) {
    return decodeHexUint32Array(encoded)[0];
}
exports.decodeHexUint32 = decodeHexUint32;
function gdbChecksum(text) {
    const value = text
        .split('')
        .map((c) => c.charCodeAt(0))
        .reduce((a, b) => a + b, 0) & 0xff;
    return encodeHexByte(value);
}
exports.gdbChecksum = gdbChecksum;
function gdbMessage(value) {
    return `$${value}#${gdbChecksum(value)}`;
}
exports.gdbMessage = gdbMessage;
