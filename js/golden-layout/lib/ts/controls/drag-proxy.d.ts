import { ComponentItem } from '../items/component-item';
import { ContentItem } from '../items/content-item';
import { LayoutManager } from '../layout-manager';
import { DragListener } from '../utils/drag-listener';
import { EventEmitter } from '../utils/event-emitter';
/**
 * This class creates a temporary container
 * for the component whilst it is being dragged
 * and handles drag events
 * @internal
 */
export declare class DragProxy extends EventEmitter {
    private readonly _dragListener;
    private readonly _layoutManager;
    private readonly _componentItem;
    private readonly _originalParent;
    private _area;
    private _lastValidArea;
    private _minX;
    private _minY;
    private _maxX;
    private _maxY;
    private _sided;
    private _element;
    private _proxyContainerElement;
    private _componentItemFocused;
    get element(): HTMLElement;
    /**
     * @param x - The initial x position
     * @param y - The initial y position
     * @internal
     */
    constructor(x: number, y: number, _dragListener: DragListener, _layoutManager: LayoutManager, _componentItem: ComponentItem, _originalParent: ContentItem);
    /** Create Stack-like structure to contain the dragged component */
    private createDragProxyElements;
    private determineMinMaxXY;
    private getXYWithinMinMax;
    /**
     * Callback on every mouseMove event during a drag. Determines if the drag is
     * still within the valid drag area and calls the layoutManager to highlight the
     * current drop area
     *
     * @param offsetX - The difference from the original x position in px
     * @param offsetY - The difference from the original y position in px
     * @param event -
     * @internal
     */
    private onDrag;
    /**
     * Sets the target position, highlighting the appropriate area
     *
     * @param x - The x position in px
     * @param y - The y position in px
     *
     * @internal
     */
    private setDropPosition;
    /**
     * Callback when the drag has finished. Determines the drop area
     * and adds the child to it
     * @internal
     */
    private onDrop;
    /**
     * Updates the Drag Proxy's dimensions
     * @internal
     */
    private setDimensions;
}
//# sourceMappingURL=drag-proxy.d.ts.map