import { SecurityCoreError } from "./security-core.error.js";

export class CryptoOperationError extends SecurityCoreError {
  constructor(message = "Cryptographic operation failed", details?: unknown) {
    super(message, {
      code: "CRYPTO_OPERATION_FAILED",
      details,
    });
  }
}
