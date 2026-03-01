import { Formatter, LogEntry } from "../logger/types";

export class JsonFormatter implements Formatter {
  format(entry: LogEntry): string {
    return JSON.stringify(entry) + "\n";
  }
}
