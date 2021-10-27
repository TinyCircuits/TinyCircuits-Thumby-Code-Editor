import { GDBServer } from './gdb-server';
export declare type GDBResponseHandler = (value: string) => void;
export declare class GDBConnection {
    private server;
    private onResponse;
    readonly rp2040: import("..").RP2040;
    private buf;
    constructor(server: GDBServer, onResponse: GDBResponseHandler);
    feedData(data: string): void;
    onBreakpoint(): void;
}
