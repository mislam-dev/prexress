import { register as registerController } from "@prexress/core";
import { HttpException, ValidationException } from "@prexress/core/errors";
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
    new GlobalErrorHandler((err, _req: Request, res: Response) => {
      console.log(err);
      if (err instanceof ValidationException) {
        return res.status(err.statusCode).json({
          message: err.message,
          errors: err.all,
        });
      }
      if (err instanceof HttpException) {
        return res.status(err.statusCode).json({ message: err.message });
      }

      res.status(500).json({ message: "Internal Server Error" });
      return;
    }),
  );
  return app;
}
