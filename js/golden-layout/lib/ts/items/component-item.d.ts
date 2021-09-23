import { ResolvedComponentItemConfig, ResolvedHeaderedItemConfig } from '../config/resolved-config';
import { ComponentContainer } from '../container/component-container';
import { Tab } from '../controls/tab';
import { LayoutManager } from '../layout-manager';
import { JsonValue } from '../utils/types';
import { ComponentParentableItem } from './component-parentable-item';
import { ContentItem } from './content-item';
/** @public */
export declare class ComponentItem extends ContentItem {
    /** @internal */
    private _parentItem;
    /** @internal */
    private _reorderEnabled;
    /** @internal */
    private _headerConfig;
    /** @internal */
    private _title;
    /** @internal */
    private readonly _initialWantMaximise;
    /** @internal */
    private _container;
    /** @internal */
    private _tab;
    /** @internal */
    private _focused;
    /** @internal @deprecated use {@link (ComponentItem:class).componentType} */
    get componentName(): JsonValue;
    get componentType(): JsonValue;
    get reorderEnabled(): boolean;
    /** @internal */
    get initialWantMaximise(): boolean;
    get component(): ComponentContainer.Component | undefined;
    get container(): ComponentContainer;
    get parentItem(): ComponentParentableItem;
    get headerConfig(): ResolvedHeaderedItemConfig.Header | undefined;
    get title(): string;
    get tab(): Tab;
    get focused(): boolean;
    /** @internal */
    constructor(layoutManager: LayoutManager, config: ResolvedComponentItemConfig, 
    /** @internal */
    _parentItem: ComponentParentableItem);
    /** @internal */
    destroy(): void;
    applyUpdatableConfig(config: ResolvedComponentItemConfig): void;
    toConfig(): ResolvedComponentItemConfig;
    close(): void;
    /** @internal */
    enterDragMode(width: number, height: number): void;
    /** @internal */
    exitDragMode(): void;
    /** @internal */
    enterStackMaximised(): void;
    /** @internal */
    exitStackMaximised(): void;
    /** @internal */
    drag(): void;
    /** @internal */
    updateSize(): void;
    /** @internal */
    init(): void;
    /**
     * Set this component's title
     *
     * @public
     * @param title -
     */
    setTitle(title: string): void;
    setTab(tab: Tab): void;
    /** @internal */
    hide(): void;
    /** @internal */
    show(): void;
    /**
     * Focuses the item if it is not already focused
     */
    focus(suppressEvent?: boolean): void;
    /** @internal */
    setFocused(suppressEvent: boolean): void;
    /**
     * Blurs (defocuses) the item if it is focused
     */
    blur(suppressEvent?: boolean): void;
    /** @internal */
    setBlurred(suppressEvent: boolean): void;
    /** @internal */
    protected setParent(parent: ContentItem): void;
    /** @internal */
    private handleUpdateItemConfigEvent;
    /** @internal */
    private updateNodeSize;
}
/** @public @deprecated use {@link (ComponentItem:class)} */
export declare type Component = ComponentItem;
/** @public */
export declare namespace ComponentItem {
    type Component = ComponentContainer.Component;
}
//# sourceMappingURL=component-item.d.ts.map