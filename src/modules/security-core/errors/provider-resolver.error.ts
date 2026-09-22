// import { ProviderError } from "./provider.error";

// // export class ProviderResolverError extends Error {
// export class ProviderResolverError extends ProviderError {
//   public readonly code = "PROVIDER_RESOLUTION_ERROR";

//   constructor(providerId: string) {
//     super(`Provider could not be resolved: ${providerId}`);

//     this.name = "ProviderResolverError";
//   }
// }

// // export class ProviderResolverError extends ProviderError {
// //   constructor(message: string) {
// //     super(
// //       message,
// //       ProviderErrorCode.PROVIDER_RESOLUTION_ERROR,
// //       {
// //         retryable: false,
// //       },
// //     );

// //     this.name = "ProviderResolverError";
// //   }
// // }

// import { ProviderError } from "./provider.error.js";
// import { ProviderErrorCode } from "../types/provider-error.types.js";

// export class ProviderResolverError extends ProviderError {
//   constructor(message: string) {
//     super(message, ProviderErrorCode.PROVIDER_RESOLUTION_ERROR);

//     this.name = "ProviderResolverError";
//   }
// }
import { ProviderError } from "./provider.error.js";
import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderResolverError extends ProviderError {
  constructor(message: string) {
    super(message, ProviderErrorCode.PROVIDER_RESOLUTION_ERROR);

    this.name = "ProviderResolverError";
  }
}
