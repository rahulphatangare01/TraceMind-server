import { AppError } from "./app.error.js";

export class BusinessRuleError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, {
      code: "BUSINESS_RULE_VIOLATION",
      statusCode: 422,
      details,
    });

    this.name = "BusinessRuleError";
  }
}
