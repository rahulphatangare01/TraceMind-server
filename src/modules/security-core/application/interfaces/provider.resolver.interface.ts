import type { SecurityProvider } from "../../types/provider.types.js";

export interface ProviderResolver {
  resolve(providerId: string): SecurityProvider;
}
