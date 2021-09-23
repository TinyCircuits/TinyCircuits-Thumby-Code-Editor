import { Header } from './header';
/** @internal */
export declare class HeaderButton {
    private _header;
    private _pushEvent;
    private _element;
    private _clickEventListener;
    private _touchStartEventListener;
    get element(): HTMLElement;
    constructor(_header: Header, label: string, cssClass: string, _pushEvent: HeaderButton.PushEvent);
    destroy(): void;
    private onClick;
    private onTouchStart;
}
/** @internal */
export declare namespace HeaderButton {
    type PushEvent = (this: void, ev: Event) => void;
}
//# sourceMappingURL=header-button.d.ts.map