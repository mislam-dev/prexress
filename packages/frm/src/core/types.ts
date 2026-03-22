import { IncomingMessage, ServerResponse } from "node:http";
import { Server } from "./server";

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

// Param - RequestQuery -  RequestBody
export type ParamsDictionary = {
  [key: string]: string;
};
export type QueryDictionary = {
  [key: string]: string;
};
export type RequestBody = Record<string, unknown>;

export interface Request<
  P = ParamsDictionary,
  Q = QueryDictionary,
  B = RequestBody,
> {
  nodeReq: IncomingMessage;
  method: Method;
  headers: Record<string, string>;
  path: string; // /posts/1234
  originalPath: string; // /posts/:id
  query: Q | any;
  params: P | any;
  body: B | any;
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

export type NextFnError = Error;

export interface NextFunction {
  (error?: NextFnError): void;
}

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export type Application = InstanceType<typeof Server>;
