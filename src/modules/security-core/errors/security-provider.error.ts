import { SecurityCoreError } from "./security-core.error.js";

export class SecurityProviderError extends SecurityCoreError {
  constructor(
    message = "Security provider operation failed",
    details?: unknown,
  ) {
    super(message, {
      code: "SECURITY_PROVIDER_ERROR",
      details,
    });
  }
}
