import type {
  SecurityProvider,
  SecurityProviderType,
} from "../../types/provider.types.js";

import { SecurityProviderType as ProviderType } from "../../types/provider.types.js";

import type { ProviderFactory } from "../interfaces/provider.factory.interface.js";

import { ProviderFactoryError } from "../../errors/provider-factory.error.js";

import { LocalSecurityProvider } from "../../providers/local/local-security.provider.js";

export class ProviderFactoryService implements ProviderFactory {
  create(type: SecurityProviderType): SecurityProvider {
    switch (type) {
      case ProviderType.LOCAL:
        return new LocalSecurityProvider();

      case ProviderType.AWS_KMS:
      case ProviderType.AZURE_KEY_VAULT:
      case ProviderType.GCP_KMS:
      case ProviderType.HASHICORP_VAULT:
      case ProviderType.CUSTOM:
        throw new ProviderFactoryError(type);

      default:
        throw new ProviderFactoryError(type);
    }
  }
}
