import { ProviderError } from "./provider.error.js";
import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderConfigurationError extends ProviderError {
  constructor(message: string) {
    super(message, ProviderErrorCode.PROVIDER_CONFIGURATION_ERROR);

    this.name = "ProviderConfigurationError";
  }
}
