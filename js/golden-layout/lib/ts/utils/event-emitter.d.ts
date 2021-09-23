import { BrowserPopout } from '../controls/browser-popout';
import { Tab } from '../controls/tab';
import { ComponentItem } from '../items/component-item';
/**
 * A generic and very fast EventEmitter implementation. On top of emitting the actual event it emits an
 * {@link (EventEmitter:namespace).ALL_EVENT} event for every event triggered. This allows to hook into it and proxy events forwards
 * @public
 */
export declare class EventEmitter {
    /** @internal */
    private _allEventSubscriptions;
    /** @internal */
    private _subscriptionsMap;
    tryBubbleEvent(name: string, args: unknown[]): void;
    /**
     * Emit an event and notify listeners
     *
     * @param eventName - The name of the event
     * @param args - Additional arguments that will be passed to the listener
     */
    emit<K extends keyof EventEmitter.EventParamsMap>(eventName: K, ...args: EventEmitter.EventParamsMap[K]): void;
    /** @internal */
    emitUnknown(eventName: string, ...args: EventEmitter.UnknownParams): void;
    emitBaseBubblingEvent<K extends keyof EventEmitter.EventParamsMap>(eventName: K): void;
    /** @internal */
    emitUnknownBubblingEvent(eventName: string): void;
    /**
     * Removes a listener for an event.
     * @param eventName - The name of the event
     * @param callback - The previously registered callback method (optional)
     */
    removeEventListener<K extends keyof EventEmitter.EventParamsMap>(eventName: K, callback: EventEmitter.Callback<K>): void;
    off<K extends keyof EventEmitter.EventParamsMap>(eventName: K, callback: EventEmitter.Callback<K>): void;
    /**
     * Alias for off
     */
    unbind: <K extends keyof EventEmitter.EventParamsMap>(eventName: K, callback: EventEmitter.Callback<K>) => void;
    /**
     * Alias for emit
     */
    trigger: <K extends keyof EventEmitter.EventParamsMap>(eventName: K, ...args: EventEmitter.EventParamsMap[K]) => void;
    /**
     * Listen for events
     *
     * @param eventName - The name of the event to listen to
     * @param callback - The callback to execute when the event occurs
     */
    addEventListener<K extends keyof EventEmitter.EventParamsMap>(eventName: K, callback: EventEmitter.Callback<K>): void;
    on<K extends keyof EventEmitter.EventParamsMap>(eventName: K, callback: EventEmitter.Callback<K>): void;
    /** @internal */
    private addUnknownEventListener;
    /** @internal */
    private removeUnknownEventListener;
    /** @internal */
    private removeSubscription;
    /** @internal */
    private emitAllEvent;
}
/** @public */
export declare namespace EventEmitter {
    /**
     * The name of the event that's triggered for every event
     */
    const ALL_EVENT = "__all";
    const headerClickEventName = "stackHeaderClick";
    const headerTouchStartEventName = "stackHeaderTouchStart";
    /** @internal */
    type UnknownCallback = (this: void, ...args: UnknownParams) => void;
    type Callback<K extends keyof EventEmitter.EventParamsMap> = (this: void, ...args: EventParamsMap[K]) => void;
    interface EventParamsMap {
        "__all": UnknownParams;
        "activeContentItemChanged": ComponentItemParam;
        "close": NoParams;
        "closed": NoParams;
        "destroy": NoParams;
        "drag": DragParams;
        "dragStart": DragStartParams;
        "dragStop": DragStopParams;
        "hide": NoParams;
        "initialised": NoParams;
        "itemDropped": ComponentItemParam;
        "maximised": NoParams;
        "minimised": NoParams;
        "open": NoParams;
        "popIn": NoParams;
        "resize": NoParams;
        "show": NoParams;
        /** @deprecated - use show instead */
        "shown": NoParams;
        "stateChanged": NoParams;
        "tab": TabParam;
        "tabCreated": TabParam;
        "titleChanged": StringParam;
        "windowClosed": PopoutParam;
        "windowOpened": PopoutParam;
        "beforeComponentRelease": BeforeComponentReleaseParams;
        "beforeItemDestroyed": BubblingEventParam;
        "itemCreated": BubblingEventParam;
        "itemDestroyed": BubblingEventParam;
        "focus": BubblingEventParam;
        "blur": BubblingEventParam;
        "stackHeaderClick": ClickBubblingEventParam;
        "stackHeaderTouchStart": TouchStartBubblingEventParam;
        "userBroadcast": UnknownParams;
    }
    type UnknownParams = unknown[];
    type NoParams = [];
    type UnknownParam = [unknown];
    type PopoutParam = [BrowserPopout];
    type ComponentItemParam = [ComponentItem];
    type TabParam = [Tab];
    type BubblingEventParam = [EventEmitter.BubblingEvent];
    type StringParam = [string];
    type DragStartParams = [originalX: number, originalY: number];
    type DragStopParams = [event: PointerEvent | undefined];
    type DragParams = [offsetX: number, offsetY: number, event: PointerEvent];
    type BeforeComponentReleaseParams = [component: unknown];
    type ClickBubblingEventParam = [ClickBubblingEvent];
    type TouchStartBubblingEventParam = [TouchStartBubblingEvent];
    class BubblingEvent {
        /** @internal */
        private readonly _name;
        /** @internal */
        private readonly _target;
        /** @internal */
        private _isPropagationStopped;
        get name(): string;
        get target(): EventEmitter;
        /** @deprecated Use {@link (EventEmitter:namespace).(BubblingEvent:class).target} instead */
        get origin(): EventEmitter;
        get isPropagationStopped(): boolean;
        /** @internal */
        constructor(
        /** @internal */
        _name: string, 
        /** @internal */
        _target: EventEmitter);
        stopPropagation(): void;
    }
    class ClickBubblingEvent extends BubblingEvent {
        /** @internal */
        private readonly _mouseEvent;
        get mouseEvent(): MouseEvent;
        /** @internal */
        constructor(name: string, target: EventEmitter, 
        /** @internal */
        _mouseEvent: MouseEvent);
    }
    class TouchStartBubblingEvent extends BubblingEvent {
        /** @internal */
        private readonly _touchEvent;
        get touchEvent(): TouchEvent;
        /** @internal */
        constructor(name: string, target: EventEmitter, 
        /** @internal */
        _touchEvent: TouchEvent);
    }
}
//# sourceMappingURL=event-emitter.d.ts.map