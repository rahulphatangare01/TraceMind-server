import { AppError } from "./app.error.js";

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, {
      code: "FORBIDDEN",
      statusCode: 403,
    });

    this.name = "ForbiddenError";
  }
}

// later

// RBAC
//  ↓
// Permission Engine
//  ↓
// ForbiddenError
