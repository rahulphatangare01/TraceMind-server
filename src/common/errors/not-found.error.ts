import { AppError } from "./app.error.js";

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier "${identifier}" was not found`
      : `${resource} was not found`;

    super(message, {
      code: "RESOURCE_NOT_FOUND",
      statusCode: 404,
    });

    this.name = "NotFoundError";
  }
}

// throw new NotFoundError(
//   "Organization",
//   organizationId,
// );
