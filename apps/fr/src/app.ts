import { register as registerController } from "@prexress/core";
import {
  Application,
  createApp as createApplication,
  Request,
  Response,
} from "@prexress/frm";
import {
  GlobalErrorHandler,
  NotFoundRequestHandler,
} from "@prexress/frm/libs/handlers";
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
    res.status(200).json({ message: "UP" });
  });

  registerController(app, [UserController]);

  app.use(
    new NotFoundRequestHandler((_req: Request, res: Response) => {
      res.status(404).json({ message: "Not found!" });
    }),
  );

  // 500 internal server error handler
  app.use(
    new GlobalErrorHandler((error, _req: Request, res: Response) => {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error | from apps" });
    }),
  );
  return app;
}
