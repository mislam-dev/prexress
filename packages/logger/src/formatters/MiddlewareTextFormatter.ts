import { ConsoleColor } from "../console-color/ConsoleColor";
import { Formatter, LogEntry } from "../logger/types";
import { formateDate } from "../utils/date";

export class MiddlewareTextFormatter implements Formatter {
  format(entry: LogEntry): string {
    const { level, message, timestamp } = entry;

    const colorizedMessage = ConsoleColor.colorize(level, message);
    const timestampString =
      ConsoleColor.colors.gray +
      formateDate(timestamp).padEnd(25, " ") +
      ConsoleColor.colors.reset;

    return `${timestampString} ${colorizedMessage}\n`;
  }
}
