import { ComponentItemConfig } from '../config/config';
import { ResolvedComponentItemConfig } from '../config/resolved-config';
import { Tab } from '../controls/tab';
import { ComponentItem } from '../items/component-item';
import { LayoutManager } from '../layout-manager';
import { EventEmitter } from '../utils/event-emitter';
import { JsonValue, LogicalZIndex } from '../utils/types';
/** @public */
export declare class ComponentContainer extends EventEmitter {
    /** @internal */
    private readonly _config;
    /** @internal */
    private readonly _parent;
    /** @internal */
    private readonly _layoutManager;
    /** @internal */
    private readonly _element;
    /** @internal */
    private readonly _updateItemConfigEvent;
    /** @internal */
    private readonly _showEvent;
    /** @internal */
    private readonly _hideEvent;
    /** @internal */
    private readonly _focusEvent;
    /** @internal */
    private readonly _blurEvent;
    /** @internal */
    private _componentType;
    /** @internal */
    private _boundComponent;
    /** @internal */
    private _width;
    /** @internal */
    private _height;
    /** @internal */
    private _isClosable;
    /** @internal */
    private _initialState;
    /** @internal */
    private _state;
    /** @internal */
    private _visible;
    /** @internal */
    private _isShownWithZeroDimensions;
    /** @internal */
    private _tab;
    /** @internal */
    private _stackMaximised;
    stateRequestEvent: ComponentContainer.StateRequestEventHandler | undefined;
    virtualRectingRequiredEvent: ComponentContainer.VirtualRectingRequiredEvent | undefined;
    virtualVisibilityChangeRequiredEvent: ComponentContainer.VirtualVisibilityChangeRequiredEvent | undefined;
    virtualZIndexChangeRequiredEvent: ComponentContainer.VirtualZIndexChangeRequiredEvent | undefined;
    get width(): number;
    get height(): number;
    get parent(): ComponentItem;
    /** @internal @deprecated use {@link (ComponentContainer:class).componentType} */
    get componentName(): JsonValue;
    get componentType(): JsonValue;
    get virtual(): boolean;
    get component(): ComponentContainer.Component;
    get tab(): Tab;
    get title(): string;
    get layoutManager(): LayoutManager;
    get isHidden(): boolean;
    get visible(): boolean;
    get state(): JsonValue | undefined;
    /** Return the initial component state */
    get initialState(): JsonValue | undefined;
    /** The inner DOM element where the container's content is intended to live in */
    get element(): HTMLElement;
    /** @internal */
    constructor(
    /** @internal */
    _config: ResolvedComponentItemConfig, 
    /** @internal */
    _parent: ComponentItem, 
    /** @internal */
    _layoutManager: LayoutManager, 
    /** @internal */
    _element: HTMLElement, 
    /** @internal */
    _updateItemConfigEvent: ComponentContainer.UpdateItemConfigEventHandler, 
    /** @internal */
    _showEvent: ComponentContainer.ShowEventHandler, 
    /** @internal */
    _hideEvent: ComponentContainer.HideEventHandler, 
    /** @internal */
    _focusEvent: ComponentContainer.FocusEventHandler, 
    /** @internal */
    _blurEvent: ComponentContainer.BlurEventHandler);
    /** @internal */
    destroy(): void;
    /** @deprecated use {@link (ComponentContainer:class).element } */
    getElement(): HTMLElement;
    /**
     * Hides the container's component item (and hence, the container) if not already hidden.
     * Emits hide event prior to hiding the container.
     */
    hide(): void;
    /**
     * Shows the container's component item (and hence, the container) if not visible.
     * Emits show event prior to hiding the container.
     */
    show(): void;
    /**
     * Focus this component in Layout.
     */
    focus(suppressEvent?: boolean): void;
    /**
     * Remove focus from this component in Layout.
     */
    blur(suppressEvent?: boolean): void;
    /**
     * Set the size from within the container. Traverses up
     * the item tree until it finds a row or column element
     * and resizes its items accordingly.
     *
     * If this container isn't a descendant of a row or column
     * it returns false
     * @param width - The new width in pixel
     * @param height - The new height in pixel
     *
     * @returns resizeSuccesful
     *
     * @internal
     */
    setSize(width: number, height: number): boolean;
    /**
     * Closes the container if it is closable. Can be called by
     * both the component within at as well as the contentItem containing
     * it. Emits a close event before the container itself is closed.
     */
    close(): void;
    /** Replaces component without affecting layout */
    replaceComponent(itemConfig: ComponentItemConfig): void;
    /**
     * Returns the initial component state or the latest passed in setState()
     * @returns state
     * @deprecated Use {@link (ComponentContainer:class).initialState}
     */
    getState(): JsonValue | undefined;
    /**
     * Merges the provided state into the current one
     * @deprecated Use {@link (ComponentContainer:class).stateRequestEvent}
     */
    extendState(state: Record<string, unknown>): void;
    /**
     * Sets the component state
     * @deprecated Use {@link (ComponentContainer:class).stateRequestEvent}
     */
    setState(state: JsonValue): void;
    /**
     * Set's the components title
     */
    setTitle(title: string): void;
    /** @internal */
    setTab(tab: Tab): void;
    /** @internal */
    setVisibility(value: boolean): void;
    /**
     * Set the container's size, but considered temporary (for dragging)
     * so don't emit any events.
     * @internal
     */
    enterDragMode(width: number, height: number): void;
    /** @internal */
    exitDragMode(): void;
    /** @internal */
    enterStackMaximised(): void;
    /** @internal */
    exitStackMaximised(): void;
    /** @internal */
    drag(): void;
    /**
     * Sets the container's size. Called by the container's component item.
     * To instead set the size programmatically from within the component itself,
     * use the public setSize method
     * @param width - in px
     * @param height - in px
     * @param force - set even if no change
     * @internal
     */
    setSizeToNodeSize(width: number, height: number, force: boolean): void;
    /** @internal */
    notifyVirtualRectingRequired(): void;
    /** @internal */
    private updateElementPositionPropertyFromBoundComponent;
    /** @internal */
    private addVirtualSizedContainerToLayoutManager;
    /** @internal */
    private checkShownFromZeroDimensions;
    /** @internal */
    private emitShow;
    /** @internal */
    private emitHide;
    /** @internal */
    private releaseComponent;
}
/** @public @deprecated use {@link ComponentContainer} */
export declare type ItemContainer = ComponentContainer;
/** @public */
export declare namespace ComponentContainer {
    type Component = unknown;
    interface BindableComponent {
        component: Component;
        virtual: boolean;
    }
    type StateRequestEventHandler = (this: void) => JsonValue | undefined;
    type VirtualRectingRequiredEvent = (this: void, container: ComponentContainer, width: number, height: number) => void;
    type VirtualVisibilityChangeRequiredEvent = (this: void, container: ComponentContainer, visible: boolean) => void;
    type VirtualZIndexChangeRequiredEvent = (this: void, container: ComponentContainer, logicalZIndex: LogicalZIndex, defaultZIndex: string) => void;
    /** @internal */
    type ShowEventHandler = (this: void) => void;
    /** @internal */
    type HideEventHandler = (this: void) => void;
    /** @internal */
    type FocusEventHandler = (this: void, suppressEvent: boolean) => void;
    /** @internal */
    type BlurEventHandler = (this: void, suppressEvent: boolean) => void;
    /** @internal */
    type UpdateItemConfigEventHandler = (itemConfig: ResolvedComponentItemConfig) => void;
}
//# sourceMappingURL=component-container.d.ts.map