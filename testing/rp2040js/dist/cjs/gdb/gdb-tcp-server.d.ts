/// <reference types="node" />
import { Socket } from 'net';
import { GDBServer } from './gdb-server';
import { RP2040 } from '../rp2040';
export declare class GDBTCPServer extends GDBServer {
    readonly port: number;
    private socketServer;
    constructor(rp2040: RP2040, port?: number);
    handleConnection(socket: Socket): void;
}
