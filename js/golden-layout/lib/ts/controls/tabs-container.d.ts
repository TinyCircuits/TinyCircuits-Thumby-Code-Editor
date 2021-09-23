import { ComponentItem } from '../items/component-item';
import { LayoutManager } from '../layout-manager';
import { DragListener } from '../utils/drag-listener';
import { Tab } from './tab';
/** @internal */
export declare class TabsContainer {
    private _layoutManager;
    private _componentRemoveEvent;
    private _componentFocusEvent;
    private _componentDragStartEvent;
    private _dropdownActiveChangedEvent;
    private readonly _tabs;
    private readonly _dropdownElement;
    private readonly _element;
    private _lastVisibleTabIndex;
    private _dropdownActive;
    get tabs(): Tab[];
    get tabCount(): number;
    get lastVisibleTabIndex(): number;
    get element(): HTMLElement;
    get dropdownElement(): HTMLElement;
    get dropdownActive(): boolean;
    constructor(_layoutManager: LayoutManager, _componentRemoveEvent: TabsContainer.ComponentItemRemoveEvent, _componentFocusEvent: TabsContainer.ComponentItemFocusEvent, _componentDragStartEvent: TabsContainer.ComponentItemDragStartEvent, _dropdownActiveChangedEvent: TabsContainer.DropdownActiveChangedEvent);
    destroy(): void;
    /**
     * Creates a new tab and associates it with a contentItem
     * @param index - The position of the tab
     */
    createTab(componentItem: ComponentItem, index: number): void;
    removeTab(componentItem: ComponentItem): void;
    processActiveComponentChanged(newActiveComponentItem: ComponentItem): void;
    /**
     * Pushes the tabs to the tab dropdown if the available space is not sufficient
     */
    updateTabSizes(availableWidth: number, activeComponentItem: ComponentItem | undefined): void;
    tryUpdateTabSizes(dropdownActive: boolean, availableWidth: number, activeComponentItem: ComponentItem | undefined): boolean;
    /**
     * Shows drop down for additional tabs when there are too many to display.
     */
    showAdditionalTabsDropdown(): void;
    /**
     * Hides drop down for additional tabs when there are too many to display.
     */
    hideAdditionalTabsDropdown(): void;
    private handleTabCloseEvent;
    private handleTabFocusEvent;
    private handleTabDragStartEvent;
}
/** @internal */
export declare namespace TabsContainer {
    type ComponentItemRemoveEvent = (this: void, componentItem: ComponentItem) => void;
    type ComponentItemFocusEvent = (this: void, componentItem: ComponentItem) => void;
    type ComponentItemDragStartEvent = (this: void, x: number, y: number, dragListener: DragListener, componentItem: ComponentItem) => void;
    type DropdownActiveChangedEvent = (this: void) => void;
}
//# sourceMappingURL=tabs-container.d.ts.map