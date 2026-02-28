import { IncomingMessage } from 'http';
import { parse } from 'url';
import { Method, Request } from './types';

export class RequestImpl implements Request {
  nodeReq: IncomingMessage;
  method: Method;
  headers: Record<string, string>;
  path: string;
  originalPath = '';
  query: Record<string, string>;
  params: Record<string, string>;
  body: string | object | null = null;

  constructor(nodeReq: IncomingMessage) {
    this.nodeReq = nodeReq;
    this.method = nodeReq.method as Method;
    this.headers = nodeReq.headers as Record<string, string>;

    const parseUrl = parse(nodeReq.url || '', true);
    this.path = parseUrl.pathname || '';
    this.query = parseUrl.query as Record<string, string>;
    this.params = {};
  }

  async parseBody() {
    const allowedMethods = ['POST', 'PUT', 'PATCH'];
    if (!allowedMethods.includes(this.method)) {
      return;
    }

    const contentType = this.headers['content-type']?.toLocaleLowerCase();

    if (!contentType) {
      return;
    }

    // read the body
    const chunks: Buffer[] = [];
    for await (const chunk of this.nodeReq) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks).toString();

    if (contentType.includes('application/json')) {
      try {
        this.body = JSON.parse(buffer);
      } catch {
        this.body = null;
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const urlencodedData = new URLSearchParams(buffer);
        this.body = Object.fromEntries(urlencodedData.entries());
      } catch {
        this.body = null;
      }
    } else if (contentType.includes('multipart/form-data')) {
      // todo: handler for multipart/form-data
    } else if (contentType.includes('text/plain')) {
      this.body = buffer;
    } else {
      this.body = null;
    }
  }
}
