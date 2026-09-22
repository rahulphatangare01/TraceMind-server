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

import { ProviderResolverError } from "../../errors/provider-resolver.error.js";

const createProvider = (
  id: string,
  type: SecurityProviderType = SecurityProviderType.LOCAL,
): SecurityProvider => {
  const metadata: SecurityProviderMetadata = {
    id,
    name: id,
    type,
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

describe("ProviderResolverService", () => {
  it("should resolve a registered provider", () => {
    const registry = new ProviderRegistryService();
    const resolver = new ProviderResolverService(registry);

    const provider = createProvider("local-provider");

    registry.register(provider);

    expect(resolver.resolve("local-provider")).toBe(provider);
  });

  it("should resolve the correct provider when multiple providers exist", () => {
    const registry = new ProviderRegistryService();
    const resolver = new ProviderResolverService(registry);

    const localProvider = createProvider(
      "local-provider",
      SecurityProviderType.LOCAL,
    );

    const awsProvider = createProvider(
      "aws-provider",
      SecurityProviderType.AWS_KMS,
    );

    registry.register(localProvider);
    registry.register(awsProvider);

    expect(resolver.resolve("local-provider")).toBe(localProvider);
    expect(resolver.resolve("aws-provider")).toBe(awsProvider);
  });

  it("should reject an unknown provider", () => {
    const registry = new ProviderRegistryService();
    const resolver = new ProviderResolverService(registry);

    expect(() => resolver.resolve("unknown-provider")).toThrow(
      ProviderResolverError,
    );
  });

  it("should include the provider id in the resolution error", () => {
    const registry = new ProviderRegistryService();
    const resolver = new ProviderResolverService(registry);

    expect(() => resolver.resolve("missing-provider")).toThrow(
      "Provider could not be resolved: missing-provider",
    );
  });

  it("should not resolve a removed provider", () => {
    const registry = new ProviderRegistryService();
    const resolver = new ProviderResolverService(registry);

    const provider = createProvider("local-provider");

    registry.register(provider);
    registry.remove("local-provider");

    expect(() => resolver.resolve("local-provider")).toThrow(
      ProviderResolverError,
    );
  });

  it("should resolve the provider currently registered under an id", () => {
    const registry = new ProviderRegistryService();
    const resolver = new ProviderResolverService(registry);

    const firstProvider = createProvider("local-provider");

    registry.register(firstProvider);

    expect(resolver.resolve("local-provider")).toBe(firstProvider);

    registry.remove("local-provider");

    const replacementProvider = createProvider("local-provider");

    registry.register(replacementProvider);

    expect(resolver.resolve("local-provider")).toBe(replacementProvider);
  });

  it("should resolve providers independently by provider id", () => {
    const registry = new ProviderRegistryService();
    const resolver = new ProviderResolverService(registry);

    const providerOne = createProvider(
      "provider-one",
      SecurityProviderType.LOCAL,
    );

    const providerTwo = createProvider(
      "provider-two",
      SecurityProviderType.LOCAL,
    );

    registry.register(providerOne);
    registry.register(providerTwo);

    expect(resolver.resolve("provider-one")).toBe(providerOne);
    expect(resolver.resolve("provider-two")).toBe(providerTwo);
  });

  it("should not silently fallback to another provider", () => {
    const registry = new ProviderRegistryService();
    const resolver = new ProviderResolverService(registry);

    const localProvider = createProvider(
      "local-provider",
      SecurityProviderType.LOCAL,
    );

    const awsProvider = createProvider(
      "aws-provider",
      SecurityProviderType.AWS_KMS,
    );

    registry.register(localProvider);
    registry.register(awsProvider);

    expect(() => resolver.resolve("missing-provider")).toThrow(
      ProviderResolverError,
    );
  });

  it("should return the exact registered provider instance", () => {
    const registry = new ProviderRegistryService();
    const resolver = new ProviderResolverService(registry);

    const provider = createProvider("local-provider");

    registry.register(provider);

    const resolvedProvider = resolver.resolve("local-provider");

    expect(resolvedProvider).toBe(provider);
    expect(resolvedProvider.getMetadata()).toBe(provider.getMetadata());
  });

  it("should use the registry as the source of truth", () => {
    const registry = new ProviderRegistryService();
    const resolver = new ProviderResolverService(registry);

    const provider = createProvider("local-provider");

    registry.register(provider);

    expect(registry.has("local-provider")).toBe(true);
    expect(resolver.resolve("local-provider")).toBe(provider);
  });
});
