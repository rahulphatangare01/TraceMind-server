// export class ProviderCapabilityError extends Error {
//   public readonly code = "PROVIDER_CAPABILITY_NOT_SUPPORTED";

//   constructor(capability: string) {
//     super(`Provider does not support capability: ${capability}`);

//     this.name = "ProviderCapabilityError";
//   }
// }
import { ProviderError } from "./provider.error.js";
import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderCapabilityError extends ProviderError {
  constructor(message: string) {
    super(message, ProviderErrorCode.PROVIDER_CAPABILITY_NOT_SUPPORTED);

    this.name = "ProviderCapabilityError";
  }
}
