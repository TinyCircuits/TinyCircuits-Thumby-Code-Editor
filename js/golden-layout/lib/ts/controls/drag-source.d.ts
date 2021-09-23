import { LayoutManager } from '../layout-manager';
import { JsonValue } from '../utils/types';
/**
 * Allows for any DOM item to create a component on drag
 * start to be dragged into the Layout
 * @public
 */
export declare class DragSource {
    /** @internal */
    private _layoutManager;
    /** @internal */
    private readonly _element;
    /** @internal */
    private readonly _extraAllowableChildTargets;
    /** @internal */
    private _componentTypeOrFtn;
    /** @internal */
    private _componentState;
    /** @internal */
    private _title;
    /** @internal */
    private _dragListener;
    /** @internal */
    private _dummyGroundContainer;
    /** @internal */
    private _dummyGroundContentItem;
    /** @internal */
    constructor(
    /** @internal */
    _layoutManager: LayoutManager, 
    /** @internal */
    _element: HTMLElement, 
    /** @internal */
    _extraAllowableChildTargets: HTMLElement[], 
    /** @internal */
    _componentTypeOrFtn: JsonValue | (() => DragSource.ComponentItemConfig), 
    /** @internal */
    _componentState: JsonValue | undefined, 
    /** @internal */
    _title: string | undefined);
    /**
     * Disposes of the drag listeners so the drag source is not usable any more.
     * @internal
     */
    destroy(): void;
    /**
     * Called initially and after every drag
     * @internal
     */
    private createDragListener;
    /**
     * Callback for the DragListener's dragStart event
     *
     * @param x - The x position of the mouse on dragStart
     * @param y - The x position of the mouse on dragStart
     * @internal
     */
    private onDragStart;
    /** @internal */
    private onDragStop;
    /**
     * Called after every drag and when the drag source is being disposed of.
     * @internal
     */
    private removeDragListener;
}
/** @public */
export declare namespace DragSource {
    interface ComponentItemConfig {
        type: JsonValue;
        state?: JsonValue;
        title?: string;
    }
}
//# sourceMappingURL=drag-source.d.ts.map