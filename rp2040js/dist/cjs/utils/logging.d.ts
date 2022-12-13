export interface Logger {
    debug(componentName: string, message: string): void;
    warn(componentName: string, message: string): void;
    error(componentName: string, message: string): void;
    info(componentName: string, message: string): void;
}
export declare enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3
}
export declare class ConsoleLogger implements Logger {
    currentLogLevel: LogLevel;
    private throwOnError;
    constructor(currentLogLevel: LogLevel, throwOnError?: boolean);
    private aboveLogLevel;
    private formatMessage;
    debug(componetName: string, message: string): void;
    warn(componetName: string, message: string): void;
    error(componentName: string, message: string): void;
    info(componentName: string, message: string): void;
}
