/** @internal */
declare abstract class InternalError extends Error {
    constructor(type: string, code: string, message?: string);
}
/** @internal */
export declare class AssertError extends InternalError {
    constructor(code: string, message?: string);
}
/** @internal */
export declare class UnreachableCaseError extends InternalError {
    constructor(code: string, variableValue: never, message?: string);
}
/** @internal */
export declare class UnexpectedNullError extends InternalError {
    constructor(code: string, message?: string);
}
/** @internal */
export declare class UnexpectedUndefinedError extends InternalError {
    constructor(code: string, message?: string);
}
export {};
//# sourceMappingURL=internal-error.d.ts.map