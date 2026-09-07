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

      requestId: req.requestContext?.requestId,
      traceId: req.requestContext?.traceId,
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

    requestId: req.requestContext?.requestId,
    traceId: req.requestContext?.traceId,
  });
};
