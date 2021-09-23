import { ItemType, JsonValue, ResponsiveMode, Side } from '../utils/types';
/** @public */
export interface ResolvedItemConfig {
    readonly type: ItemType;
    readonly content: readonly ResolvedItemConfig[];
    readonly width: number;
    readonly minWidth: number;
    readonly height: number;
    readonly minHeight: number;
    readonly id: string;
    readonly isClosable: boolean;
}
/** @public */
export declare namespace ResolvedItemConfig {
    const defaults: ResolvedItemConfig;
    /** Creates a copy of the original ResolvedItemConfig using an alternative content if specified */
    function createCopy(original: ResolvedItemConfig, content?: ResolvedItemConfig[]): ResolvedItemConfig;
    function createDefault(type: ItemType): ResolvedItemConfig;
    function isComponentItem(itemConfig: ResolvedItemConfig): itemConfig is ResolvedComponentItemConfig;
    function isStackItem(itemConfig: ResolvedItemConfig): itemConfig is ResolvedStackItemConfig;
    /** @internal */
    function isGroundItem(itemConfig: ResolvedItemConfig): itemConfig is ResolvedGroundItemConfig;
}
/** @public */
export interface ResolvedHeaderedItemConfig extends ResolvedItemConfig {
    header: ResolvedHeaderedItemConfig.Header | undefined;
    readonly maximised: boolean;
}
/** @public */
export declare namespace ResolvedHeaderedItemConfig {
    const defaultMaximised = false;
    interface Header {
        readonly show: false | Side | undefined;
        readonly popout: false | string | undefined;
        readonly maximise: false | string | undefined;
        readonly close: string | undefined;
        readonly minimise: string | undefined;
        readonly tabDropdown: false | string | undefined;
    }
    namespace Header {
        function createCopy(original: Header | undefined, show?: false | Side): Header | undefined;
    }
}
/** @public */
export interface ResolvedStackItemConfig extends ResolvedHeaderedItemConfig {
    readonly type: 'stack';
    readonly content: ResolvedComponentItemConfig[];
    /** The index of the active item in the Stack.  Only undefined if the Stack is empty. */
    readonly activeItemIndex: number | undefined;
}
/** @public */
export declare namespace ResolvedStackItemConfig {
    const defaultActiveItemIndex = 0;
    function createCopy(original: ResolvedStackItemConfig, content?: ResolvedComponentItemConfig[]): ResolvedStackItemConfig;
    function copyContent(original: ResolvedComponentItemConfig[]): ResolvedComponentItemConfig[];
    function createDefault(): ResolvedStackItemConfig;
}
/** @public */
export interface ResolvedComponentItemConfig extends ResolvedHeaderedItemConfig {
    readonly type: 'component';
    readonly content: [];
    readonly title: string;
    readonly reorderEnabled: boolean;
    /**
     * The name of the component as specified in layout.registerComponent. Mandatory if type is 'component'.
     */
    readonly componentType: JsonValue;
    readonly componentState?: JsonValue;
}
/** @public */
export declare namespace ResolvedComponentItemConfig {
    const defaultReorderEnabled = true;
    function resolveComponentTypeName(itemConfig: ResolvedComponentItemConfig): string | undefined;
    function createCopy(original: ResolvedComponentItemConfig): ResolvedComponentItemConfig;
    function createDefault(componentType?: JsonValue, componentState?: JsonValue, title?: string): ResolvedComponentItemConfig;
    function copyComponentType(componentType: JsonValue): JsonValue;
}
/** Base for Root or RowOrColumn ItemConfigs
 * @public
 */
