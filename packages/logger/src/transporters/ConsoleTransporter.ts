import { TextFormatter } from "../formatters";
import { Formatter, LogEntry, Transporter } from "../logger/types";

export class ConsoleTransporter implements Transporter {
  constructor(private formatter: Formatter = new TextFormatter()) {}
  log(entry: LogEntry): void {
    const formattedMessage = this.formatter.format(entry);
    process.stdout.write(formattedMessage);
  }
}
