import { ComponentItemConfig, RowOrColumnItemConfig, StackItemConfig } from '../config/config';
import { ResolvedItemConfig, ResolvedRootItemConfig } from '../config/resolved-config';
import { LayoutManager } from '../layout-manager';
import { AreaLinkedRect } from '../utils/types';
import { ComponentItem } from './component-item';
import { ComponentParentableItem } from './component-parentable-item';
import { ContentItem } from './content-item';
/**
 * GroundItem is the ContentItem whose one child is the root ContentItem (Root is planted in Ground).
 * (Previously it was called root however this was incorrect as its child is the root item)
 * There is only one instance of GroundItem and it is automatically created by the Layout Manager
 * @internal
 */
export declare class GroundItem extends ComponentParentableItem {
    private readonly _childElementContainer;
    private readonly _containerElement;
    constructor(layoutManager: LayoutManager, rootItemConfig: ResolvedRootItemConfig | undefined, containerElement: HTMLElement);
    init(): void;
    /**
     * Loads a new Layout
     * Internal only.  To load a new layout with API, use {@link (LayoutManager:class).loadLayout}
     */
    loadRoot(rootItemConfig: ResolvedRootItemConfig | undefined): void;
    clearRoot(): void;
    /**
     * Adds a ContentItem child to root ContentItem.
     * Internal only.  To load a add with API, use {@link (LayoutManager:class).addItem}
     * @returns -1 if added as root otherwise index in root ContentItem's content
     */
    addItem(itemConfig: RowOrColumnItemConfig | StackItemConfig | ComponentItemConfig, index?: number): number;
    loadComponentAsRoot(itemConfig: ComponentItemConfig): void;
    /**
     * Adds a Root ContentItem.
     * Internal only.  To replace Root ContentItem with API, use {@link (LayoutManager:class).loadLayout}
     */
    addChild(contentItem: ContentItem, index?: number): number;
    /** @internal */
    calculateConfigContent(): ResolvedRootItemConfig[];
    /** @internal */
    setSize(width: number, height: number): void;
    /**
     * Adds a Root ContentItem.
     * Internal only.  To replace Root ContentItem with API, use {@link (LayoutManager:class).updateRootSize}
     */
    updateSize(): void;
    createSideAreas(): GroundItem.Area[];
    highlightDropZone(x: number, y: number, area: AreaLinkedRect): void;
    onDrop(contentItem: ContentItem, area: GroundItem.Area): void;
    dock(): void;
    validateDocking(): void;
    getAllContentItems(): ContentItem[];
    getConfigMaximisedItems(): ContentItem[];
    getItemsByPopInParentId(popInParentId: string): ContentItem[];
    toConfig(): ResolvedItemConfig;
    setActiveComponentItem(item: ComponentItem, focus: boolean, suppressFocusEvent: boolean): void;
    private updateNodeSize;
    private deepGetAllContentItems;
    private deepFilterContentItems;
}
/** @internal */
export declare namespace GroundItem {
    interface Area extends ContentItem.Area {
        side: keyof typeof Area.Side;
    }
    namespace Area {
        const enum Side {
            y2 = 0,
            x2 = 1,
            y1 = 2,
            x1 = 3
        }
        type Sides = {
            [side in keyof typeof Side]: keyof typeof Side;
        };
        const oppositeSides: Sides;
    }
    function createElement(document: Document): HTMLDivElement;
}
//# sourceMappingURL=ground-item.d.ts.map