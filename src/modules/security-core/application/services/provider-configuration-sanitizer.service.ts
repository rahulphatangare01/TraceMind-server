import type { SecurityProviderConfiguration } from "../../types/provider-configuration.types.js";

export class ProviderConfigurationSanitizerService {
  sanitize(
    configuration: SecurityProviderConfiguration,
  ): SecurityProviderConfiguration {
    return {
      providerId: configuration.providerId.trim(),
      type: configuration.type,
      settings: {
        ...configuration.settings,
      },
    };
  }
}
