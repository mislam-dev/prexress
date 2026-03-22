import EventEmitter from "events";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { GlobalErrorHandler, NotFoundRequestHandler } from "../libs/handlers";
import { MiddlewareManager } from "./Middleware";
import { RequestImpl } from "./Request";
import { ResponseImpl } from "./Response";
import { Router, RouterManager } from "./router";
import { Handler, Middleware, Request, Response } from "./types";

export class Server extends EventEmitter {
  private server: ReturnType<typeof createServer>;
  private routerManager: RouterManager = new RouterManager();
  private middlewareManager: MiddlewareManager = new MiddlewareManager();
  private notFoundHandler: NotFoundRequestHandler | null = null;
  private globalErrorHandler: GlobalErrorHandler | null = null;
  // get routers
  constructor() {
    super();
    this.server = createServer(this.handleRequest.bind(this));
  }
  private async handleRequest(
    nodeReq: IncomingMessage,
    nodeRes: ServerResponse,
  ) {
    this.emit("request:received");

    // step 1 : process the request and response and create our own req, res object
    const req = new RequestImpl(nodeReq);
    const res = new ResponseImpl(nodeRes);

    // Step 2: Parse the body
    await req.parseBody();

    // Step 3: Match the route
    const matchResult = this.routerManager.match(req.method, req.path);

    req.params = matchResult?.params || {};
    req.originalPath = matchResult?.originalPath || "";

    // Step 4:  Execute the handler or middleware chain
    let finalHandler: Handler;

    if (matchResult?.handler) {
      finalHandler = matchResult.handler;
    } else if (this.notFoundHandler) {
      finalHandler = this.notFoundHandler.handler;
    } else {
      finalHandler = (req: Request, res: Response) => {
        res.status(404).json({ message: "Route not found", status: "error" });
        return;
      };
    }

    try {
      await this.middlewareManager.execute(req, res, finalHandler);
    } catch (error) {
      if (this.globalErrorHandler) {
        this.globalErrorHandler.handler(error, req, res);
        return;
      }
      if (!res.nodeRes.writableEnded) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
    // finally
    this.emit("request:processed");
  }

  use(
    pathOrMiddlewareOrRouter:
      | string
      | Middleware
      | Router
      | NotFoundRequestHandler
      | GlobalErrorHandler,
    middleware?: Middleware | Router,
  ) {
    if (pathOrMiddlewareOrRouter instanceof NotFoundRequestHandler) {
      this.notFoundHandler = pathOrMiddlewareOrRouter;
      return;
    }
    if (pathOrMiddlewareOrRouter instanceof GlobalErrorHandler) {
      this.globalErrorHandler = pathOrMiddlewareOrRouter;
      return;
    }
    if (pathOrMiddlewareOrRouter instanceof Router) {
      this.registerRouter("/", pathOrMiddlewareOrRouter);
      return;
    }

    if (typeof pathOrMiddlewareOrRouter === "function") {
      this.middlewareManager.use("/", pathOrMiddlewareOrRouter);
      return;
    }

    if (middleware instanceof Router) {
      this.registerRouter(pathOrMiddlewareOrRouter as string, middleware);
      return;
    }

    if (typeof middleware === "function") {
      this.middlewareManager.use(pathOrMiddlewareOrRouter as string, middleware);
      return;
    }
  }

  private registerRouter(basePath: string, router: Router) {
    // 1. Register router-level middlewares
    router.middlewares.forEach((m) => {
      this.middlewareManager.use(basePath, m);
    });

    // 2. Register each route from the router
    router.routes.forEach((route) => {
      const finalPath =
        basePath === "/"
          ? route.path
          : basePath + (route.path === "/" ? "" : route.path);

      const handlers = route.handlers;
      const middlewares = handlers.slice(0, -1);
      const finalHandler = handlers[handlers.length - 1]!;

      // Register intermediate middlewares for this specific route
      middlewares.forEach((m) => {
        this.middlewareManager.use(finalPath, m);
      });

      // Register final handler
      this.routerManager.add(route.method, finalPath, finalHandler);
    });
  }

  get(path: string, ...handlers: Handler[]) {
    const middlewares = handlers.slice(0, -1);
    middlewares.forEach((middleware) => {
      this.middlewareManager.use(path, middleware);
    });
    const finalHandler = handlers[handlers.length - 1]!;
    this.routerManager.add("GET", path, finalHandler);
  }

  post(path: string, ...handlers: Handler[]) {
    const middlewares = handlers.slice(0, -1);
    middlewares.forEach((middleware) => {
      this.middlewareManager.use(path, middleware);
    });
    const finalHandler = handlers[handlers.length - 1]!;
    this.routerManager.add("POST", path, finalHandler);
  }

  put(path: string, ...handlers: Handler[]) {
    const middlewares = handlers.slice(0, -1);
    middlewares.forEach((middleware) => {
      this.middlewareManager.use(path, middleware);
    });
    const finalHandler = handlers[handlers.length - 1]!;
    this.routerManager.add("PUT", path, finalHandler);
  }

  patch(path: string, ...handlers: Handler[]) {
    const middlewares = handlers.slice(0, -1);
    middlewares.forEach((middleware) => {
      this.middlewareManager.use(path, middleware);
    });
    const finalHandler = handlers[handlers.length - 1]!;
    this.routerManager.add("PATCH", path, finalHandler);
  }

  delete(path: string, ...handlers: Handler[]) {
    const middlewares = handlers.slice(0, -1);
    middlewares.forEach((middleware) => {
      this.middlewareManager.use(path, middleware);
    });
    const finalHandler = handlers[handlers.length - 1]!;
    this.routerManager.add("DELETE", path, finalHandler);
  }

  listen(port: number, callback?: () => void) {
    this.server.listen(port, callback);
  }
}
