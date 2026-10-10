import type { SecurityProvider } from "../../types/provider.types.js";

import type { ProviderResolver } from "../interfaces/provider.resolver.interface.js";

export class SecurityServiceProviderResolution {
  constructor(private readonly providerResolver: ProviderResolver) {}

  resolve(providerId: string): SecurityProvider {
    return this.providerResolver.resolve(providerId);
  }
}
