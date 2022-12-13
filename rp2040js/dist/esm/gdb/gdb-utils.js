export function encodeHexByte(value) {
    return (value >> 4).toString(16) + (value & 0xf).toString(16);
}
export function encodeHexBuf(buf) {
    return Array.from(buf).map(encodeHexByte).join('');
}
export function encodeHexUint32BE(value) {
    return encodeHexBuf(new Uint8Array([(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]));
}
export function encodeHexUint32(value) {
    const buf = new Uint32Array([value]);
    return encodeHexBuf(new Uint8Array(buf.buffer));
}
export function decodeHexBuf(encoded) {
    const result = new Uint8Array(encoded.length / 2);
    for (let i = 0; i < result.length; i++) {
        result[i] = parseInt(encoded.substr(i * 2, 2), 16);
    }
    return result;
}
export function decodeHexUint32Array(encoded) {
    return new Uint32Array(decodeHexBuf(encoded).buffer);
}
export function decodeHexUint32(encoded) {
    return decodeHexUint32Array(encoded)[0];
}
export function gdbChecksum(text) {
    const value = text
        .split('')
        .map((c) => c.charCodeAt(0))
        .reduce((a, b) => a + b, 0) & 0xff;
    return encodeHexByte(value);
}
export function gdbMessage(value) {
    return `$${value}#${gdbChecksum(value)}`;
}
