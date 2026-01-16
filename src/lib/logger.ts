type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
    userId?: string;
    importId?: string;
    movieId?: string;
    action?: string;
    duration?: number;
    [key: string]: unknown;
}

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: LogContext;
    error?: {
        message: string;
        stack?: string;
    };
}

const isDev = process.env.NODE_ENV === "development";

function formatLog(entry: LogEntry): string {
    if (isDev) {
        // Formato legible para desarrollo
        const contextStr = entry.context
            ? ` | ${Object.entries(entry.context)
                .map(([k, v]) => `${k}=${v}`)
                .join(" ")}`
            : "";
        const errorStr = entry.error ? ` | Error: ${entry.error.message}` : "";
        return `[${entry.level.toUpperCase()}] ${entry.message}${contextStr}${errorStr}`;
    }
    // JSON estructurado para producción
    return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
        error: error
            ? {
                message: error.message,
                stack: error.stack,
            }
            : undefined,
    };

    const formatted = formatLog(entry);

    switch (level) {
        case "error":
            console.error(formatted);
            break;
        case "warn":
            console.warn(formatted);
            break;
        case "debug":
            if (isDev) console.debug(formatted);
            break;
        default:
            console.log(formatted);
    }
}

export const logger = {
    info: (message: string, context?: LogContext) => log("info", message, context),
    warn: (message: string, context?: LogContext) => log("warn", message, context),
    error: (message: string, context?: LogContext, error?: Error) =>
        log("error", message, context, error),
    debug: (message: string, context?: LogContext) => log("debug", message, context),

    /**
     * Crea un logger con contexto persistente
     */
    withContext: (baseContext: LogContext) => ({
        info: (message: string, context?: LogContext) =>
            log("info", message, { ...baseContext, ...context }),
        warn: (message: string, context?: LogContext) =>
            log("warn", message, { ...baseContext, ...context }),
        error: (message: string, context?: LogContext, error?: Error) =>
            log("error", message, { ...baseContext, ...context }, error),
        debug: (message: string, context?: LogContext) =>
            log("debug", message, { ...baseContext, ...context }),
    }),

    /**
     * Mide duración de una operación async
     */
    async timed<T>(
        operation: string,
        fn: () => Promise<T>,
        context?: LogContext
    ): Promise<T> {
        const start = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - start;
            log("info", `${operation} completed`, { ...context, duration });
            return result;
        } catch (error) {
            const duration = Date.now() - start;
            log("error", `${operation} failed`, { ...context, duration }, error as Error);
            throw error;
        }
    },
};
