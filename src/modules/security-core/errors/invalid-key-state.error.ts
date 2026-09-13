import { SecurityCoreError } from "./security-core.error.js";

export class InvalidKeyStateError extends SecurityCoreError {
  constructor(message: string) {
    super(message, {
      code: "INVALID_KEY_STATE",
    });
  }
}
