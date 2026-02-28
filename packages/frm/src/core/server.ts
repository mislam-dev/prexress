import EventEmitter from "events";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { MiddlewareManager } from "./Middleware";
import { RequestImpl } from "./Request";
import { ResponseImpl } from "./Response";
import { Router, RouterManager } from "./router";
import { Handler, Middleware, Request, Response } from "./types";

export class Server extends EventEmitter {
  private server: ReturnType<typeof createServer>;
  private routerManager: RouterManager = new RouterManager();
  private middlewareManager: MiddlewareManager = new MiddlewareManager();
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
    const finalHandler = matchResult?.handler
      ? matchResult.handler
      : (req: Request, res: Response) => {
          res.status(404).json({ message: "Route not found", status: "error" });
          return;
        };

    this.middlewareManager.execute(req, res, finalHandler);

    // finally
    this.emit("request:processed");
  }

  use(
    pathOrMiddlewareOrRouter: string | Middleware | Router,
    middleware?: Middleware | Router,
  ) {
    if (pathOrMiddlewareOrRouter instanceof Router) {
      this.routerManager.addRouter("/", pathOrMiddlewareOrRouter);
      return;
    }

    if (typeof pathOrMiddlewareOrRouter === "function") {
      this.middlewareManager.use("/", pathOrMiddlewareOrRouter);
      return;
    }

    if (middleware instanceof Router) {
      this.routerManager.addRouter(pathOrMiddlewareOrRouter, middleware);
      return;
    }
    if (typeof middleware === "function") {
      this.middlewareManager.use(pathOrMiddlewareOrRouter, middleware);
      return;
    }
    return;
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
