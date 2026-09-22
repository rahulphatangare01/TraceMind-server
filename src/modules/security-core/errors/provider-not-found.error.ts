// import { ProviderError } from "./provider.error.js";
// import { ProviderErrorCode } from "../types/provider-error.types.js";

// export class ProviderNotFoundError extends ProviderError {
//   constructor(providerId: string) {
//     super(
//       `Security provider not found: ${providerId}`,
//       ProviderErrorCode.PROVIDER_NOT_FOUND,
//       {
//         providerId,
//         retryable: false,
//       },
//     );

//     this.name = "ProviderNotFoundError";
//   }
// }

import { ProviderError } from "./provider.error.js";
import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderNotFoundError extends ProviderError {
  constructor(message: string) {
    super(message, ProviderErrorCode.PROVIDER_NOT_FOUND);

    this.name = "ProviderNotFoundError";
  }
}
