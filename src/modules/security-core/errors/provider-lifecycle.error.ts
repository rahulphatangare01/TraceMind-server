// export class ProviderLifecycleError extends Error {
//   public readonly code = "INVALID_PROVIDER_LIFECYCLE_TRANSITION";

//   constructor(
//     public readonly from: string,
//     public readonly to: string,
//   ) {
//     super(`Invalid provider lifecycle transition: ${from} -> ${to}`);

//     this.name = "ProviderLifecycleError";
//   }
// }

import { ProviderError } from "./provider.error.js";
import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderLifecycleError extends ProviderError {
  constructor(message: string) {
    super(message, ProviderErrorCode.PROVIDER_LIFECYCLE_ERROR);

    this.name = "ProviderLifecycleError";
  }
}
