import { AppError } from "./app.error.js";

export class LifecycleTransitionError extends AppError {
  constructor(resource: string, currentStatus: string, nextStatus: string) {
    super(
      `Invalid ${resource} lifecycle transition: ${currentStatus} → ${nextStatus}`,
      {
        code: "INVALID_LIFECYCLE_TRANSITION",
        statusCode: 422,
        details: {
          resource,
          currentStatus,
          nextStatus,
        },
      },
    );

    this.name = "LifecycleTransitionError";
  }
}
