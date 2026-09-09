// import type { NextFunction, Request, Response } from "express";

// import { AppError } from "../errors/index.js";

// export const errorHandlerMiddleware = (
//   error: unknown,
//   req: Request,
//   res: Response,
//   _next: NextFunction,
// ): void => {
//   const requestId = req.requestContext?.requestId;
//   const traceId = req.requestContext?.traceId;
//   if (error instanceof AppError) {
//     res.status(error.statusCode).json({
//       success: false,

//       error: {
//         code: error.code,
//         message: error.message,
//         ...(error.details !== undefined ? { details: error.details } : {}),
//       },

//       requestId: req.requestContext?.requestId,
//       traceId: req.requestContext?.traceId,
//     });

//     return;
//   }

//   console.error("Unhandled application error:", error);

//   res.status(500).json({
//     success: false,

//     error: {
//       code: "INTERNAL_SERVER_ERROR",
//       message: "An unexpected error occurred",
//     },

//     requestId: req.requestContext?.requestId,
//     traceId: req.requestContext?.traceId,
//   });
// };
import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/index.js";

export const errorHandlerMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = req.requestContext?.requestId ?? "";
  const traceId = req.requestContext?.traceId ?? "";
  const timestamp = new Date().toISOString();
  const path = req.originalUrl;

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      message: error.message,
      error: {
        code: error.code,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
      requestId,
      traceId,
      timestamp,
      path,
    });

    return;
  }

  console.error("Unhandled application error:", error);

  res.status(500).json({
    success: false,
    statusCode: 500,
    message: "An unexpected error occurred",
    error: {
      code: "INTERNAL_SERVER_ERROR",
    },
    requestId,
    traceId,
    timestamp,
    path,
  });
};
