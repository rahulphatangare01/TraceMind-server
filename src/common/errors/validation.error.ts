import { AppError } from "./app.error.js";

export class ValidationError extends AppError {
  constructor(message = "Request validation failed", details?: unknown) {
    super(message, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details,
    });

    this.name = "ValidationError";
  }
}

// Later our Zod middleware can convert:

// ZodError
//    ↓
// ValidationError
