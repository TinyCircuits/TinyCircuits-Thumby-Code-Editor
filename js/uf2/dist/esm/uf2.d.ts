export declare const magicValues: {
    offset: number;
    value: number;
}[];
export declare const maxPayloadSize = 476;
export declare const UF2Flags: {
    notMainFlash: number;
    fileContainer: number;
    familyIDPresent: number;
    md5ChecksumPresent: number;
    extensionTagsPresent: number;
};
export declare const familyMap: Map<number, string>;
export declare function familyID(familyName: string): number | null;
export interface UF2BlockData {
    /** See UF2Flags for possible flag values. */
    flags: number;
    /** Address in flash where the data should be written */
    flashAddress: number;
    /** The payload usually contains 256 bytes, but can be up to 476 bytes */
    payload: Uint8Array;
    /** Sequential block number; starts at 0 */
    blockNumber: number;
    /** Total number of blocks in file */
    totalBlocks: number;
    /**
     * Board family ID, file size, or zero (depending on Flags)
     */
    boardFamily: number;
}
export declare class UF2DecodeError extends Error {
}
export declare class UF2EncodeError extends Error {
}
export declare function isUF2Block(data: Uint8Array): boolean;
export declare function decodeBlock(data: Uint8Array): UF2BlockData;
export declare function encodeBlock(blockData: UF2BlockData, target?: Uint8Array, targetOffset?: number): Uint8Array;
