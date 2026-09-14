import { SecurityCoreError } from "./security-core.error.js";

export class InvalidCiphertextError extends SecurityCoreError {
  constructor(message = "Invalid encrypted payload") {
    super(message, {
      code: "INVALID_CIPHERTEXT",
    });
  }
}
