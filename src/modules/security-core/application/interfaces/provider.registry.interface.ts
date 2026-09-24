import type { SecurityProvider } from "../../types/provider.types.js";

export interface ProviderRegistry {
  register(provider: SecurityProvider): void;

  get(providerId: string): SecurityProvider | null;

  has(providerId: string): boolean;

  list(): SecurityProvider[];

  remove(providerId: string): boolean;
}
