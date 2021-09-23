import { WidthAndHeight } from './types';
/** @internal */
export declare function numberToPixels(value: number): string;
/** @internal */
export declare function pixelsToNumber(value: string): number;
/** @internal */
export declare function getElementWidth(element: HTMLElement): number;
/** @internal */
export declare function setElementWidth(element: HTMLElement, width: number): void;
/** @internal */
export declare function getElementHeight(element: HTMLElement): number;
/** @internal */
export declare function setElementHeight(element: HTMLElement, height: number): void;
/** @internal */
export declare function getElementWidthAndHeight(element: HTMLElement): WidthAndHeight;
/** @internal */
export declare function setElementDisplayVisibility(element: HTMLElement, visible: boolean): void;
/** @internal */
export declare function ensureElementPositionAbsolute(element: HTMLElement): void;
/**
 * Replacement for JQuery $.extend(target, obj)
 * @internal
*/
export declare function extend(target: Record<string, unknown>, obj: Record<string, unknown>): Record<string, unknown>;
/**
 * Replacement for JQuery $.extend(true, target, obj)
 * @internal
*/
export declare function deepExtend(target: Record<string, unknown>, obj: Record<string, unknown> | undefined): Record<string, unknown>;
/** @internal */
export declare function deepExtendValue(existingTarget: unknown, value: unknown): unknown;
/** @internal */
export declare function removeFromArray<T>(item: T, array: T[]): void;
/** @internal */
export declare function getUniqueId(): string;
//# sourceMappingURL=utils.d.ts.map