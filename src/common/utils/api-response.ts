// import type { Response } from "express";

// export const sendSuccess = <T>(
//   res: Response,
//   data: T,
//   statusCode = 200,
// ): void => {
//   res.status(statusCode).json({
//     success: true,
//     data,
//   });
// };

import type { Response } from "express";

export interface SendSuccessOptions {
  message?: string;
  meta?: Record<string, unknown>;
  requestId?: string;
  traceId?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  options: SendSuccessOptions = {},
): void => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message: options.message ?? "Request successful",
    data,
    ...(options.meta !== undefined ? { meta: options.meta } : {}),
    requestId: options.requestId ?? res.req.requestContext?.requestId ?? "",
    traceId: options.traceId ?? res.req.requestContext?.traceId ?? "",
    timestamp: new Date().toISOString(),
    path: res.req.originalUrl,
  });
};
