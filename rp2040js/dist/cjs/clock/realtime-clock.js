"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeClock = exports.ClockTimer = void 0;
const time_js_1 = require("../utils/time.js");
class ClockTimer {
    constructor(micros, callback) {
        this.micros = micros;
        this.callback = callback;
        this.jsTimer = null;
        this.timeLeft = this.micros;
    }
    schedule(currentMicros) {
        this.jsTimer = setTimeout(this.callback, (this.micros - currentMicros) / 1000);
    }
    unschedule() {
        if (this.jsTimer) {
            clearTimeout(this.jsTimer);
            this.jsTimer = null;
        }
    }
    pause(currentMicros) {
        this.timeLeft = this.micros - currentMicros;
        this.unschedule();
    }
    resume(currentMicros) {
        this.micros = currentMicros + this.timeLeft;
        this.schedule(currentMicros);
    }
}
exports.ClockTimer = ClockTimer;
class RealtimeClock {
    constructor() {
        this.baseTime = 0;
        this.pauseTime = 0;
        this.paused = true;
        this.timers = new Set();
    }
    pause() {
        if (!this.paused) {
            for (const timer of this.timers) {
                timer.pause(this.micros);
            }
            this.pauseTime = this.micros;
            this.paused = true;
        }
    }
    resume() {
        if (this.paused) {
            this.baseTime = time_js_1.getCurrentMicroseconds() - this.pauseTime;
            this.paused = false;
            for (const timer of this.timers) {
                timer.resume(this.micros);
            }
        }
    }
    createTimer(deltaMicros, callback) {
        const timer = new ClockTimer(this.micros + deltaMicros, () => {
            this.timers.delete(timer);
            callback();
        });
        timer.schedule(this.micros);
        this.timers.add(timer);
        return timer;
    }
    deleteTimer(timer) {
        timer.unschedule();
        this.timers.delete(timer);
    }
    get micros() {
        return time_js_1.getCurrentMicroseconds() - this.baseTime;
    }
}
exports.RealtimeClock = RealtimeClock;
