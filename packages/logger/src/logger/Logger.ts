/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConsoleTransporter } from "../transporters";
import { LogEntry, Logger, LoggerOption, LogLevel, Transporter } from "./types";

export class LoggerImpl implements Logger {
  private transporters: Transporter[];
  private meta: Record<string, any>;

  constructor(options: LoggerOption = {}) {
    this.transporters = options.transporters || [new ConsoleTransporter()];
    this.meta = options.meta || {};
  }

  private addEntry(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      meta: { ...this.meta, ...meta },
    };
    this.transporters.forEach((transporter) => {
      transporter.log(logEntry);
    });
  }

  addTransporter(transporter: Transporter) {
    this.transporters.push(transporter);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.addEntry("debug", message, meta);
  }
  info(message: string, meta?: Record<string, unknown>): void {
    this.addEntry("info", message, meta);
  }
  warn(message: string, meta?: Record<string, unknown>): void {
    this.addEntry("warn", message, meta);
  }
  error(message: string, meta?: Record<string, unknown>): void {
    this.addEntry("error", message, meta);
  }
  fatal(message: string, meta?: Record<string, unknown>): void {
    this.addEntry("fatal", message, meta);
  }
}
