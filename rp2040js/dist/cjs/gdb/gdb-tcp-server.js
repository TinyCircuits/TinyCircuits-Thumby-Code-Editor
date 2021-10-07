"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GDBTCPServer = void 0;
const net_1 = require("net");
const gdb_connection_1 = require("./gdb-connection");
const gdb_server_1 = require("./gdb-server");
class GDBTCPServer extends gdb_server_1.GDBServer {
    constructor(rp2040, port = 3333) {
        super(rp2040);
        this.port = port;
        this.socketServer = net_1.createServer();
        this.socketServer.listen(port);
        this.socketServer.on('connection', (socket) => this.handleConnection(socket));
    }
    handleConnection(socket) {
        this.info('GDB connected');
        socket.setNoDelay(true);
        const connection = new gdb_connection_1.GDBConnection(this, (data) => {
            socket.write(data);
        });
        socket.on('data', (data) => {
            connection.feedData(data.toString('utf-8'));
        });
        socket.on('error', (err) => {
            this.removeConnection(connection);
            this.error(`GDB socket error ${err}`);
        });
        socket.on('close', () => {
            this.removeConnection(connection);
            this.info('GDB disconnected');
        });
    }
}
exports.GDBTCPServer = GDBTCPServer;
