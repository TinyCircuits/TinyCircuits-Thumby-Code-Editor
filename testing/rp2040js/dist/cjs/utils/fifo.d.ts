export declare class FIFO {
    readonly buffer: Uint32Array;
    private start;
    private used;
    constructor(size: number);
    get size(): number;
    get itemCount(): number;
    push(value: number): void;
    pull(): number;
    peek(): number;
    reset(): void;
    get empty(): boolean;
    get full(): boolean;
    get items(): number[];
}
