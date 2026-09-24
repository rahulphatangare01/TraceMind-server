import type {
  SecurityProviderMetadata,
  SecurityProviderStatus,
} from "./provider.types.js";

export interface ProviderValidationResult {
  valid: boolean;
  metadata: SecurityProviderMetadata;
  status: SecurityProviderStatus;
}
