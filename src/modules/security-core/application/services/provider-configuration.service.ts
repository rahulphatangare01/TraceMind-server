import { securityProviderConfigurationSchema } from "../../schemas/provider-configuration.schema.js";

import type { SecurityProviderConfiguration } from "../../types/provider-configuration.types.js";

export class ProviderConfigurationService {
  validate(
    configuration: SecurityProviderConfiguration,
  ): SecurityProviderConfiguration {
    return securityProviderConfigurationSchema.parse(configuration);
  }
}
