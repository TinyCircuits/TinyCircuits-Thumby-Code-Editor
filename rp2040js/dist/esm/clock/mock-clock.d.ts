import { IClock, IClockTimer } from './clock.js';
export declare class MockClockTimer implements IClockTimer {
    readonly micros: number;
    readonly callback: () => void;
    constructor(micros: number, callback: () => void);
    pause(): void;
    resume(): void;
}
export declare class MockClock implements IClock {
    micros: number;
    readonly timers: MockClockTimer[];
    pause(): void;
    resume(): void;
    advance(deltaMicros: number): void;
    createTimer(deltaMicros: number, callback: () => void): MockClockTimer;
    deleteTimer(timer: IClockTimer): void;
}
