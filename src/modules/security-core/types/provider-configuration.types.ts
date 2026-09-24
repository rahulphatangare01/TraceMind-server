import type { SecurityProviderType } from "./provider.types.js";

export interface SecurityProviderConfiguration {
  providerId: string;
  type: SecurityProviderType;
  settings: Record<string, unknown>;
}