export interface ResolvedRowOrColumnItemConfig extends ResolvedItemConfig {
    readonly type: 'row' | 'column';
    /** Note that RowOrColumn ResolvedItemConfig contents, can contain ComponentItem itemConfigs.  However
     * when ContentItems are created, these ComponentItem itemConfigs will create a Stack with a child ComponentItem.
     */
    readonly content: readonly (ResolvedRowOrColumnItemConfig | ResolvedStackItemConfig | ResolvedComponentItemConfig)[];
}
/** @public */
export declare namespace ResolvedRowOrColumnItemConfig {
    type ChildItemConfig = ResolvedRowOrColumnItemConfig | ResolvedStackItemConfig | ResolvedComponentItemConfig;
    function isChildItemConfig(itemConfig: ResolvedItemConfig): itemConfig is ChildItemConfig;
    function createCopy(original: ResolvedRowOrColumnItemConfig, content?: ChildItemConfig[]): ResolvedRowOrColumnItemConfig;
    function copyContent(original: readonly ChildItemConfig[]): ChildItemConfig[];
    function createDefault(type: 'row' | 'column'): ResolvedRowOrColumnItemConfig;
}
/**
 * RootItemConfig is the topmost ResolvedItemConfig specified by the user.
 * Note that it does not have a corresponding contentItem.  It specifies the one and only child of the Ground ContentItem
 * Note that RootItemConfig can be an ComponentItem itemConfig.  However when the Ground ContentItem's child is created
 * a ComponentItem itemConfig will create a Stack with a child ComponentItem.
 * @public
*/
export declare type ResolvedRootItemConfig = ResolvedRowOrColumnItemConfig | ResolvedStackItemConfig | ResolvedComponentItemConfig;
/** @public */
export declare namespace ResolvedRootItemConfig {
    function createCopy(config: ResolvedRootItemConfig): ResolvedRootItemConfig;
    function isRootItemConfig(itemConfig: ResolvedItemConfig): itemConfig is ResolvedRootItemConfig;
}
/** @internal */
export interface ResolvedGroundItemConfig extends ResolvedItemConfig {
    readonly type: 'ground';
    readonly width: 100;
    readonly minWidth: 0;
    readonly height: 100;
    readonly minHeight: 0;
    readonly id: '';
    readonly isClosable: false;
    readonly title: '';
    readonly reorderEnabled: false;
}
/** @internal */
export declare namespace ResolvedGroundItemConfig {
    function create(rootItemConfig: ResolvedRootItemConfig | undefined): ResolvedGroundItemConfig;
}
/** @public */
export interface ResolvedLayoutConfig {
    readonly root: ResolvedRootItemConfig | undefined;
    readonly openPopouts: ResolvedPopoutLayoutConfig[];
    readonly dimensions: ResolvedLayoutConfig.Dimensions;
    readonly settings: ResolvedLayoutConfig.Settings;
    readonly header: ResolvedLayoutConfig.Header;
    readonly resolved: true;
}
/** @public */
export declare namespace ResolvedLayoutConfig {
    interface Settings {
        readonly constrainDragToContainer: boolean;
        readonly reorderEnabled: boolean;
        readonly popoutWholeStack: boolean;
        readonly blockedPopoutsThrowError: boolean;
        readonly closePopoutsOnUnload: boolean;
        readonly responsiveMode: ResponsiveMode;
        readonly tabOverlapAllowance: number;
        readonly reorderOnTabMenuClick: boolean;
        readonly tabControlOffset: number;
        readonly popInOnClose: boolean;
    }
    namespace Settings {
        const defaults: ResolvedLayoutConfig.Settings;
        function createCopy(original: Settings): Settings;
    }
    interface Dimensions {
        readonly borderWidth: number;
        readonly borderGrabWidth: number;
        readonly minItemHeight: number;
        readonly minItemWidth: number;
        readonly headerHeight: number;
        readonly dragProxyWidth: number;
        readonly dragProxyHeight: number;
    }
    namespace Dimensions {
        function createCopy(original: Dimensions): Dimensions;
        const defaults: ResolvedLayoutConfig.Dimensions;
    }
    interface Header {
        readonly show: false | Side;
        readonly popout: false | string;
        readonly dock: string;
        readonly maximise: false | string;
        readonly minimise: string;
        readonly close: false | string;
        readonly tabDropdown: false | string;
    }
    namespace Header {
        function createCopy(original: Header): Header;
        const defaults: ResolvedLayoutConfig.Header;
    }
    function isPopout(config: ResolvedLayoutConfig): config is ResolvedPopoutLayoutConfig;
    function createDefault(): ResolvedLayoutConfig;
    function createCopy(config: ResolvedLayoutConfig): ResolvedLayoutConfig;
    function copyOpenPopouts(original: ResolvedPopoutLayoutConfig[]): ResolvedPopoutLayoutConfig[];
    /**
     * Takes a GoldenLayout configuration object and
     * replaces its keys and values recursively with
     * one letter counterparts
     */
    function minifyConfig(layoutConfig: ResolvedLayoutConfig): ResolvedLayoutConfig;
    /**
     * Takes a configuration Object that was previously minified
     * using minifyConfig and returns its original version
     */
    function unminifyConfig(minifiedConfig: ResolvedLayoutConfig): ResolvedLayoutConfig;
}
/** @public */
export interface ResolvedPopoutLayoutConfig extends ResolvedLayoutConfig {
    readonly parentId: string | null;
    readonly indexInParent: number | null;
    readonly window: ResolvedPopoutLayoutConfig.Window;
}
/** @public */
export declare namespace ResolvedPopoutLayoutConfig {
    interface Window {
        readonly width: number | null;
        readonly height: number | null;
        readonly left: number | null;
        readonly top: number | null;
    }
    namespace Window {
        function createCopy(original: Window): Window;
        const defaults: ResolvedPopoutLayoutConfig.Window;
    }
    function createCopy(original: ResolvedPopoutLayoutConfig): ResolvedPopoutLayoutConfig;
}
//# sourceMappingURL=resolved-config.d.ts.map