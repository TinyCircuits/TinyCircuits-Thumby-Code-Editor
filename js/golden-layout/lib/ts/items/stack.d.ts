import { ComponentItemConfig } from '../config/config';
import { ResolvedStackItemConfig } from '../config/resolved-config';
import { LayoutManager } from '../layout-manager';
import { AreaLinkedRect, JsonValue, Side } from '../utils/types';
import { ComponentItem } from './component-item';
import { ComponentParentableItem } from './component-parentable-item';
import { ContentItem } from './content-item';
/** @public */
export declare class Stack extends ComponentParentableItem {
    /** @internal */
    private readonly _headerConfig;
    /** @internal */
    private readonly _header;
    /** @internal */
    private readonly _childElementContainer;
    /** @internal */
    private readonly _maximisedEnabled;
    /** @internal */
    private _activeComponentItem;
    /** @internal */
    private _dropSegment;
    /** @internal */
    private _dropIndex;
    /** @internal */
    private _contentAreaDimensions;
    /** @internal */
    private _headerSideChanged;
    /** @internal */
    private readonly _initialWantMaximise;
    /** @internal */
    private _initialActiveItemIndex;
    /** @internal */
    private _resizeListener;
    /** @internal */
    private _maximisedListener;
    /** @internal */
    private _minimisedListener;
    get childElementContainer(): HTMLElement;
    get headerShow(): boolean;
    get headerSide(): Side;
    get headerLeftRightSided(): boolean;
    /** @internal */
    get contentAreaDimensions(): Stack.ContentAreaDimensions | undefined;
    /** @internal */
    get initialWantMaximise(): boolean;
    get isMaximised(): boolean;
    get stackParent(): ContentItem;
    /** @internal */
    constructor(layoutManager: LayoutManager, config: ResolvedStackItemConfig, parent: ContentItem);
    /** @internal */
    updateSize(): void;
    /** @internal */
    init(): void;
    /** @deprecated Use {@link (Stack:class).setActiveComponentItem} */
    setActiveContentItem(item: ContentItem): void;
    setActiveComponentItem(componentItem: ComponentItem, focus: boolean, suppressFocusEvent?: boolean): void;
    /** @deprecated Use {@link (Stack:class).getActiveComponentItem} */
    getActiveContentItem(): ContentItem | null;
    getActiveComponentItem(): ComponentItem | undefined;
    /** @internal */
    focusActiveContentItem(): void;
    /** @internal */
    setFocusedValue(value: boolean): void;
    /** @internal */
    setRowColumnClosable(value: boolean): void;
    newComponent(componentType: JsonValue, componentState?: JsonValue, title?: string, index?: number): ComponentItem;
    addComponent(componentType: JsonValue, componentState?: JsonValue, title?: string, index?: number): number;
    newItem(itemConfig: ComponentItemConfig, index?: number): ContentItem;
    addItem(itemConfig: ComponentItemConfig, index?: number): number;
    addChild(contentItem: ContentItem, index?: number, focus?: boolean): number;
    removeChild(contentItem: ContentItem, keepChild: boolean): void;
    /**
     * Maximises the Item or minimises it if it is already maximised
     */
    toggleMaximise(): void;
    maximise(): void;
    minimise(): void;
    /** @internal */
    destroy(): void;
    toConfig(): ResolvedStackItemConfig;
    /**
     * Ok, this one is going to be the tricky one: The user has dropped a {@link (ContentItem:class)} onto this stack.
     *
     * It was dropped on either the stacks header or the top, right, bottom or left bit of the content area
     * (which one of those is stored in this._dropSegment). Now, if the user has dropped on the header the case
     * is relatively clear: We add the item to the existing stack... job done (might be good to have
     * tab reordering at some point, but lets not sweat it right now)
     *
     * If the item was dropped on the content part things are a bit more complicated. If it was dropped on either the
     * top or bottom region we need to create a new column and place the items accordingly.
     * Unless, of course if the stack is already within a column... in which case we want
     * to add the newly created item to the existing column...
     * either prepend or append it, depending on wether its top or bottom.
     *
     * Same thing for rows and left / right drop segments... so in total there are 9 things that can potentially happen
     * (left, top, right, bottom) * is child of the right parent (row, column) + header drop
     *
     * @internal
     */
    onDrop(contentItem: ContentItem, area: ContentItem.Area): void;
    /**
     * If the user hovers above the header part of the stack, indicate drop positions for tabs.
     * otherwise indicate which segment of the body the dragged item would be dropped on
     *
     * @param x - Absolute Screen X
     * @param y - Absolute Screen Y
     * @internal
     */
    highlightDropZone(x: number, y: number): void;
    /** @internal */
    getArea(): ContentItem.Area | null;
    /**
     * Programmatically operate with header position.
     *
     * @param position -
     *
     * @returns previous header position
     * @internal
     */
    positionHeader(position: Side): void;
    /** @internal */
    private updateNodeSize;
    /** @internal */
    private highlightHeaderDropZone;
    /** @internal */
    private resetHeaderDropZone;
    /** @internal */
    private setupHeaderPosition;
    /** @internal */
    private highlightBodyDropZone;
    /** @internal */
    private handleResize;
    /** @internal */
    private handleMaximised;
    /** @internal */
    private handleMinimised;
    /** @internal */
    private handlePopoutEvent;
    /** @internal */
    private handleHeaderClickEvent;
    /** @internal */
    private handleHeaderTouchStartEvent;
    /** @internal */
    private handleHeaderComponentRemoveEvent;
    /** @internal */
    private handleHeaderComponentFocusEvent;
    /** @internal */
    private handleHeaderComponentStartDragEvent;
    /** @internal */
    private createHeaderConfig;
    /** @internal */
    private emitStateChangedEvent;
}
/** @public */
export declare namespace Stack {
    /** @internal */
    const enum Segment {
        Header = "header",
        Body = "body",
        Left = "left",
        Right = "right",
        Top = "top",
        Bottom = "bottom"
    }
    /** @internal */
    interface ContentAreaDimension {
        hoverArea: AreaLinkedRect;
        highlightArea: AreaLinkedRect;
    }
    /** @internal */
    type ContentAreaDimensions = {
        [segment: string]: ContentAreaDimension;
    };
    /** @internal */
    function createElement(document: Document): HTMLDivElement;
}
//# sourceMappingURL=stack.d.ts.map