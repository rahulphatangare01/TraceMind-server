// import { ProviderError } from "./provider.error.js";
// import { ProviderErrorCode } from "../types/provider-error.types.js";

// export class ProviderUnavailableError extends ProviderError {
//   constructor(
//     message = "Security provider is unavailable",
//     context?: {
//       providerId?: string;
//       providerType?: string;
//       operation?: string;
//     },
//   ) {
//     super(message, ProviderErrorCode.PROVIDER_UNAVAILABLE, {
//       ...context,
//       retryable: true,
//     });

//     this.name = "ProviderUnavailableError";
//   }
// }

import { ProviderError } from "./provider.error.js";
import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderUnavailableError extends ProviderError {
  constructor(message: string) {
    super(message, ProviderErrorCode.PROVIDER_UNAVAILABLE);

    this.name = "ProviderUnavailableError";
  }
}
