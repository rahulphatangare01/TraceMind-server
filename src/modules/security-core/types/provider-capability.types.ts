import { SecurityProviderCapability } from "./provider.types.js";

export interface ProviderCapabilitySet {
  capabilities: SecurityProviderCapability[];
}

export interface ProviderCapabilityCheck {
  capability: SecurityProviderCapability;
  supported: boolean;
}
