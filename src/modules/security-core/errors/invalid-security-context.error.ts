import { SecurityCoreError } from "./security-core.error.js";

export class InvalidSecurityContextError extends SecurityCoreError {
  constructor(message = "Invalid security context") {
    super(message, {
      code: "INVALID_SECURITY_CONTEXT",
    });
  }
}
