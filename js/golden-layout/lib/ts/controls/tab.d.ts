import { ComponentItem } from '../items/component-item';
import { LayoutManager } from '../layout-manager';
import { DragListener } from '../utils/drag-listener';
/**
 * Represents an individual tab within a Stack's header
 * @public
 */
export declare class Tab {
    /** @internal */
    private readonly _layoutManager;
    /** @internal */
    private _componentItem;
    /** @internal */
    private _closeEvent;
    /** @internal */
    private _focusEvent;
    /** @internal */
    private _dragStartEvent;
    /** @internal */
    private readonly _element;
    /** @internal */
    private readonly _titleElement;
    /** @internal */
    private readonly _closeElement;
    /** @internal */
    private _dragListener;
    /** @internal */
    private _isActive;
    /** @internal */
    private readonly _tabClickListener;
    /** @internal */
    private readonly _tabTouchStartListener;
    /** @internal */
    private readonly _closeClickListener;
    /** @internal */
    private readonly _closeTouchStartListener;
    /** @internal */
    private readonly _dragStartListener;
    /** @internal */
    private readonly _contentItemDestroyListener;
    /** @internal */
    private readonly _tabTitleChangedListener;
    get isActive(): boolean;
    get componentItem(): ComponentItem;
    /** @deprecated use {@link (Tab:class).componentItem} */
    get contentItem(): ComponentItem;
    get element(): HTMLElement;
    get titleElement(): HTMLElement;
    get closeElement(): HTMLElement | undefined;
    get reorderEnabled(): boolean;
    set reorderEnabled(value: boolean);
    /** @internal */
    constructor(
    /** @internal */
    _layoutManager: LayoutManager, 
    /** @internal */
    _componentItem: ComponentItem, 
    /** @internal */
    _closeEvent: Tab.CloseEvent | undefined, 
    /** @internal */
    _focusEvent: Tab.FocusEvent | undefined, 
    /** @internal */
    _dragStartEvent: Tab.DragStartEvent | undefined);
    /**
     * Sets the tab's title to the provided string and sets
     * its title attribute to a pure text representation (without
     * html tags) of the same string.
     */
    setTitle(title: string): void;
    /**
     * Sets this tab's active state. To programmatically
     * switch tabs, use Stack.setActiveComponentItem( item ) instead.
     */
    setActive(isActive: boolean): void;
    /**
     * Destroys the tab
     * @internal
     */
    destroy(): void;
    /** @internal */
    setBlurred(): void;
    /** @internal */
    setFocused(): void;
    /**
     * Callback for the DragListener
     * @param x - The tabs absolute x position
     * @param y - The tabs absolute y position
     * @internal
     */
    private onDragStart;
    /** @internal */
    private onContentItemDestroy;
    /**
     * Callback when the tab is clicked
     * @internal
     */
    private onTabClickDown;
    /** @internal */
    private onTabTouchStart;
    /**
     * Callback when the tab's close button is clicked
     * @internal
     */
    private onCloseClick;
    /** @internal */
    private onCloseTouchStart;
    /**
     * Callback to capture tab close button mousedown
     * to prevent tab from activating.
     * @internal
     */
    /** @internal */
    private notifyClose;
    /** @internal */
    private notifyFocus;
    /** @internal */
    private enableReorder;
    /** @internal */
    private disableReorder;
}
/** @public */
export declare namespace Tab {
    /** @internal */
    type CloseEvent = (componentItem: ComponentItem) => void;
    /** @internal */
    type FocusEvent = (componentItem: ComponentItem) => void;
    /** @internal */
    type DragStartEvent = (x: number, y: number, dragListener: DragListener, componentItem: ComponentItem) => void;
}
//# sourceMappingURL=tab.d.ts.map