// import type { ProviderRegistry } from "../interfaces/provider.registry.interface.js";
// import type { ProviderResolver } from "../interfaces/provider.resolver.interface.js";
// import type { SecurityProvider } from "../../types/provider.types.js";
// import { ProviderResolverError } from "../../errors/provider-resolver.error.js";

// export class ProviderResolverService implements ProviderResolver {
//   constructor(private readonly registry: ProviderRegistry) {}

//   resolve(providerId: string): SecurityProvider {
//     const provider = this.registry.get(providerId);

//     if (!provider) {
//       throw new ProviderResolverError(providerId);
//     }

//     return provider;
//   }
// }
import type { SecurityProvider } from "../../types/provider.types.js";
import type { ProviderResolver } from "../interfaces/provider.resolver.interface.js";

import type { ProviderRegistry } from "../interfaces/provider.registry.interface.js";

import { ProviderResolverError } from "../../errors/provider-resolver.error.js";

export class ProviderResolverService implements ProviderResolver {
  constructor(private readonly registry: ProviderRegistry) {}

  resolve(providerId: string): SecurityProvider {
    const provider = this.registry.get(providerId);

    if (!provider) {
      throw new ProviderResolverError(
        `Provider could not be resolved: ${providerId}`,
      );
    }

    return provider;
  }
}
