import fs from "fs";
import { JsonFormatter } from "../formatters";
import { Formatter, LogEntry, Transporter } from "../logger/types";
export type FileTransPorterOptions = {
  logDir?: string;
  logFile?: string;
};

export class FileTransporter implements Transporter {
  private logDir: string;
  private logFile: string;
  constructor(
    private formatter: Formatter = new JsonFormatter(),
    options: FileTransPorterOptions = {},
  ) {
    this.logDir = options.logDir || "./logs";
    this.logFile = options.logFile || "app.log";
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
  log(entry: LogEntry): void {
    const logPath = `${this.logDir}/${this.logFile}`;
    const formattedMessage = this.formatter.format(entry);
    fs.appendFileSync(logPath, formattedMessage);
  }
}
