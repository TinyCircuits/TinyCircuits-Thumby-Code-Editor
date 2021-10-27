import { IClock, IClockTimer } from './clock';
export declare class ClockTimer implements IClockTimer {
    private micros;
    private callback;
    private jsTimer;
    private timeLeft;
    constructor(micros: number, callback: () => void);
    schedule(currentMicros: number): void;
    unschedule(): void;
    pause(currentMicros: number): void;
    resume(currentMicros: number): void;
}
export declare class RealtimeClock implements IClock {
    baseTime: number;
    pauseTime: number;
    paused: boolean;
    timers: Set<ClockTimer>;
    pause(): void;
    resume(): void;
    createTimer(deltaMicros: number, callback: () => void): ClockTimer;
    deleteTimer(timer: ClockTimer): void;
    get micros(): number;
}
