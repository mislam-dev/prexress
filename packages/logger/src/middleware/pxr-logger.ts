/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Handler,
  Method,
  NextFunction,
  Request,
  Response,
} from "@prexress/frm";
import { MiddlewareTextFormatter } from "../formatters";
import { Logger, LogLevel } from "../logger";
import { ConsoleTransporter } from "../transporters";

export type LoggerOptions = {
  logger?: Logger;
  logRequestBody?: boolean;
  logResponseBody?: boolean;
  logRequestHeaders?: boolean;
  logResponseTime?: boolean;
  logResponseStatus?: boolean;
  logMeta?: boolean;
};

export const logger = (options: LoggerOptions = {}): Handler => {
  const {
    logger = new Logger({
      transporters: [new ConsoleTransporter(new MiddlewareTextFormatter())],
    }),
    logRequestBody = false,
    logRequestHeaders = false,
    logMeta = false,
    logResponseBody = false,
    logResponseTime = true,
    logResponseStatus = true,
  } = options;

  return (req: Request, res: Response, next?: NextFunction) => {
    const startTime = process.hrtime.bigint();
    const requestId = crypto.randomUUID();

    // initial log entry
    const logEntry: Record<string, any> = {
      requestId,
      method: req.method,
      path: req.path,
      originalPath: req.originalPath,
      // headers: req.headers,
      timestamp: new Date().toISOString(),
    };

    // log request body
    const allowedMethods: Method[] = ["POST", "PUT", "PATCH"];
    if (logRequestBody && allowedMethods.includes(req.method)) {
      let body = "";
      req.nodeReq.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.nodeReq.on("end", () => {
        try {
          logEntry.body = JSON.parse(body);
        } catch {
          logEntry.body = body;
        }
      });
    }

    const originalWrite = res.nodeRes.write.bind(res.nodeRes);
    const originalEnd = res.nodeRes.end.bind(res.nodeRes);

    let responseBody = "";

    res.nodeRes.write = (chunk, ...orgs: any[]) => {
      responseBody += chunk.toString();
      return originalWrite(chunk, ...orgs);
    };

    res.nodeRes.end = (chunk, ...orgs: any[]) => {
      if (chunk) {
        responseBody += chunk.toString();
      }

      if (logResponseBody) {
        try {
          logEntry.responseBody = JSON.parse(responseBody);
        } catch {
          logEntry.responseBody = responseBody;
        }
      }

      if (logResponseTime) {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1_000_000;
        logEntry.responseTime = duration.toFixed(3) + "ms";
      }
      if (logResponseStatus) {
        logEntry.statusCode = res.statusCode;
      }
      const { statusCode } = res;

      const logMessage = `${req.method} ${req.path} - ${statusCode} - ${logEntry.responseTime}`;

      let logLevel: LogLevel = "info";
      if (statusCode >= 400 && statusCode < 500) {
        logLevel = "warn";
      } else if (statusCode >= 500) {
        logLevel = "error";
      }
      logger[logLevel](logMessage, logEntry);

      if (logMeta) {
        console.log("Meta data: ", logEntry);
      }
      if (logRequestHeaders) {
        console.log("Request headers: ", req.headers);
      }

      return originalEnd(chunk, ...orgs);
    };

    next?.();
  };
};
