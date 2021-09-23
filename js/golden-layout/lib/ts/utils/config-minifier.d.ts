/**
 * Minifies and unminifies configs by replacing frequent keys
 * and values with one letter substitutes. Config options must
 * retain array position/index, add new options at the end.
 * @internal
*/
export declare namespace ConfigMinifier {
    type YY = 'id' | 'title';
    const enum XX {
        id = "id"
    }
    function checkInitialise(): void;
    function translateObject(from: Record<string, unknown>, minify: boolean): Record<string, unknown>;
}
//# sourceMappingURL=config-minifier.d.ts.map