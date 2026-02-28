import { Handler, Method } from "../types";

export type Route = {
  method: Method;
  path: string;
  handlers: Handler[];
};

export class Router {
  private all_routes: Route[] = [];

  public get(path: string, ...handlers: Handler[]) {
    this.all_routes.push({ method: "GET", path, handlers });
  }

  public post(path: string, ...handlers: Handler[]) {
    this.all_routes.push({ method: "POST", path, handlers });
  }

  public put(path: string, ...handlers: Handler[]) {
    this.all_routes.push({ method: "PUT", path, handlers });
  }

  public delete(path: string, ...handlers: Handler[]) {
    this.all_routes.push({ method: "DELETE", path, handlers });
  }

  public patch(path: string, ...handlers: Handler[]) {
    this.all_routes.push({ method: "PATCH", path, handlers });
  }

  public get routes(): Route[] {
    return this.all_routes;
  }
}
export const createRouter = () => new Router();
