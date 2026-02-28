/**
 *
 * - global middleware
 * - route middleware
 *
 */

import { Handler, Middleware, Request, Response } from "./types";

type MiddlewareEntry = {
  path: string;
  middleware: Middleware;
};

export class MiddlewareManager {
  private middlewares: MiddlewareEntry[] = [];

  use(pathOrMiddleware: string | Middleware, middleware?: Middleware) {
    if (typeof pathOrMiddleware === "string") {
      if (!middleware) {
        return;
        // throw new Error('You must provide middleware');
      }
      this.middlewares.push({ path: pathOrMiddleware, middleware });
      return;
    }
    this.middlewares.push({ path: "/", middleware: pathOrMiddleware });
  }

  async execute(req: Request, res: Response, finalHandler: Handler) {
    let index = 0;
    const next = async (error?: Error) => {
      if (error) {
        // todo handles error globally here.
        res.status(500).json({ message: "Internal Server Error", error });
        return;
      }
      if (res.nodeRes.writableEnded) {
        return;
      }
      if (index >= this.middlewares.length) {
        await finalHandler(req, res);
        return;
      }
      const { path, middleware } = this.middlewares[index++]!;

      if (path !== "/" && !req.originalPath.startsWith(path)) {
        await next();
        return;
      }
      await middleware(req, res, next);
    };

    await next();
  }
}
