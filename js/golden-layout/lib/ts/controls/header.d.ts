import { ComponentItem } from '../items/component-item';
import { ContentItem } from '../items/content-item';
import { Stack } from '../items/stack';
import { LayoutManager } from '../layout-manager';
import { DragListener } from '../utils/drag-listener';
import { EventEmitter } from '../utils/event-emitter';
import { Side } from '../utils/types';
import { Tab } from './tab';
/**
 * This class represents a header above a Stack ContentItem.
 * @public
 */
export declare class Header extends EventEmitter {
    /** @internal */
    private _layoutManager;
    /** @internal */
    private _parent;
    /** @internal */
    private readonly _configClosable;
    /** @internal */
    private _getActiveComponentItemEvent;
    /** @internal */
    private _popoutEvent;
    /** @internal */
    private _maximiseToggleEvent;
    /** @internal */
    private _clickEvent;
    /** @internal */
    private _touchStartEvent;
    /** @internal */
    private _componentRemoveEvent;
    /** @internal */
    private _componentFocusEvent;
    /** @internal */
    private _componentDragStartEvent;
    /** @internal */
    private readonly _tabsContainer;
    /** @internal */
    private readonly _element;
    /** @internal */
    private readonly _controlsContainerElement;
    /** @internal */
    private readonly _show;
    /** @internal */
    private readonly _popoutEnabled;
    /** @internal */
    private readonly _popoutLabel;
    /** @internal */
    private readonly _maximiseEnabled;
    /** @internal */
    private readonly _maximiseLabel;
    /** @internal */
    private readonly _minimiseEnabled;
    /** @internal */
    private readonly _minimiseLabel;
    /** @internal */
    private readonly _closeEnabled;
    /** @internal */
    private readonly _closeLabel;
    /** @internal */
    private readonly _tabDropdownEnabled;
    /** @internal */
    private readonly _tabDropdownLabel;
    /** @internal */
    private readonly _tabControlOffset;
    /** @internal */
    private readonly _clickListener;
    /** @internal */
    private readonly _touchStartListener;
    /** @internal */
    private readonly _documentMouseUpListener;
    /** @internal */
    private _rowColumnClosable;
    /** @internal */
    private _canRemoveComponent;
    /** @internal */
    private _side;
    /** @internal */
    private _leftRightSided;
    /** @internal */
    private readonly _closeButton;
    /** @internal */
    private readonly _popoutButton;
    /** @internal */
    private readonly _tabDropdownButton;
    /** @internal */
    private readonly _maximiseButton;
    /** @internal */
    get show(): boolean;
    /** @internal */
    get side(): Side;
    /** @internal */
    get leftRightSided(): boolean;
    get layoutManager(): LayoutManager;
    get parent(): Stack;
    get tabs(): Tab[];
    get lastVisibleTabIndex(): number;
    /**
     * @deprecated use {@link (Stack:class).getActiveComponentItem} */
    get activeContentItem(): ContentItem | null;
    get element(): HTMLElement;
    /** @deprecated use {@link (Header:class).tabsContainerElement} */
    get tabsContainer(): HTMLElement;
    get tabsContainerElement(): HTMLElement;
    get controlsContainerElement(): HTMLElement;
    /** @deprecated use {@link (Header:class).controlsContainerElement} */
    get controlsContainer(): HTMLElement;
    /** @internal */
    constructor(
    /** @internal */
    _layoutManager: LayoutManager, 
    /** @internal */
    _parent: Stack, settings: Header.Settings, 
    /** @internal */
    _configClosable: boolean, 
    /** @internal */
    _getActiveComponentItemEvent: Header.GetActiveComponentItemEvent, closeEvent: Header.CloseEvent, 
    /** @internal */
    _popoutEvent: Header.PopoutEvent | undefined, 
    /** @internal */
    _maximiseToggleEvent: Header.MaximiseToggleEvent | undefined, 
    /** @internal */
    _clickEvent: Header.ClickEvent | undefined, 
    /** @internal */
    _touchStartEvent: Header.TouchStartEvent | undefined, 
    /** @internal */
    _componentRemoveEvent: Header.ComponentRemoveEvent | undefined, 
    /** @internal */
    _componentFocusEvent: Header.ComponentFocusEvent | undefined, 
    /** @internal */
    _componentDragStartEvent: Header.ComponentDragStartEvent | undefined);
    /**
     * Destroys the entire header
     * @internal
     */
    destroy(): void;
    /**
     * Creates a new tab and associates it with a contentItem
     * @param index - The position of the tab
     * @internal
     */
    createTab(componentItem: ComponentItem, index: number): void;
    /**
     * Finds a tab based on the contentItem its associated with and removes it.
     * Cannot remove tab if it has the active ComponentItem
     * @internal
     */
    removeTab(componentItem: ComponentItem): void;
    /** @internal */
    processActiveComponentChanged(newActiveComponentItem: ComponentItem): void;
    /** @internal */
    setSide(value: Side): void;
    /**
     * Programmatically set closability.
     * @param value - Whether to enable/disable closability.
     * @returns Whether the action was successful
     * @internal
     */
    setRowColumnClosable(value: boolean): void;
    /**
     * Updates the header's closability. If a stack/header is able
     * to close, but has a non closable component added to it, the stack is no
     * longer closable until all components are closable.
     * @internal
     */
    updateClosability(): void;
    /** @internal */
    applyFocusedValue(value: boolean): void;
    /** @internal */
    processMaximised(): void;
    /** @internal */
    processMinimised(): void;
    /**
     * Pushes the tabs to the tab dropdown if the available space is not sufficient
     * @internal
     */
    updateTabSizes(): void;
    /** @internal */
    private handleTabInitiatedComponentRemoveEvent;
    /** @internal */
    private handleTabInitiatedComponentFocusEvent;
    /** @internal */
    private handleTabInitiatedDragStartEvent;
    /** @internal */
    private processTabDropdownActiveChanged;
    /** @internal */
    private handleButtonPopoutEvent;
    /** @internal */
    private handleButtonMaximiseToggleEvent;
    /**
     * Invoked when the header's background is clicked (not it's tabs or controls)
     * @internal
     */
    private onClick;
    /**
     * Invoked when the header's background is touched (not it's tabs or controls)
     * @internal
     */
    private onTouchStart;
    /** @internal */
    private notifyClick;
    /** @internal */
    private notifyTouchStart;
}
/** @public */
export declare namespace Header {
    /** @internal */
    type GetActiveComponentItemEvent = (this: void) => ComponentItem | undefined;
    /** @internal */
    type CloseEvent = (this: void) => void;
    /** @internal */
    type PopoutEvent = (this: void) => void;
    /** @internal */
    type MaximiseToggleEvent = (this: void) => void;
    /** @internal */
    type ClickEvent = (this: void, ev: MouseEvent) => void;
    /** @internal */
    type TouchStartEvent = (this: void, ev: TouchEvent) => void;
    /** @internal */
    type ComponentRemoveEvent = (this: void, componentItem: ComponentItem) => void;
    /** @internal */
    type ComponentFocusEvent = (this: void, componentItem: ComponentItem) => void;
    /** @internal */
    type ComponentDragStartEvent = (this: void, x: number, y: number, dragListener: DragListener, componentItem: ComponentItem) => void;
    /** @internal */
    type StateChangedEvent = (this: void) => void;
    /** @internal */
    interface Settings {
        show: boolean;
        side: Side;
        popoutEnabled: boolean;
        popoutLabel: string;
        maximiseEnabled: boolean;
        maximiseLabel: string;
        minimiseEnabled: boolean;
        minimiseLabel: string;
        closeEnabled: boolean;
        closeLabel: string;
        tabDropdownEnabled: boolean;
        tabDropdownLabel: string;
    }
}
//# sourceMappingURL=header.d.ts.map