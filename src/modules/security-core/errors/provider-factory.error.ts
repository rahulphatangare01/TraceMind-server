// export class ProviderFactoryError extends Error {
//   public readonly code = "PROVIDER_FACTORY_ERROR";

//   constructor(providerType: string) {
//     super(`Provider implementation is not available for type: ${providerType}`);

//     this.name = "ProviderFactoryError";
//   }
// }
import { ProviderError } from "./provider.error.js";
import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderFactoryError extends ProviderError {
  constructor(message: string) {
    super(message, ProviderErrorCode.PROVIDER_FACTORY_ERROR);

    this.name = "ProviderFactoryError";
  }
}
