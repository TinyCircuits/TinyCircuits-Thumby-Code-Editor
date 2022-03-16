"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogger = exports.LogLevel = void 0;
const time_js_1 = require("./time.js");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class ConsoleLogger {
    constructor(currentLogLevel, throwOnError = true) {
        this.currentLogLevel = currentLogLevel;
        this.throwOnError = throwOnError;
    }
    aboveLogLevel(logLevel) {
        return logLevel >= this.currentLogLevel ? true : false;
    }
    formatMessage(componentName, message) {
        const currentTime = time_js_1.formatTime(new Date());
        return `${currentTime} [${componentName}] ${message}`;
    }
    debug(componetName, message) {
        if (this.aboveLogLevel(LogLevel.Debug)) {
            console.debug(this.formatMessage(componetName, message));
        }
    }
    warn(componetName, message) {
        if (this.aboveLogLevel(LogLevel.Warn)) {
            console.warn(this.formatMessage(componetName, message));
        }
    }
    error(componentName, message) {
        if (this.aboveLogLevel(LogLevel.Error)) {
            console.error(this.formatMessage(componentName, message));
            if (this.throwOnError) {
                throw new Error(`[${componentName}] ${message}`);
            }
        }
    }
    info(componentName, message) {
        if (this.aboveLogLevel(LogLevel.Info)) {
            console.info(this.formatMessage(componentName, message));
        }
    }
}
exports.ConsoleLogger = ConsoleLogger;
