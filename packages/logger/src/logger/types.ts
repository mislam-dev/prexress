/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * - Transporter : Console Transporter, File Transporter, Http Transporter
 * - Formatters : JSON Formatter, Simple Formatter, Text Formatter
 * - Levels: Debug, Info, Warn, Error, Fatal
 *
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  [key: string]: any;
};

export interface Formatter {
  format(entry: LogEntry): string;
}

export interface Transporter {
  log(entry: LogEntry): void;
}

export type LoggerOption = {
  transporters?: Transporter[];
  meta?: Record<string, unknown>;
};

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  fatal(message: string, meta?: Record<string, unknown>): void;
}
