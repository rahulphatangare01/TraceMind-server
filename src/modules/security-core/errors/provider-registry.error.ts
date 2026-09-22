// export class ProviderRegistryError extends Error {
//   public readonly code = "PROVIDER_REGISTRY_ERROR";

//   constructor(message: string) {
//     super(message);
//     this.name = "ProviderRegistryError";
//   }
// }

import { ProviderError } from "./provider.error.js";
import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderRegistryError extends ProviderError {
  constructor(message: string) {
    super(message, ProviderErrorCode.PROVIDER_REGISTRY_ERROR);

    this.name = "ProviderRegistryError";
  }
}
