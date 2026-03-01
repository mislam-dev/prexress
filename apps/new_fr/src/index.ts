import { createApp } from "@prexress/frm";
import { Logger } from "@prexress/logger";
import {
  JsonFormatter,
  MiddlewareTextFormatter,
} from "@prexress/logger/formatters";
import { logger } from "@prexress/logger/middleware";
import {
  ConsoleTransporter,
  FileTransporter,
} from "@prexress/logger/transporters";
import { postRouter } from "./post";

const app = createApp();

const loggerInstance = new Logger({
  meta: {
    app: "new_fr",
  },
  transporters: [
    new ConsoleTransporter(new MiddlewareTextFormatter()),
    new FileTransporter(new JsonFormatter()),
  ],
});

app.use(
  logger({ logRequestHeaders: false, logMeta: false, logger: loggerInstance }),
);

app.use("/api", postRouter);

app.get("/", (req, res) => {
  loggerInstance.info("root route hit");
  res.status(200).json({ message: "root routes" });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
