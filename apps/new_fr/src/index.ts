import { createApp } from "@prexress/frm";
import { Logger } from "@prexress/logger";
import { postRouter } from "./post";

const app = createApp();

const logger = new Logger({
  meta: {
    app: "new_fr",
  },
});

app.use("/api", postRouter);

app.get("/", (req, res) => {
  logger.info("root route hit");
  res.status(200).json({ message: "root routes" });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
