import { ComponentItem } from './component-item';
import { ContentItem } from './content-item';
export declare abstract class ComponentParentableItem extends ContentItem {
    /** @internal */
    private _focused;
    get focused(): boolean;
    /** @internal */
    setFocusedValue(value: boolean): void;
    abstract setActiveComponentItem(item: ComponentItem, focus: boolean, suppressFocusEvent: boolean): void;
}
//# sourceMappingURL=component-parentable-item.d.ts.map