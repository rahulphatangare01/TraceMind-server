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

import { ProviderRegistryError } from "../../errors/provider-registry.error.js";

const createProvider = (id: string, name = id): SecurityProvider => {
  const metadata: SecurityProviderMetadata = {
    id,
    name,
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

describe("ProviderRegistryService", () => {
  it("should register a provider", () => {
    const registry = new ProviderRegistryService();
    const provider = createProvider("local-provider");

    registry.register(provider);

    expect(registry.has("local-provider")).toBe(true);
  });

  it("should retrieve a registered provider", () => {
    const registry = new ProviderRegistryService();
    const provider = createProvider("local-provider");

    registry.register(provider);

    expect(registry.get("local-provider")).toBe(provider);
  });

  it("should return null for an unknown provider", () => {
    const registry = new ProviderRegistryService();

    expect(registry.get("unknown-provider")).toBeNull();
  });

  it("should report whether a provider exists", () => {
    const registry = new ProviderRegistryService();
    const provider = createProvider("local-provider");

    expect(registry.has("local-provider")).toBe(false);

    registry.register(provider);

    expect(registry.has("local-provider")).toBe(true);
  });

  it("should list registered providers", () => {
    const registry = new ProviderRegistryService();

    const providerOne = createProvider("provider-one");
    const providerTwo = createProvider("provider-two");

    registry.register(providerOne);
    registry.register(providerTwo);

    expect(registry.list()).toHaveLength(2);
    expect(registry.list()).toEqual([providerOne, providerTwo]);
  });

  it("should preserve registration order", () => {
    const registry = new ProviderRegistryService();

    const providerOne = createProvider("provider-one");
    const providerTwo = createProvider("provider-two");
    const providerThree = createProvider("provider-three");

    registry.register(providerOne);
    registry.register(providerTwo);
    registry.register(providerThree);

    expect(
      registry.list().map((provider) => provider.getMetadata().id),
    ).toEqual(["provider-one", "provider-two", "provider-three"]);
  });

  it("should reject duplicate provider registration", () => {
    const registry = new ProviderRegistryService();

    const providerOne = createProvider("local-provider");
    const providerTwo = createProvider("local-provider");

    registry.register(providerOne);

    expect(() => registry.register(providerTwo)).toThrow(ProviderRegistryError);
  });

  it("should remove a registered provider", () => {
    const registry = new ProviderRegistryService();
    const provider = createProvider("local-provider");

    registry.register(provider);

    expect(registry.remove("local-provider")).toBe(true);
    expect(registry.has("local-provider")).toBe(false);
    expect(registry.get("local-provider")).toBeNull();
  });

  it("should return false when removing an unknown provider", () => {
    const registry = new ProviderRegistryService();

    expect(registry.remove("unknown-provider")).toBe(false);
  });

  it("should allow registration after a provider is removed", () => {
    const registry = new ProviderRegistryService();

    const providerOne = createProvider("local-provider");

    registry.register(providerOne);
    registry.remove("local-provider");

    const providerTwo = createProvider("local-provider");

    expect(() => registry.register(providerTwo)).not.toThrow();
    expect(registry.get("local-provider")).toBe(providerTwo);
  });

  it("should keep providers isolated by registry instance", () => {
    const registryOne = new ProviderRegistryService();
    const registryTwo = new ProviderRegistryService();

    const provider = createProvider("local-provider");

    registryOne.register(provider);

    expect(registryOne.has("local-provider")).toBe(true);
    expect(registryTwo.has("local-provider")).toBe(false);
  });

  it("should not expose internal registry mutation through list", () => {
    const registry = new ProviderRegistryService();

    const providerOne = createProvider("provider-one");
    const providerTwo = createProvider("provider-two");

    registry.register(providerOne);
    registry.register(providerTwo);

    const providers = registry.list();

    providers.pop();

    expect(registry.list()).toHaveLength(2);
  });
});
