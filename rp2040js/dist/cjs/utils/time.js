"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTime = exports.getCurrentMicroseconds = void 0;
function getCurrentMicroseconds() {
    if (typeof performance != 'undefined') {
        return Math.floor(performance.now() * 1000);
    }
    else {
        return Math.floor(eval('require')('perf_hooks').performance.now() * 1000);
    }
}
exports.getCurrentMicroseconds = getCurrentMicroseconds;
function leftPad(value, minLength, padChar = ' ') {
    if (value.length < minLength) {
        value = padChar + value;
    }
    return value;
}
function rightPad(value, minLength, padChar = ' ') {
    if (value.length < minLength) {
        value += padChar;
    }
    return value;
}
function formatTime(date) {
    const hours = leftPad(date.getHours().toString(), 2, '0');
    const minutes = leftPad(date.getMinutes().toString(), 2, '0');
    const seconds = leftPad(date.getSeconds().toString(), 2, '0');
    const milliseconds = rightPad(date.getMilliseconds().toString(), 3);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}
exports.formatTime = formatTime;
