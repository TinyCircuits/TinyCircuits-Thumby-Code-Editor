"use strict";
/**
 * RP2040 GDB Server
 *
 * Copyright (C) 2021, Uri Shaked
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GDBServer = exports.STOP_REPLY_TRAP = exports.STOP_REPLY_SIGINT = void 0;
const rp2040_js_1 = require("../rp2040.js");
const logging_js_1 = require("../utils/logging.js");
const gdb_utils_js_1 = require("./gdb-utils.js");
exports.STOP_REPLY_SIGINT = 'S02';
exports.STOP_REPLY_TRAP = 'S05';
const targetXML = `<?xml version="1.0"?>
<!DOCTYPE target SYSTEM "gdb-target.dtd">
<target version="1.0">
<architecture>arm</architecture>
<feature name="org.gnu.gdb.arm.m-profile">
<reg name="r0" bitsize="32" regnum="0" save-restore="yes" type="int" group="general"/>
<reg name="r1" bitsize="32" regnum="1" save-restore="yes" type="int" group="general"/>
<reg name="r2" bitsize="32" regnum="2" save-restore="yes" type="int" group="general"/>
<reg name="r3" bitsize="32" regnum="3" save-restore="yes" type="int" group="general"/>
<reg name="r4" bitsize="32" regnum="4" save-restore="yes" type="int" group="general"/>
<reg name="r5" bitsize="32" regnum="5" save-restore="yes" type="int" group="general"/>
<reg name="r6" bitsize="32" regnum="6" save-restore="yes" type="int" group="general"/>
<reg name="r7" bitsize="32" regnum="7" save-restore="yes" type="int" group="general"/>
<reg name="r8" bitsize="32" regnum="8" save-restore="yes" type="int" group="general"/>
<reg name="r9" bitsize="32" regnum="9" save-restore="yes" type="int" group="general"/>
<reg name="r10" bitsize="32" regnum="10" save-restore="yes" type="int" group="general"/>
<reg name="r11" bitsize="32" regnum="11" save-restore="yes" type="int" group="general"/>
<reg name="r12" bitsize="32" regnum="12" save-restore="yes" type="int" group="general"/>
<reg name="sp" bitsize="32" regnum="13" save-restore="yes" type="data_ptr" group="general"/>
<reg name="lr" bitsize="32" regnum="14" save-restore="yes" type="int" group="general"/>
<reg name="pc" bitsize="32" regnum="15" save-restore="yes" type="code_ptr" group="general"/>
<reg name="xPSR" bitsize="32" regnum="16" save-restore="yes" type="int" group="general"/>
</feature>
<feature name="org.gnu.gdb.arm.m-system">
<reg name="msp" bitsize="32" regnum="17" save-restore="yes" type="data_ptr" group="system"/>
<reg name="psp" bitsize="32" regnum="18" save-restore="yes" type="data_ptr" group="system"/>
<reg name="primask" bitsize="1" regnum="19" save-restore="yes" type="int8" group="system"/>
<reg name="basepri" bitsize="8" regnum="20" save-restore="yes" type="int8" group="system"/>
<reg name="faultmask" bitsize="1" regnum="21" save-restore="yes" type="int8" group="system"/>
<reg name="control" bitsize="2" regnum="22" save-restore="yes" type="int8" group="system"/>
</feature>
</target>`;
const LOG_NAME = 'GDBServer';
class GDBServer {
    constructor(rp2040) {
        this.rp2040 = rp2040;
        this.logger = new logging_js_1.ConsoleLogger(logging_js_1.LogLevel.Warn, true);
        this.connections = new Set();
    }
    processGDBMessage(cmd) {
        const { rp2040 } = this;
        if (cmd === 'Hg0') {
            return gdb_utils_js_1.gdbMessage('OK');
        }
        switch (cmd[0]) {
            case '?':
                return gdb_utils_js_1.gdbMessage(exports.STOP_REPLY_TRAP);
            case 'q':
                // Query things
                if (cmd.startsWith('qSupported:')) {
                    return gdb_utils_js_1.gdbMessage('PacketSize=4000;vContSupported+;qXfer:features:read+');
                }
                if (cmd === 'qAttached') {
                    return gdb_utils_js_1.gdbMessage('1');
                }
                if (cmd.startsWith('qXfer:features:read:target.xml')) {
                    return gdb_utils_js_1.gdbMessage('l' + targetXML);
                }
                return gdb_utils_js_1.gdbMessage('');
            case 'v':
                if (cmd === 'vCont?') {
                    return gdb_utils_js_1.gdbMessage('vCont;c;C;s;S');
                }
                if (cmd.startsWith('vCont;c')) {
                    if (!rp2040.executing) {
                        rp2040.execute();
                    }
                    return;
                }
                if (cmd.startsWith('vCont;s')) {
                    rp2040.executeInstruction();
                    return gdb_utils_js_1.gdbMessage(exports.STOP_REPLY_TRAP);
                }
                break;
            case 'c':
                if (!rp2040.executing) {
                    rp2040.execute();
                }
                break;
            case 'g': {
                // Read registers
                const buf = new Uint32Array(17);
                buf.set(rp2040.registers);
                buf[16] = rp2040.xPSR;
                return gdb_utils_js_1.gdbMessage(gdb_utils_js_1.encodeHexBuf(new Uint8Array(buf.buffer)));
            }
            case 'p': {
                // Read register
                const registerIndex = parseInt(cmd.substr(1), 16);
                if (registerIndex >= 0 && registerIndex <= 15) {
                    return gdb_utils_js_1.gdbMessage(gdb_utils_js_1.encodeHexUint32(rp2040.registers[registerIndex]));
                }
                const specialRegister = (sysm) => gdb_utils_js_1.gdbMessage(gdb_utils_js_1.encodeHexUint32(rp2040.readSpecialRegister(sysm)));
                switch (registerIndex) {
                    case 0x10:
                        return gdb_utils_js_1.gdbMessage(gdb_utils_js_1.encodeHexUint32(rp2040.xPSR));
                    case 0x11:
                        return specialRegister(rp2040_js_1.SYSM_MSP);
                    case 0x12:
                        return specialRegister(rp2040_js_1.SYSM_PSP);
                    case 0x13:
                        return specialRegister(rp2040_js_1.SYSM_PRIMASK);
                    case 0x14:
                        this.logger.warn(LOG_NAME, 'TODO BASEPRI');
                        return gdb_utils_js_1.gdbMessage(gdb_utils_js_1.encodeHexUint32(0)); // TODO BASEPRI
                    case 0x15:
                        this.logger.warn(LOG_NAME, 'TODO faultmask');
                        return gdb_utils_js_1.gdbMessage(gdb_utils_js_1.encodeHexUint32(0)); // TODO faultmask
                    case 0x16:
                        return specialRegister(rp2040_js_1.SYSM_CONTROL);
                }
                break;
            }
            case 'P': {
                // Write register
                const params = cmd.substr(1).split('=');
                const registerIndex = parseInt(params[0], 16);
                const registerValue = params[1].trim();
                const registerBytes = registerIndex > 0x12 ? 1 : 4;
                const decodedValue = gdb_utils_js_1.decodeHexBuf(registerValue);
                if (registerIndex < 0 || registerIndex > 0x16 || decodedValue.length !== registerBytes) {
                    return gdb_utils_js_1.gdbMessage('E00');
                }
                const valueBuffer = new Uint8Array(4);
                valueBuffer.set(decodedValue.slice(0, 4));
                const value = new DataView(valueBuffer.buffer).getUint32(0, true);
                switch (registerIndex) {
                    case 0x10:
                        rp2040.xPSR = value;
                        break;
                    case 0x11:
                        rp2040.writeSpecialRegister(rp2040_js_1.SYSM_MSP, value);
                        break;
                    case 0x12:
                        rp2040.writeSpecialRegister(rp2040_js_1.SYSM_PSP, value);
                        break;
                    case 0x13:
                        rp2040.writeSpecialRegister(rp2040_js_1.SYSM_PRIMASK, value);
                        break;
                    case 0x14:
                        this.logger.warn(LOG_NAME, 'TODO BASEPRI');
                        break; // TODO BASEPRI
                    case 0x15:
                        this.logger.warn(LOG_NAME, 'TODO faultmask');
                        break; // TODO faultmask
                    case 0x16:
                        rp2040.writeSpecialRegister(rp2040_js_1.SYSM_CONTROL, value);
                        break;
                    default:
                        rp2040.registers[registerIndex] = value;
                        break;
                }
                return gdb_utils_js_1.gdbMessage('OK');
            }
            case 'm': {
                // Read memory
                const params = cmd.substr(1).split(',');
                const address = parseInt(params[0], 16);
                const length = parseInt(params[1], 16);
                let result = '';
                for (let i = 0; i < length; i++) {
                    result += gdb_utils_js_1.encodeHexByte(rp2040.readUint8(address + i));
                }
                return gdb_utils_js_1.gdbMessage(result);
            }
            case 'M': {
                // Write memory
                const params = cmd.substr(1).split(/[,:]/);
                const address = parseInt(params[0], 16);
                const length = parseInt(params[1], 16);
                const data = gdb_utils_js_1.decodeHexBuf(params[2].substr(0, length * 2));
                for (let i = 0; i < data.length; i++) {
                    this.debug(`Write ${data[i].toString(16)} to ${(address + i).toString(16)}`);
                    rp2040.writeUint8(address + i, data[i]);
                }
                return gdb_utils_js_1.gdbMessage('OK');
            }
        }
        return gdb_utils_js_1.gdbMessage('');
    }
    addConnection(connection) {
        this.connections.add(connection);
        this.rp2040.onBreak = () => {
            this.rp2040.stop();
            this.rp2040.PC -= this.rp2040.breakRewind;
            for (const connection of this.connections) {
                connection.onBreakpoint();
            }
        };
    }
    removeConnection(connection) {
        this.connections.delete(connection);
    }
    debug(msg) {
        this.logger.debug(LOG_NAME, msg);
    }
    info(msg) {
        this.logger.info(LOG_NAME, msg);
    }
    warn(msg) {
        this.logger.warn(LOG_NAME, msg);
    }
    error(msg) {
        this.logger.error(LOG_NAME, msg);
    }
}
exports.GDBServer = GDBServer;
