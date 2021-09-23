import { ResolvedPopoutLayoutConfig } from '../config/resolved-config';
import { LayoutManager } from '../layout-manager';
import { EventEmitter } from '../utils/event-emitter';
import { Rect } from '../utils/types';
/**
 * Pops a content item out into a new browser window.
 * This is achieved by
 *
 *    - Creating a new configuration with the content item as root element
 *    - Serializing and minifying the configuration
 *    - Opening the current window's URL with the configuration as a GET parameter
 *    - GoldenLayout when opened in the new window will look for the GET parameter
 *      and use it instead of the provided configuration
 * @public
 */
export declare class BrowserPopout extends EventEmitter {
    /** @internal */
    private _config;
    /** @internal */
    private _initialWindowSize;
    /** @internal */
    private _layoutManager;
    /** @internal */
    private _popoutWindow;
    /** @internal */
    private _isInitialised;
    /** @internal */
    private _checkReadyInterval;
    /**
     * @param _config - GoldenLayout item config
     * @param _initialWindowSize - A map with width, height, top and left
     * @internal
     */
    constructor(
    /** @internal */
    _config: ResolvedPopoutLayoutConfig, 
    /** @internal */
    _initialWindowSize: Rect, 
    /** @internal */
    _layoutManager: LayoutManager);
    toConfig(): ResolvedPopoutLayoutConfig;
    getGlInstance(): LayoutManager;
    /**
     * Retrieves the native BrowserWindow backing this popout.
     * Might throw an UnexpectedNullError exception when the window is not initialized yet.
     * @public
     */
    getWindow(): Window;
    close(): void;
    /**
     * Returns the popped out item to its original position. If the original
     * parent isn't available anymore it falls back to the layout's topmost element
     */
    popIn(): void;
    /**
     * Creates the URL and window parameter
     * and opens a new window
     * @internal
     */
    private createWindow;
    /** @internal */
    private checkReady;
    /**
     * Serialises a map of key:values to a window options string
     *
     * @param windowOptions -
     *
     * @returns serialised window options
     * @internal
     */
    private serializeWindowFeatures;
    /**
     * Creates the URL for the new window, including the
     * config GET parameter
     *
     * @returns URL
     * @internal
     */
    private createUrl;
    /**
     * Move the newly created window roughly to
     * where the component used to be.
     * @internal
     */
    private positionWindow;
    /**
     * Callback when the new window is opened and the GoldenLayout instance
     * within it is initialised
     * @internal
     */
    private onInitialised;
    /**
     * Invoked 50ms after the window unload event
     * @internal
     */
    private _onClose;
}
//# sourceMappingURL=browser-popout.d.ts.map