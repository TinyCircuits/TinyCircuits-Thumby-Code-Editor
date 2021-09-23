import { ComponentItemConfig, RowOrColumnItemConfig, StackItemConfig } from '../config/config';
import { ResolvedRowOrColumnItemConfig } from '../config/resolved-config';
import { LayoutManager } from '../layout-manager';
import { JsonValue, WidthOrHeightPropertyName } from '../utils/types';
import { ComponentItem } from './component-item';
import { ContentItem } from './content-item';
/** @public */
export declare class RowOrColumn extends ContentItem {
    /** @internal */
    private _rowOrColumnParent;
    /** @internal */
    private readonly _childElementContainer;
    /** @internal */
    private readonly _configType;
    /** @internal */
    private readonly _isColumn;
    /** @internal */
    private readonly _splitterSize;
    /** @internal */
    private readonly _splitterGrabSize;
    /** @internal */
    private readonly _dimension;
    /** @internal */
    private readonly _splitter;
    /** @internal */
    private _splitterPosition;
    /** @internal */
    private _splitterMinPosition;
    /** @internal */
    private _splitterMaxPosition;
    /** @internal */
    constructor(isColumn: boolean, layoutManager: LayoutManager, config: ResolvedRowOrColumnItemConfig, 
    /** @internal */
    _rowOrColumnParent: ContentItem);
    newComponent(componentType: JsonValue, componentState?: JsonValue, title?: string, index?: number): ComponentItem;
    addComponent(componentType: JsonValue, componentState?: JsonValue, title?: string, index?: number): number;
    newItem(itemConfig: RowOrColumnItemConfig | StackItemConfig | ComponentItemConfig, index?: number): ContentItem;
    addItem(itemConfig: RowOrColumnItemConfig | StackItemConfig | ComponentItemConfig, index?: number): number;
    /**
     * Add a new contentItem to the Row or Column
     *
     * @param contentItem -
     * @param index - The position of the new item within the Row or Column.
     *                If no index is provided the item will be added to the end
     * @param suspendResize - If true the items won't be resized. This will leave the item in
     *                        an inconsistent state and is only intended to be used if multiple
     *                        children need to be added in one go and resize is called afterwards
     *
     * @returns
     */
    addChild(contentItem: ContentItem, index?: number, suspendResize?: boolean): number;
    /**
     * Removes a child of this element
     *
     * @param contentItem -
     * @param keepChild - If true the child will be removed, but not destroyed
     *
     */
    removeChild(contentItem: ContentItem, keepChild: boolean): void;
    /**
     * Replaces a child of this Row or Column with another contentItem
     */
    replaceChild(oldChild: ContentItem, newChild: ContentItem): void;
    /**
     * Called whenever the dimensions of this item or one of its parents change
     */
    updateSize(): void;
    /**
     * Invoked recursively by the layout manager. ContentItem.init appends
     * the contentItem's DOM elements to the container, RowOrColumn init adds splitters
     * in between them
     * @internal
     */
    init(): void;
    toConfig(): ResolvedRowOrColumnItemConfig;
    /** @internal */
    protected setParent(parent: ContentItem): void;
    /** @internal */
    private updateNodeSize;
    /**
     * Turns the relative sizes calculated by calculateRelativeSizes into
     * absolute pixel values and applies them to the children's DOM elements
     *
     * Assigns additional pixels to counteract Math.floor
     * @internal
     */
    private setAbsoluteSizes;
    /**
     * Calculates the absolute sizes of all of the children of this Item.
     * @returns Set with absolute sizes and additional pixels.
     * @internal
     */
    private calculateAbsoluteSizes;
    /**
     * Calculates the relative sizes of all children of this Item. The logic
     * is as follows:
     *
     * - Add up the total size of all items that have a configured size
     *
     * - If the total == 100 (check for floating point errors)
     *        Excellent, job done
     *
     * - If the total is \> 100,
     *        set the size of items without set dimensions to 1/3 and add this to the total
     *        set the size off all items so that the total is hundred relative to their original size
     *
     * - If the total is \< 100
     *        If there are items without set dimensions, distribute the remainder to 100 evenly between them
     *        If there are no items without set dimensions, increase all items sizes relative to
     *        their original size so that they add up to 100
     *
     * @internal
     */
    private calculateRelativeSizes;
    /**
     * Adjusts the column widths to respect the dimensions minItemWidth if set.
     * @internal
     */
    private respectMinItemWidth;
    /**
     * Instantiates a new Splitter, binds events to it and adds
     * it to the array of splitters at the position specified as the index argument
     *
     * What it doesn't do though is append the splitter to the DOM
     *
     * @param index - The position of the splitter
     *
     * @returns
     * @internal
     */
    private createSplitter;
    /**
     * Locates the instance of Splitter in the array of
     * registered splitters and returns a map containing the contentItem
     * before and after the splitters, both of which are affected if the
     * splitter is moved
     *
     * @returns A map of contentItems that the splitter affects
     * @internal
     */
    private getItemsForSplitter;
    /**
     * Gets the minimum dimensions for the given item configuration array
     * @internal
     */
    private getMinimumDimensions;
    /**
     * Invoked when a splitter's dragListener fires dragStart. Calculates the splitters
     * movement area once (so that it doesn't need calculating on every mousemove event)
     * @internal
     */
    private onSplitterDragStart;
    /**
     * Invoked when a splitter's DragListener fires drag. Updates the splitter's DOM position,
     * but not the sizes of the elements the splitter controls in order to minimize resize events
     *
     * @param splitter -
     * @param offsetX - Relative pixel values to the splitter's original position. Can be negative
     * @param offsetY - Relative pixel values to the splitter's original position. Can be negative
     * @internal
     */
    private onSplitterDrag;
    /**
     * Invoked when a splitter's DragListener fires dragStop. Resets the splitters DOM position,
     * and applies the new sizes to the elements before and after the splitter and their children
     * on the next animation frame
     * @internal
     */
    private onSplitterDragStop;
}
/** @public */
export declare namespace RowOrColumn {
    /** @internal */
    function getElementDimensionSize(element: HTMLElement, dimension: WidthOrHeightPropertyName): number;
    /** @internal */
    function setElementDimensionSize(element: HTMLElement, dimension: WidthOrHeightPropertyName, value: number): void;
    /** @internal */
    function createElement(document: Document, isColumn: boolean): HTMLDivElement;
}
//# sourceMappingURL=row-or-column.d.ts.map