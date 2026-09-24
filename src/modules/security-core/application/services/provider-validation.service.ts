import type {
  SecurityProvider,
  SecurityProviderMetadata,
} from "../../types/provider.types.js";

import { SecurityProviderStatus } from "../../types/provider.types.js";

import { securityProviderMetadataSchema } from "../../schemas/provider-metadata.schema.js";

import { ProviderValidationError } from "../../errors/provider-validation.error.js";

import type { ProviderValidationResult } from "../../types/provider-validation.types.js";

export class ProviderValidationService {
  validate(provider: SecurityProvider): ProviderValidationResult {
    if (!provider) {
      throw new ProviderValidationError("Provider is required");
    }

    let metadata: SecurityProviderMetadata;

    try {
      metadata = securityProviderMetadataSchema.parse(provider.getMetadata());
    } catch {
      throw new ProviderValidationError("Provider metadata is invalid");
    }

    const status = provider.getStatus();

    if (!Object.values(SecurityProviderStatus).includes(status)) {
      throw new ProviderValidationError(
        `Invalid provider status: ${String(status)}`,
      );
    }

    if (metadata.id.trim() !== metadata.id) {
      throw new ProviderValidationError("Provider id must be normalized");
    }

    return {
      valid: true,
      metadata,
      status,
    };
  }
}
