import type {
  SecurityProviderMetadata,
  SecurityProviderStatus,
} from "../../types/provider.types.js";

export interface SecurityProvider {
  getMetadata(): SecurityProviderMetadata;

  getStatus(): SecurityProviderStatus;
}
