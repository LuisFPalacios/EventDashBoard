type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  userId?: string;
  eventId?: string;
  action?: string;
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
    code?: string;
  };
}

class Logger {
  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    const formatted = this.formatLog(entry);

    // In development, also log to console for easier debugging
    if (process.env.NODE_ENV === "development") {
      console[level === "debug" ? "log" : level](formatted);
    } else {
      // In production, use console.log for all levels (gets picked up by log aggregators)
      console.log(formatted);
    }

    // TODO: In production, send to logging service (e.g., Sentry, DataDog, CloudWatch)
    // this.sendToLoggingService(entry);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log("error", message, context, error);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, context);
    }
  }
}

export const logger = new Logger();
