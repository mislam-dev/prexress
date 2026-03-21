import { Handler } from "@/core/types";

export class NotFoundRequestHandler {
  constructor(public handler: Handler) {}
}

export const NotFoundRequestHandlerToken = Symbol(
  "NotFoundRequestHandlerToken",
);
