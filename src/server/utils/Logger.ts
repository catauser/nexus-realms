// ============================================================
// Nexus Realms — Structured Logger
// Provides structured JSON logging with file rotation
// ============================================================

import * as fs from 'fs';
import * as path from 'path';

/** Log severity levels */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

/** Structured log entry */
interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
  stack?: string;
}

/** Logger configuration */
interface LoggerConfig {
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Directory for log files */
  logDir: string;
  /** Whether to write to console */
  console: boolean;
  /** Whether to write to file */
  file: boolean;
  /** Max file size in bytes before rotation (default 50MB) */
  maxFileSize: number;
  /** Max number of rotated files to keep */
  maxFiles: number;
  /** Context label for this logger instance */
  context?: string;
}

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  logDir: 'logs',
  console: true,
  file: true,
  maxFileSize: 50 * 1024 * 1024, // 50 MB
  maxFiles: 10,
};

/**
 * Structured logger with file rotation and context support.
 *
 * Usage:
 * ```ts
 * const logger = new Logger({ context: 'World' });
 * logger.info('Zone loaded', { zoneId: 'haven', entityCount: 42 });
 * ```
 */
export class Logger {
  private config: LoggerConfig;
  private writeStream: fs.WriteStream | null = null;
  private currentFileSize = 0;
  private currentFileIndex = 0;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.file) {
      this.ensureLogDir();
      this.openStream();
    }
  }

  // ─── Public API ─────────────────────────────────────────────

  /** Log a debug message */
  public debug(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /** Log an info message */
  public info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  /** Log a warning message */
  public warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  /** Log an error message */
  public error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData: Record<string, unknown> = { ...data };
    if (error instanceof Error) {
      errorData.stack = error.stack;
      errorData.errorName = error.name;
    } else if (error !== undefined) {
      errorData.errorValue = String(error);
    }
    this.log(LogLevel.ERROR, message, errorData);
  }

  /** Log a fatal error (will also attempt immediate flush) */
  public fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData: Record<string, unknown> = { ...data };
    if (error instanceof Error) {
      errorData.stack = error.stack;
      errorData.errorName = error.name;
    }
    this.log(LogLevel.FATAL, message, errorData);
  }

  /** Create a child logger with a specific context */
  public child(context: string): Logger {
    return new Logger({ ...this.config, context });
  }

  /** Flush and close all streams */
  public async close(): Promise<void> {
    if (this.writeStream) {
      return new Promise((resolve) => {
        this.writeStream!.end(() => resolve());
      });
    }
  }

  // ─── Internal ───────────────────────────────────────────────

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (level < this.config.minLevel) return;

    const entry: LogEntry = {
      level: LogLevel[level],
      message,
      timestamp: new Date().toISOString(),
    };

    if (this.config.context) {
      entry.context = this.config.context;
    }

    if (data) {
      // Separate stack trace from data
      if (data.stack && typeof data.stack === 'string') {
        entry.stack = data.stack as string;
        const { stack: _, ...rest } = data;
        if (Object.keys(rest).length > 0) {
          entry.data = rest;
        }
      } else {
        entry.data = data;
      }
    }

    const serialized = JSON.stringify(entry);

    if (this.config.console) {
      this.writeToConsole(level, entry);
    }

    if (this.config.file && this.writeStream) {
      this.writeToFile(serialized);
    }
  }

  private writeToConsole(level: LogLevel, entry: LogEntry): void {
    const color = this.getLevelColor(level);
    const reset = '\x1b[0m';
    const dim = '\x1b[2m';
    const prefix = entry.context ? `[${entry.context}] ` : '';
    const line = `${dim}${entry.timestamp}${reset} ${color}${entry.level.padEnd(5)}${reset} ${prefix}${entry.message}`;

    if (level >= LogLevel.ERROR) {
      console.error(line);
      if (entry.stack) console.error(`${dim}${entry.stack}${reset}`);
      if (entry.data) console.error(entry.data);
    } else if (level === LogLevel.WARN) {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  private writeToFile(serialized: string): void {
    if (!this.writeStream) return;

    const line = serialized + '\n';
    const bytes = Buffer.byteLength(line, 'utf8');

    if (this.currentFileSize + bytes > this.config.maxFileSize) {
      this.rotateFile();
    }

    this.writeStream.write(line);
    this.currentFileSize += bytes;
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
  }

  private openStream(): void {
    const logFile = path.join(this.config.logDir, `server-${this.currentFileIndex}.log`);
    this.writeStream = fs.createWriteStream(logFile, { flags: 'a' });
    this.currentFileSize = fs.existsSync(logFile) ? fs.statSync(logFile).size : 0;
  }

  private rotateFile(): void {
    if (this.writeStream) {
      this.writeStream.end();
    }
    this.currentFileIndex = (this.currentFileIndex + 1) % this.config.maxFiles;
    this.openStream();
  }

  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '\x1b[36m';  // cyan
      case LogLevel.INFO:  return '\x1b[32m';  // green
      case LogLevel.WARN:  return '\x1b[33m';  // yellow
      case LogLevel.ERROR: return '\x1b[31m';  // red
      case LogLevel.FATAL: return '\x1b[35m';  // magenta
    }
  }
}

/** Default logger instance for the server */
export const logger = new Logger({
  context: 'Server',
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
});
