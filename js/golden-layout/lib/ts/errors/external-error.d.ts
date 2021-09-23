/** @public */
export declare abstract class ExternalError extends Error {
    readonly type: string;
    /** @internal */
    constructor(type: string, message: string);
}
/** @public */
export declare class ConfigurationError extends ExternalError {
    readonly node?: string | undefined;
    /** @internal */
    constructor(message: string, node?: string | undefined);
}
/** @public */
export declare class PopoutBlockedError extends ExternalError {
    /** @internal */
    constructor(message: string);
}
/** @public */
export declare class ApiError extends ExternalError {
    /** @internal */
    constructor(message: string);
}
/** @public */
export declare class BindError extends ExternalError {
    /** @internal */
    constructor(message: string);
}
//# sourceMappingURL=external-error.d.ts.map