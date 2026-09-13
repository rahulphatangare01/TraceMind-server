import { SecurityCoreError } from "./security-core.error.js";

export class KeyNotFoundError extends SecurityCoreError {
  constructor(keyId: string) {
    super(`Security key "${keyId}" was not found`, {
      code: "SECURITY_KEY_NOT_FOUND",
    });
  }
}
