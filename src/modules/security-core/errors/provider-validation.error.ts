// export class ProviderValidationError extends Error {
//   public readonly code = "PROVIDER_VALIDATION_ERROR";

//   constructor(message: string) {
//     super(message);
//     this.name = "ProviderValidationError";
//   }
// }

import { ProviderError } from "./provider.error.js";
import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderValidationError extends ProviderError {
  constructor(message: string) {
    super(message, ProviderErrorCode.PROVIDER_VALIDATION_ERROR);

    this.name = "ProviderValidationError";
  }
}
