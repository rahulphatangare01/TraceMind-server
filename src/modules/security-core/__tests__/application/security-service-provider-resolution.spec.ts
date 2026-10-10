import { describe, expect, it } from "vitest";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/provider.types.js";

import type {
  SecurityProvider,
  SecurityProviderMetadata,
} from "../../types/provider.types.js";

import { ProviderRegistryService } from "../../application/services/provider-registry.service.js";

import { ProviderResolverService } from "../../application/services/provider-resolver.service.js";

import { SecurityServiceProviderResolution } from "../../application/services/security-service-provider-resolution.service.js";

import { ProviderResolverError } from "../../errors/provider-resolver.error.js";

const createProvider = (id: string): SecurityProvider => {
  const metadata: SecurityProviderMetadata = {
    id,
    name: id,
    type: SecurityProviderType.LOCAL,
    version: "1.0.0",
    capabilities: [
      SecurityProviderCapability.KEY_MANAGEMENT,
      SecurityProviderCapability.ENCRYPTION,
    ],
  };

  return {
    getMetadata: () => metadata,

    getStatus: () => SecurityProviderStatus.READY,
  };
};

describe("SecurityServiceProviderResolution", () => {
  it("resolves a registered provider", () => {
    const registry = new ProviderRegistryService();

    const resolver = new ProviderResolverService(registry);

    const service = new SecurityServiceProviderResolution(resolver);

    const provider = createProvider("local-provider");

    registry.register(provider);

    expect(service.resolve("local-provider")).toBe(provider);
  });

  it("resolves the correct provider when multiple providers exist", () => {
    const registry = new ProviderRegistryService();

    const resolver = new ProviderResolverService(registry);

    const service = new SecurityServiceProviderResolution(resolver);

    const providerA = createProvider("provider-a");

    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    expect(service.resolve("provider-a")).toBe(providerA);

    expect(service.resolve("provider-b")).toBe(providerB);
  });

  it("does not silently fallback when provider is missing", () => {
    const registry = new ProviderRegistryService();

    const resolver = new ProviderResolverService(registry);

    const service = new SecurityServiceProviderResolution(resolver);

    registry.register(createProvider("local-provider"));

    expect(() => service.resolve("missing-provider")).toThrow(
      ProviderResolverError,
    );
  });

  it("preserves the provider resolution error", () => {
    const registry = new ProviderRegistryService();

    const resolver = new ProviderResolverService(registry);

    const service = new SecurityServiceProviderResolution(resolver);

    expect(() => service.resolve("missing-provider")).toThrow(
      "Provider could not be resolved: missing-provider",
    );
  });
});
