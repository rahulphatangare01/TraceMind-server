export class SecurityBoundaryValidationError extends Error {
  public readonly code = "SECURITY_BOUNDARY_VALIDATION_ERROR";

  public readonly errors: string[];

  constructor(errors: string[]) {
    super(`Invalid security boundary: ${errors.join("; ")}`);

    this.name = "SecurityBoundaryValidationError";
    this.errors = errors;

    Object.setPrototypeOf(this, SecurityBoundaryValidationError.prototype);
  }
}
