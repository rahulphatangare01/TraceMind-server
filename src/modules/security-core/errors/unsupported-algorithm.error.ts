import { SecurityCoreError } from "./security-core.error.js";

export class UnsupportedAlgorithmError extends SecurityCoreError {
  constructor(algorithm: string) {
    super(`Unsupported cryptographic algorithm "${algorithm}"`, {
      code: "UNSUPPORTED_CRYPTO_ALGORITHM",
    });
  }
}
