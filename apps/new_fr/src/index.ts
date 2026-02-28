import { createApp } from "@prexress/frm";
import { postRouter } from "./post";

const app = createApp();

app.use("/api", postRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "root routes" });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
