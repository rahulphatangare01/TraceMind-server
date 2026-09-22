import type { SecurityProvider } from "../../types/provider.types.js";
import { ProviderRegistryError } from "../../errors/provider-registry.error.js";
import type { ProviderRegistry } from "../interfaces/provider.registry.interface.js";

export class ProviderRegistryService implements ProviderRegistry {
  private readonly providers = new Map<string, SecurityProvider>();

  register(provider: SecurityProvider): void {
    const providerId = provider.getMetadata().id;

    if (this.providers.has(providerId)) {
      throw new ProviderRegistryError(
        `Provider is already registered: ${providerId}`,
      );
    }

    this.providers.set(providerId, provider);
  }

  get(providerId: string): SecurityProvider | null {
    return this.providers.get(providerId) ?? null;
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  list(): SecurityProvider[] {
    return Array.from(this.providers.values());
  }

  remove(providerId: string): boolean {
    return this.providers.delete(providerId);
  }
}
