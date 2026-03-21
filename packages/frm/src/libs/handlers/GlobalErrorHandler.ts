import { Request, Response } from "../../core/types";

type ErrorHandler = (error: any, req: Request, res: Response) => void;

export class GlobalErrorHandler {
  constructor(public handler: ErrorHandler) {}
}

export const GlobalErrorHandlerToken = Symbol("GlobalErrorHandlerToken");
