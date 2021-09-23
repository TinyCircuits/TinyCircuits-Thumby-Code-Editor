import { ResolvedItemConfig } from '../config/resolved-config';
import { BrowserPopout } from '../controls/browser-popout';
import { LayoutManager } from '../layout-manager';
import { EventEmitter } from '../utils/event-emitter';
import { AreaLinkedRect, ItemType } from '../utils/types';
import { ComponentItem } from './component-item';
import { ComponentParentableItem } from './component-parentable-item';
import { Stack } from './stack';
/**
 * This is the baseclass that all content items inherit from.
 * Most methods provide a subset of what the sub-classes do.
 *
 * It also provides a number of functions for tree traversal
 * @public
 */
export declare abstract class ContentItem extends EventEmitter {
    readonly layoutManager: LayoutManager;
    /** @internal */
    private _parent;
    /** @internal */
    private readonly _element;
    /** @internal */
    private _type;
    /** @internal */
    private _id;
    /** @internal */
    private _popInParentIds;
    /** @internal */
    private _contentItems;
    /** @internal */
    private _isClosable;
    /** @internal */
    private _pendingEventPropagations;
    /** @internal */
    private _throttledEvents;
    /** @internal */
    private _isInitialised;
    /** @internal */
    width: number;
    /** @internal */
    minWidth: number;
    /** @internal */
    height: number;
    /** @internal */
    minHeight: number;
    isGround: boolean;
    isRow: boolean;
    isColumn: boolean;
    isStack: boolean;
    isComponent: boolean;
    get type(): ItemType;
    get id(): string;
    /** @internal */
    get popInParentIds(): string[];
    get parent(): ContentItem | null;
    get contentItems(): ContentItem[];
    get isClosable(): boolean;
    get element(): HTMLElement;
    get isInitialised(): boolean;
    static isStack(item: ContentItem): item is Stack;
    static isComponentItem(item: ContentItem): item is ComponentItem;
    static isComponentParentableItem(item: ContentItem): item is ComponentParentableItem;
    /** @internal */
    constructor(layoutManager: LayoutManager, config: ResolvedItemConfig, 
    /** @internal */
    _parent: ContentItem | null, 
    /** @internal */
    _element: HTMLElement);
    /**
     * Updaters the size of the component and its children, called recursively
     * @internal
     */
    abstract updateSize(): void;
    /**
     * Removes a child node (and its children) from the tree
     * @param contentItem - The child item to remove
     * @param keepChild - Whether to destroy the removed item
     */
    removeChild(contentItem: ContentItem, keepChild?: boolean): void;
    /**
     * Sets up the tree structure for the newly added child
     * The responsibility for the actual DOM manipulations lies
     * with the concrete item
     *
     * @param contentItem -
     * @param index - If omitted item will be appended
     * @param suspendResize - Used by descendent implementations
     */
    addChild(contentItem: ContentItem, index?: number | null, suspendResize?: boolean): number;
    /**
     * Replaces oldChild with newChild
     * @param oldChild -
     * @param newChild -
     * @internal
     */
    replaceChild(oldChild: ContentItem, newChild: ContentItem, destroyOldChild?: boolean): void;
    /**
     * Convenience method.
     * Shorthand for this.parent.removeChild( this )
     */
    remove(): void;
    /**
     * Removes the component from the layout and creates a new
     * browser window with the component and its children inside
     */
    popout(): BrowserPopout;
    abstract toConfig(): ResolvedItemConfig;
    /** @internal */
    calculateConfigContent(): ResolvedItemConfig[];
    /** @internal */
    highlightDropZone(x: number, y: number, area: AreaLinkedRect): void;
    /** @internal */
    onDrop(contentItem: ContentItem, area: ContentItem.Area): void;
    /** @internal */
    show(): void;
    /**
     * Destroys this item ands its children
     * @internal
     */
    destroy(): void;
    /**
     * Returns the area the component currently occupies
     * @internal
     */
    getElementArea(element?: HTMLElement): ContentItem.Area | null;
    /**
     * The tree of content items is created in two steps: First all content items are instantiated,
     * then init is called recursively from top to bottem. This is the basic init function,
     * it can be used, extended or overwritten by the content items
     *
     * Its behaviour depends on the content item
     * @internal
     */
    init(): void;
    /** @internal */
    protected setParent(parent: ContentItem): void;
    /** @internal */
    addPopInParentId(id: string): void;
    /** @internal */
    protected initContentItems(): void;
    /** @internal */
    protected hide(): void;
    /** @internal */
    protected updateContentItemsSize(): void;
    /**
     * creates all content items for this node at initialisation time
     * PLEASE NOTE, please see addChild for adding contentItems at runtime
     * @internal
     */
    private createContentItems;
    /**
     * Called for every event on the item tree. Decides whether the event is a bubbling
     * event and propagates it to its parent
     *
     * @param name - The name of the event
     * @param event -
     * @internal
     */
    private propagateEvent;
    tryBubbleEvent(name: string, args: unknown[]): void;
    /**
     * All raw events bubble up to the Ground element. Some events that
     * are propagated to - and emitted by - the layoutManager however are
     * only string-based, batched and sanitized to make them more usable
     *
     * @param name - The name of the event
     * @internal
     */
    private scheduleEventPropagationToLayoutManager;
    /**
     * Callback for events scheduled by _scheduleEventPropagationToLayoutManager
     *
     * @param name - The name of the event
     * @internal
     */
    private propagateEventToLayoutManager;
}
/** @public */
export declare namespace ContentItem {
    /** @internal */
    interface Area extends AreaLinkedRect {
        surface: number;
        contentItem: ContentItem;
    }
}
/** @public @deprecated Use {@link (ContentItem:class)} */
export declare type AbstractContentItem = ContentItem;
//# sourceMappingURL=content-item.d.ts.map