export class MockClockTimer {
    constructor(micros, callback) {
        this.micros = micros;
        this.callback = callback;
    }
    pause() {
        /* intentionally empty */
    }
    resume() {
        /* intentionally empty */
    }
}
export class MockClock {
    constructor() {
        this.micros = 0;
        this.timers = [];
    }
    pause() {
        /* intentionally empty */
    }
    resume() {
        /* intentionally empty */
    }
    advance(deltaMicros) {
        const { timers } = this;
        const targetTime = this.micros + Math.max(deltaMicros, 0.01);
        while (timers[0] && timers[0].micros <= targetTime) {
            const timer = timers.shift();
            if (timer) {
                this.micros = timer.micros;
                timer.callback();
            }
        }
    }
    createTimer(deltaMicros, callback) {
        const timer = new MockClockTimer(this.micros + deltaMicros, callback);
        this.timers.push(timer);
        this.timers.sort((a, b) => a.micros - b.micros);
        return timer;
    }
    deleteTimer(timer) {
        const timerIndex = this.timers.indexOf(timer);
        if (timerIndex >= 0) {
            this.timers.splice(timerIndex, 1);
        }
    }
}
