// import { ProviderError } from "./provider.error.js";
// import { ProviderErrorCode } from "../types/provider-error.types.js";

// export class ProviderDisabledError extends ProviderError {
//   constructor(providerId?: string) {
//     super(
//       "Security provider is disabled",
//       ProviderErrorCode.PROVIDER_DISABLED,
//       {
//         providerId,
//         retryable: false,
//       },
//     );

//     this.name = "ProviderDisabledError";
//   }
// }

import { ProviderError } from "./provider.error.js";
import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderDisabledError extends ProviderError {
  constructor(message: string) {
    super(message, ProviderErrorCode.PROVIDER_DISABLED);

    this.name = "ProviderDisabledError";
  }
}
