import { IncomingMessage, ServerResponse } from "node:http";

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export interface Request {
  nodeReq: IncomingMessage;
  method: Method;
  headers: Record<string, string>;
  path: string; // /posts/1234
  originalPath: string; // /posts/:id
  query: Record<string, string>;
  params: Record<string, string>;
  body: string | object | null;
}

export interface Response {
  nodeRes: ServerResponse;
  statusCode: number;
  headers: Record<string, string>;
  status(code: number): this;
  setHeader(key: string, value: string): this;
  send(body?: string | object | Buffer | null): this;
  json(body: object): this;
}

export type Handler = (
  req: Request,
  res: Response,
  next?: NextFunction,
) => void | Promise<void>;

export interface NextFunction {
  (error?: Error): void;
}

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;
