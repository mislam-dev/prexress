import { ServerResponse } from 'http';
import { Response } from './types';

export class ResponseImpl implements Response {
  statusCode = 200;
  headers: Record<string, string> = {};

  constructor(public nodeRes: ServerResponse) {}

  status(code: number): this {
    this.statusCode = code;
    return this;
  }
  setHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }
  send(body?: string | object | Buffer | null): this {
    if (this.nodeRes.writableEnded) return this;
    if (typeof body === 'object' && !(body instanceof Buffer)) {
      this.setHeader('Content-Type', 'application/json');
      this.nodeRes.writeHead(this.statusCode, this.headers);
      this.nodeRes.end(JSON.stringify(body));
      return this;
    }
    if (body instanceof Buffer) {
      this.setHeader('Content-Type', 'application/octet-stream');
      this.nodeRes.writeHead(this.statusCode, this.headers);
      this.nodeRes.end(body);
      return this;
    }
    this.nodeRes.writeHead(this.statusCode, this.headers);
    this.nodeRes.end(body);
    return this;
  }
  json(body: object): this {
    this.setHeader('Content-Type', 'application/json');
    this.nodeRes.writeHead(this.statusCode, this.headers);
    this.nodeRes.end(JSON.stringify(body));
    return this;
  }
}
