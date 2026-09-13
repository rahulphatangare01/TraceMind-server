export interface SecurityCoreErrorOptions {
  code: string;
  details?: unknown;
}

export class SecurityCoreError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, options: SecurityCoreErrorOptions) {
    super(message);

    this.name = "SecurityCoreError";
    this.code = options.code;
    this.details = options.details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
