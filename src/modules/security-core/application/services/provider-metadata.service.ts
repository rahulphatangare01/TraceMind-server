import { securityProviderMetadataSchema } from "../../schemas/provider-metadata.schema.js";

import type { SecurityProviderMetadata } from "../../types/provider.types.js";

export class ProviderMetadataService {
  validate(metadata: SecurityProviderMetadata): SecurityProviderMetadata {
    return securityProviderMetadataSchema.parse(metadata);
  }
}
