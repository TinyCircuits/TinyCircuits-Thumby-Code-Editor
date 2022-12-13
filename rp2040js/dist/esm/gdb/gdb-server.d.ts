/**
 * RP2040 GDB Server
 *
 * Copyright (C) 2021, Uri Shaked
 */
import { RP2040 } from '../rp2040.js';
import { Logger } from '../utils/logging.js';
import { GDBConnection } from './gdb-connection.js';
export declare const STOP_REPLY_SIGINT = "S02";
export declare const STOP_REPLY_TRAP = "S05";
export declare class GDBServer {
    readonly rp2040: RP2040;
    logger: Logger;
    private readonly connections;
    constructor(rp2040: RP2040);
    processGDBMessage(cmd: string): string | undefined;
    addConnection(connection: GDBConnection): void;
    removeConnection(connection: GDBConnection): void;
    debug(msg: string): void;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
}
