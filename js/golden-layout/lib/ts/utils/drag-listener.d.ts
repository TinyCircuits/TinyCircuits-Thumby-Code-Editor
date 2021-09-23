import { EventEmitter } from './event-emitter';
/** @internal */
export declare class DragListener extends EventEmitter {
    private _eElement;
    private _timeout;
    private _allowableTargets;
    private _oDocument;
    private _eBody;
    private _nDelay;
    private _nDistance;
    private _nX;
    private _nY;
    private _nOriginalX;
    private _nOriginalY;
    private _dragging;
    private _pointerTracking;
    private _pointerDownEventListener;
    private _pointerMoveEventListener;
    private _pointerUpEventListener;
    constructor(_eElement: HTMLElement, extraAllowableChildTargets: HTMLElement[]);
    destroy(): void;
    cancelDrag(): void;
    private onPointerDown;
    private processPointerDown;
    private onPointerMove;
    private processDragMove;
    private onPointerUp;
    private processDragStop;
    private checkRemovePointerTrackingEventListeners;
    private startDrag;
    private getPointerCoordinates;
}
/** @internal */
export declare namespace DragListener {
    interface PointerCoordinates {
        x: number;
        y: number;
    }
}
//# sourceMappingURL=drag-listener.d.ts.map