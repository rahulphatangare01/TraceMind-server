import { AppError } from "./app.error.js";

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, {
      code: "RESOURCE_CONFLICT",
      statusCode: 409,
      details,
    });

    this.name = "ConflictError";
  }
}

// throw new ConflictError(
//   `Organization code "${data.code}" already exists`,
// );
