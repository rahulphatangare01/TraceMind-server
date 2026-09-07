// // export interface RequestContext {
// //   requestId: string;
// //   traceId: string;
// //   spanId: string;
// //   sessionId?: string;
// //   userId?: string;
// //   organizationId?: string;
// //   projectId?: string;
// //   applicationId?: string;
// //   environmentId?: string;
// // }

// import type { Request, Response, NextFunction } from "express";
// import {
//   generateRequestId,
//   generateTraceId,
//   generateSpanId,
// } from "../utils/id.generrator";

// export interface RequestContext {
//   requestId: string;
//   traceId: string;
//   spanId: string;
//   sessionId?: string;
//   userId?: string;
//   organizationId?: string;
//   projectId?: string;
//   applicationId?: string;
//   environmentId?: string;
// }

// export const requestContextMiddleware = (
//   req: Request,
//   _res: Response,
//   next: NextFunction,
// ): void => {
//   const requestId = req.header("x-request-id") || generateRequestId();
//   const traceId = req.header("x-trace-id") || generateTraceId();
//   const spanId = generateSpanId();

//   req.requestContext = {
//     requestId,
//     traceId,
//     spanId,
//   };

//   next();
// };
import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/index.js";

export const errorHandlerMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = req.requestContext?.requestId;
  const traceId = req.requestContext?.traceId;

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
      requestId,
      traceId,
    });

    return;
  }

  console.error("Unhandled application error:", error);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
    requestId,
    traceId,
  });
};
