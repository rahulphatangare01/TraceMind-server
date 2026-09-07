import { AppError } from "./app.error.js";

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required") {
    super(message, {
      code: "UNAUTHORIZED",
      statusCode: 401,
    });

    this.name = "UnauthorizedError";
  }
}
