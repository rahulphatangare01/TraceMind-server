import type { RequestContext } from "../middleware/request-context.middleware.js";

declare global {
  namespace Express {
    interface Request {
      requestContext?: RequestContext;
    }
  }
}

export {};
