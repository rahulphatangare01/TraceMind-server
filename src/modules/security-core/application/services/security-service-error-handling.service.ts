import { SecurityCoreError } from "../../errors/security-core.error.js";

import { SecurityContextValidationError } from "../../errors/security-context-validation.error.js";

import { SecurityBoundaryValidationError } from "../../errors/security-boundary-validation.error.js";

export class SecurityServiceErrorHandlingService {
  execute<T>(operation: () => T): T {
    try {
      return operation();
    } catch (error) {
      throw this.normalize(error);
    }
  }

  async executeAsync<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw this.normalize(error);
    }
  }

  normalize(error: unknown): Error {
    if (error instanceof SecurityCoreError) {
      return error;
    }

    if (error instanceof SecurityContextValidationError) {
      return error;
    }

    if (error instanceof SecurityBoundaryValidationError) {
      return error;
    }

    return new SecurityCoreError("Security service operation failed", {
      code: "SECURITY_SERVICE_ERROR",
    });
  }
}
