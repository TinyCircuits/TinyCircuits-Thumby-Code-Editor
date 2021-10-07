import { RP2040 } from '../rp2040';
import { BasePeripheral, Peripheral } from './peripheral';
export declare class RPTimer extends BasePeripheral implements Peripheral {
    private readonly clock;
    private latchedTimeHigh;
    private readonly alarms;
    private intRaw;
    private intEnable;
    private intForce;
    private paused;
    constructor(rp2040: RP2040, name: string);
    get intStatus(): number;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
    private fireAlarm;
    private checkInterrupts;
    private disarmAlarm;
}
