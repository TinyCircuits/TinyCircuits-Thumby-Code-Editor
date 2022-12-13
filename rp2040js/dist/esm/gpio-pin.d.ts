import { RP2040 } from './rp2040.js';
export declare enum GPIOPinState {
    Low = 0,
    High = 1,
    Input = 2,
    InputPullUp = 3,
    InputPullDown = 4
}
export declare const FUNCTION_SIO = 5;
export declare const FUNCTION_PIO0 = 6;
export declare const FUNCTION_PIO1 = 7;
export declare type GPIOPinListener = (state: GPIOPinState, oldState: GPIOPinState) => void;
export declare class GPIOPin {
    readonly rp2040: RP2040;
    readonly index: number;
    readonly name: string;
    private rawInputValue;
    private lastValue;
    ctrl: number;
    padValue: number;
    irqEnableMask: number;
    irqForceMask: number;
    irqStatus: number;
    private readonly listeners;
    constructor(rp2040: RP2040, index: number, name?: string);
    get rawInterrupt(): boolean;
    get isSlewFast(): boolean;
    get schmittEnabled(): boolean;
    get pulldownEnabled(): boolean;
    get pullupEnabled(): boolean;
    get driveStrength(): number;
    get inputEnable(): boolean;
    get outputDisable(): boolean;
    get functionSelect(): number;
    get outputOverride(): number;
    get outputEnableOverride(): number;
    get inputOverride(): number;
    get irqOverride(): number;
    get rawOutputEnable(): boolean;
    get rawOutputValue(): boolean;
    get inputValue(): boolean;
    get irqValue(): boolean;
    get outputEnable(): boolean;
    get outputValue(): boolean;
    /**
     * Returns the STATUS register value for the pin, as outlined in section 2.19.6 of the datasheet
     */
    get status(): number;
    get value(): GPIOPinState;
    setInputValue(value: boolean): void;
    checkForUpdates(): void;
    updateIRQValue(value: number): void;
    addListener(callback: GPIOPinListener): () => boolean;
}
