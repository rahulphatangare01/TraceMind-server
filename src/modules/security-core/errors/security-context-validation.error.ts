export class SecurityContextValidationError extends Error {
  public readonly code = "SECURITY_CONTEXT_VALIDATION_ERROR";

  public readonly errors: string[];

  constructor(errors: string[]) {
    super(`Invalid security context: ${errors.join("; ")}`);

    this.name = "SecurityContextValidationError";

    this.errors = errors;

    Object.setPrototypeOf(this, SecurityContextValidationError.prototype);
  }
}
