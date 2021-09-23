import { EventEmitter } from '../utils/event-emitter';
/** @internal */
export declare class Splitter {
    private _isVertical;
    private _size;
    private _grabSize;
    private _dragListener;
    private readonly _element;
    get element(): HTMLDivElement;
    constructor(_isVertical: boolean, _size: number, grabSize: number);
    destroy(): void;
    on<K extends keyof EventEmitter.EventParamsMap>(eventName: K, callback: EventEmitter.Callback<K>): void;
}
//# sourceMappingURL=splitter.d.ts.map