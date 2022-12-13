import { IClockTimer } from '../clock/clock.js';
import { BasePeripheral, Peripheral } from './peripheral.js';
export declare const VTOR = 3336;
export declare const SHPR2 = 3356;
export declare const SHPR3 = 3360;
/** PPB stands for Private Periphral Bus.
 * These are peripherals that are part of the ARM Cortex Core, and there's one copy for each processor core.
 *
 * Included peripheral: NVIC, SysTick timer
 */
export declare class RPPPB extends BasePeripheral implements Peripheral {
    systickCountFlag: boolean;
    systickControl: number;
    systickLastZero: number;
    systickReload: number;
    systickTimer: IClockTimer | null;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}
