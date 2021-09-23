/** @internal @deprecated To be removed */
export declare class TransitionIndicator {
    private _element;
    private _toElement;
    private _fromDimensions;
    private _totalAnimationDuration;
    private _animationStartTime;
    constructor();
    destroy(): void;
    transitionElements(fromElement: HTMLElement, toElement: HTMLElement): void;
    private nextAnimationFrame;
    private measure;
}
//# sourceMappingURL=transition-indicator.d.ts.map