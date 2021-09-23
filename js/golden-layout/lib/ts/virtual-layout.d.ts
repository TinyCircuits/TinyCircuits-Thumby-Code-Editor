import { LayoutConfig } from './config/config';
import { ResolvedComponentItemConfig } from './config/resolved-config';
import { ComponentContainer } from './container/component-container';
import { LayoutManager } from './layout-manager';
/** @public */
export declare class VirtualLayout extends LayoutManager {
    /** @internal */
    private _subWindowsCreated;
    /** @internal */
    private _creationTimeoutPassed;
    /**
     * @deprecated Use {@link (VirtualLayout:class).bindComponentEvent} and
     * {@link (VirtualLayout:class).unbindComponentEvent} with virtual components
     */
    getComponentEvent: VirtualLayout.GetComponentEventHandler | undefined;
    /**
     * @deprecated Use {@link (VirtualLayout:class).bindComponentEvent} and
     * {@link (VirtualLayout:class).unbindComponentEvent} with virtual components
     */
    releaseComponentEvent: VirtualLayout.ReleaseComponentEventHandler | undefined;
    bindComponentEvent: VirtualLayout.BindComponentEventHandler | undefined;
    unbindComponentEvent: VirtualLayout.UnbindComponentEventHandler | undefined;
    /**
    * @param container - A Dom HTML element. Defaults to body
    */
    constructor(container?: HTMLElement, bindComponentEventHandler?: VirtualLayout.BindComponentEventHandler, unbindComponentEventHandler?: VirtualLayout.UnbindComponentEventHandler);
    /** @deprecated specify layoutConfig in {@link (LayoutManager:class).loadLayout} */
    constructor(config: LayoutConfig, container?: HTMLElement);
    destroy(): void;
    /**
     * Creates the actual layout. Must be called after all initial components
     * are registered. Recurses through the configuration and sets up
     * the item tree.
     *
     * If called before the document is ready it adds itself as a listener
     * to the document.ready event
     * @deprecated LayoutConfig should not be loaded in {@link (LayoutManager:class)} constructor, but rather in a
     * {@link (LayoutManager:class).loadLayout} call.  If LayoutConfig is not specified in {@link (LayoutManager:class)} constructor,
     * then init() will be automatically called internally and should not be called externally.
     */
    init(): void;
    /** @internal */
    bindComponent(container: ComponentContainer, itemConfig: ResolvedComponentItemConfig): ComponentContainer.BindableComponent;
    /** @internal */
    unbindComponent(container: ComponentContainer, virtual: boolean, component: ComponentContainer.Component | undefined): void;
    /**
     * Creates Subwindows (if there are any). Throws an error
     * if popouts are blocked.
     * @internal
     */
    private createSubWindows;
    /**
     * This is executed when GoldenLayout detects that it is run
     * within a previously opened popout window.
     * @internal
     */
    private adjustToWindowMode;
}
/** @public */
export declare namespace VirtualLayout {
    /**
     * @deprecated Use virtual components with {@link (VirtualLayout:class).bindComponentEvent} and
     * {@link (VirtualLayout:class).unbindComponentEvent} events.
     */
    type GetComponentEventHandler = (this: void, container: ComponentContainer, itemConfig: ResolvedComponentItemConfig) => ComponentContainer.Component;
    /**
     * @deprecated Use virtual components with {@link (VirtualLayout:class).bindComponentEvent} and
     * {@link (VirtualLayout:class).unbindComponentEvent} events.
     */
    type ReleaseComponentEventHandler = (this: void, container: ComponentContainer, component: ComponentContainer.Component) => void;
    type BindComponentEventHandler = (this: void, container: ComponentContainer, itemConfig: ResolvedComponentItemConfig) => ComponentContainer.BindableComponent;
    type UnbindComponentEventHandler = (this: void, container: ComponentContainer) => void;
    type BeforeVirtualRectingEvent = (this: void) => void;
    /** @internal */
    function createLayoutManagerConstructorParameters(configOrOptionalContainer: LayoutConfig | HTMLElement | undefined, containerOrBindComponentEventHandler?: HTMLElement | VirtualLayout.BindComponentEventHandler): LayoutManager.ConstructorParameters;
}
//# sourceMappingURL=virtual-layout.d.ts.map