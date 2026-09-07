export interface AppErrorOptions {
  code: string;
  statusCode: number;
  details?: unknown;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(message: string, options: AppErrorOptions) {
    super(message);

    this.name = "AppError";

    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;

    this.isOperational = options.isOperational ?? true;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
