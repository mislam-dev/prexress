import { register as registerController } from "@prexress/core";
import {
  Application,
  createApp as createApplication,
  Request,
  Response,
} from "@prexress/frm";
import dotenv from "dotenv";
import { UserController } from "./modules/user/user.controller";
dotenv.config();

export function createApp() {
  const app: Application = createApplication();

  // basic middlewares
  // app.use(cors({ origin: true }));
  // app.use(morgan("dev"));
  // app.use(express.urlencoded({ extended: true }));
  // app.use(express.json());

  // health route
  app.get("/health", (req: Request, res: Response) => {
    try {
      res.status(200).json({ message: "UP" });
      return;
    } catch (e) {
      res.status(500).json({ message: "DOWN" });
      return;
    }
  });

  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Welcome to the API" });
    return;
  });

  registerController(app, [UserController]);

  // 404 not found handler
  // app.use((_req, res: Response) => {
  //   res.status(404).json({ message: "Not found" });
  // });

  // 500 internal server error handler
  // app.use((err: any, _req: any, res: Response, _next: any) => {
  //   console.error("err");
  //   res.status(500).json({ message: "Internal Server Error" });
  //   return;
  // });
  return app;
}
