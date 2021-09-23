import { LayoutManager } from '../layout-manager';
import { EventEmitter } from './event-emitter';
/** @public */
declare global {
    interface WindowEventMap {
        [EventHub.ChildEventName]: CustomEvent<EventHub.ChildEventDetail>;
    }
}
/**
 * An EventEmitter singleton that propagates events
 * across multiple windows. This is a little bit trickier since
 * windows are allowed to open childWindows in their own right.
 *
 * This means that we deal with a tree of windows. Therefore, we do the event propagation in two phases:
 *
 * - Propagate events from this layout to the parent layout
 *   - Repeat until the event arrived at the root layout
 * - Propagate events to this layout and to all children
 *   - Repeat until all layouts got the event
 *
 * **WARNING**: Only userBroadcast events are propagated between windows.
 * This means the you have to take care of propagating state changes between windows yourself.
 *
 * @public
 */
export declare class EventHub extends EventEmitter {
    /** @internal */
    private _layoutManager;
    /** @internal */
    private _childEventListener;
    /**
     * Creates a new EventHub instance
     * @param _layoutManager - the layout manager to synchronize between the windows
     * @internal
     */
    constructor(
    /** @internal */
    _layoutManager: LayoutManager);
    /**
     * Emit an event and notify listeners
     *
     * @param eventName - The name of the event
     * @param args - Additional arguments that will be passed to the listener
     * @public
     */
    emit<K extends keyof EventEmitter.EventParamsMap>(eventName: K, ...args: EventEmitter.EventParamsMap[K]): void;
    /**
     * Broadcasts a message to all other currently opened windows.
     * @public
     */
    emitUserBroadcast(...args: EventEmitter.UnknownParams): void;
    /**
     * Destroys the EventHub
     * @internal
     */
    destroy(): void;
    /**
     * Internal processor to process local events.
     * @internal
     */
    private handleUserBroadcastEvent;
    /**
     * Callback for child events raised on the window
     * @internal
     */
    private onEventFromChild;
    /**
     * Propagates the event to the parent by emitting
     * it on the parent's DOM window
     * @internal
     */
    private propagateToParent;
    /**
     * Propagate events to the whole subtree under this event hub.
     * @internal
     */
    private propagateToThisAndSubtree;
}
/** @public */
export declare namespace EventHub {
    /** @internal */
    const ChildEventName = "gl_child_event";
    /** @internal */
    type ChildEventDetail = {
        layoutManager: LayoutManager;
        eventName: string;
        args: unknown[];
    };
    /** @internal */
    type ChildEventInit = CustomEventInit<ChildEventDetail>;
}
//# sourceMappingURL=event-hub.d.ts.map