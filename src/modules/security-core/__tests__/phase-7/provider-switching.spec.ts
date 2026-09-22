import { beforeEach, describe, expect, it } from "vitest";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/";

import type {
  SecurityProvider,
  SecurityProviderMetadata,
} from "../../types/provider.types.js";

import { ProviderRegistryService } from "../../application/services/provider-registry.service";
import { ProviderResolverService } from "../../application/services/provider-resolver.service";

/**
 * ============================================================================
 * Phase 7.13
 * Provider Switching Tests
 * ============================================================================
 *
 * Purpose:
 *
 * Verify that the provider architecture can switch from one registered
 * provider to another without:
 *
 * - leaking provider identity
 * - leaking provider metadata
 * - leaking provider capabilities
 * - leaking provider status
 * - mutating the previous provider
 * - silently falling back
 * - removing providers from the registry
 *
 * Scope:
 *
 * - ProviderRegistryService
 * - ProviderResolverService
 * - Provider selection
 * - Provider switching
 *
 * Out of scope:
 *
 * - IAM
 * - RBAC
 * - UBAC
 * - Entitlements
 * - Database persistence
 * - AWS KMS
 * - Azure Key Vault
 * - GCP KMS
 * - HashiCorp Vault
 * - Customer-managed KMS
 * - Cryptographic operations
 * ============================================================================
 */

// ============================================================================
// Test Helpers
// ============================================================================

const createProvider = (
  id: string,
  options: {
    name?: string;
    version?: string;
    type?: SecurityProviderType;
    capabilities?: SecurityProviderCapability[];
    status?: SecurityProviderStatus;
  } = {},
): SecurityProvider => {
  const metadata: SecurityProviderMetadata = {
    id,
    name: options.name ?? id,
    type: options.type ?? SecurityProviderType.LOCAL,
    version: options.version ?? "1.0.0",
    capabilities: [
      ...(options.capabilities ?? [SecurityProviderCapability.KEY_MANAGEMENT]),
    ],
  };

  const status = options.status ?? SecurityProviderStatus.READY;

  return {
    getMetadata: () => ({
      ...metadata,
      capabilities: [...metadata.capabilities],
    }),

    getStatus: () => status,
  };
};

// ============================================================================
// Test Suite
// ============================================================================

describe("Phase 7.13 - Provider Switching", () => {
  let registry: ProviderRegistryService;
  let resolver: ProviderResolverService;

  beforeEach(() => {
    registry = new ProviderRegistryService();

    resolver = new ProviderResolverService(registry);
  });

  // ==========================================================================
  // Test 1
  // ==========================================================================

  it("should resolve the initially selected provider", () => {
    const providerA = createProvider("provider-a");

    registry.register(providerA);

    const currentProvider = resolver.resolve("provider-a");

    expect(currentProvider).toBe(providerA);
  });

  // ==========================================================================
  // Test 2
  // ==========================================================================

  it("should switch from provider A to provider B", () => {
    const providerA = createProvider("provider-a");

    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    const currentProvider = resolver.resolve("provider-a");

    expect(currentProvider).toBe(providerA);

    const switchedProvider = resolver.resolve("provider-b");

    expect(switchedProvider).toBe(providerB);
  });

  // ==========================================================================
  // Test 3
  // ==========================================================================

  it("should return a different provider after switching", () => {
    const providerA = createProvider("provider-a");

    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    const currentProvider = resolver.resolve("provider-a");

    const switchedProvider = resolver.resolve("provider-b");

    expect(currentProvider).not.toBe(switchedProvider);

    expect(currentProvider).toBe(providerA);
    expect(switchedProvider).toBe(providerB);
  });

  // ==========================================================================
  // Test 4
  // ==========================================================================

  it("should preserve provider A after switching to provider B", () => {
    const providerA = createProvider("provider-a");

    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    const providerBeforeSwitch = resolver.resolve("provider-a");

    resolver.resolve("provider-b");

    const providerAfterSwitch = resolver.resolve("provider-a");

    expect(providerBeforeSwitch).toBe(providerA);

    expect(providerAfterSwitch).toBe(providerA);

    expect(providerAfterSwitch).toBe(providerBeforeSwitch);
  });

  // ==========================================================================
  // Test 5
  // ==========================================================================

  it("should preserve provider B after switching from A to B", () => {
    const providerA = createProvider("provider-a");

    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    resolver.resolve("provider-a");

    const providerBFirst = resolver.resolve("provider-b");

    const providerBAfter = resolver.resolve("provider-b");

    expect(providerBFirst).toBe(providerB);
    expect(providerBAfter).toBe(providerB);

    expect(providerBAfter).toBe(providerBFirst);
  });

  // ==========================================================================
  // Test 6
  // ==========================================================================

  it("should preserve provider-specific metadata after switching", () => {
    const providerA = createProvider("provider-a", {
      name: "Provider A",
      version: "1.0.0",
    });

    const providerB = createProvider("provider-b", {
      name: "Provider B",
      version: "2.0.0",
    });

    registry.register(providerA);
    registry.register(providerB);

    resolver.resolve("provider-a");

    const metadataB = resolver.resolve("provider-b").getMetadata();

    expect(metadataB.id).toBe("provider-b");

    expect(metadataB.name).toBe("Provider B");

    expect(metadataB.version).toBe("2.0.0");
  });

  // ==========================================================================
  // Test 7
  // ==========================================================================

  it("should not carry provider A capabilities into provider B", () => {
    const providerA = createProvider("provider-a", {
      capabilities: [
        SecurityProviderCapability.ENCRYPTION,
        SecurityProviderCapability.DECRYPTION,
      ],
    });

    const providerB = createProvider("provider-b", {
      capabilities: [SecurityProviderCapability.SIGNING],
    });

    registry.register(providerA);
    registry.register(providerB);

    resolver.resolve("provider-a");

    const metadataB = resolver.resolve("provider-b").getMetadata();

    expect(metadataB.capabilities).toEqual([
      SecurityProviderCapability.SIGNING,
    ]);

    expect(metadataB.capabilities).not.toContain(
      SecurityProviderCapability.ENCRYPTION,
    );

    expect(metadataB.capabilities).not.toContain(
      SecurityProviderCapability.DECRYPTION,
    );
  });

  // ==========================================================================
  // Test 8
  // ==========================================================================

  it("should not mutate provider A when switching to provider B", () => {
    const providerA = createProvider("provider-a", {
      capabilities: [SecurityProviderCapability.ENCRYPTION],
    });

    const providerB = createProvider("provider-b", {
      capabilities: [SecurityProviderCapability.SIGNING],
    });

    registry.register(providerA);
    registry.register(providerB);

    const metadataABefore = providerA.getMetadata();

    resolver.resolve("provider-b");

    const metadataAAfter = providerA.getMetadata();

    expect(metadataAAfter).toEqual(metadataABefore);
  });

  // ==========================================================================
  // Test 9
  // ==========================================================================

  it("should preserve provider status during switching", () => {
    const providerA = createProvider("provider-a", {
      status: SecurityProviderStatus.READY,
    });

    const providerB = createProvider("provider-b", {
      status: SecurityProviderStatus.READY,
    });

    registry.register(providerA);
    registry.register(providerB);

    resolver.resolve("provider-a");

    resolver.resolve("provider-b");

    expect(providerA.getStatus()).toBe(SecurityProviderStatus.READY);

    expect(providerB.getStatus()).toBe(SecurityProviderStatus.READY);
  });

  // ==========================================================================
  // Test 10
  // ==========================================================================

  it("should support switching between three providers", () => {
    const providerA = createProvider("provider-a");

    const providerB = createProvider("provider-b");

    const providerC = createProvider("provider-c");

    registry.register(providerA);
    registry.register(providerB);
    registry.register(providerC);

    expect(resolver.resolve("provider-a")).toBe(providerA);

    expect(resolver.resolve("provider-b")).toBe(providerB);

    expect(resolver.resolve("provider-c")).toBe(providerC);

    expect(resolver.resolve("provider-a")).toBe(providerA);
  });

  // ==========================================================================
  // Test 11
  // ==========================================================================

  it("should allow switching back to the original provider", () => {
    const providerA = createProvider("provider-a");

    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    const firstA = resolver.resolve("provider-a");

    resolver.resolve("provider-b");

    const secondA = resolver.resolve("provider-a");

    expect(firstA).toBe(providerA);
    expect(secondA).toBe(providerA);

    expect(secondA).toBe(firstA);
  });

  // ==========================================================================
  // Test 12
  // ==========================================================================

  it("should not silently fallback when switching to an unknown provider", () => {
    const providerA = createProvider("provider-a");

    registry.register(providerA);

    resolver.resolve("provider-a");

    expect(() => resolver.resolve("provider-b")).toThrow(
      "Provider could not be resolved: provider-b",
    );
  });

  // ==========================================================================
  // Test 13
  // ==========================================================================

  it("should keep the previously registered provider available after failed switching", () => {
    const providerA = createProvider("provider-a");

    registry.register(providerA);

    const providerBeforeFailure = resolver.resolve("provider-a");

    expect(() => resolver.resolve("missing-provider")).toThrow(
      "Provider could not be resolved: missing-provider",
    );

    const providerAfterFailure = resolver.resolve("provider-a");

    expect(providerAfterFailure).toBe(providerBeforeFailure);

    expect(providerAfterFailure).toBe(providerA);
  });

  // ==========================================================================
  // Test 14
  // ==========================================================================

  it("should not remove providers during switching", () => {
    const providerA = createProvider("provider-a");

    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    resolver.resolve("provider-a");
    resolver.resolve("provider-b");

    expect(registry.has("provider-a")).toBe(true);

    expect(registry.has("provider-b")).toBe(true);

    expect(registry.list()).toHaveLength(2);
  });

  // ==========================================================================
  // Test 15
  // ==========================================================================

  it("should preserve provider identity through repeated switching", () => {
    const providerA = createProvider("provider-a");

    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    const results = [
      resolver.resolve("provider-a"),
      resolver.resolve("provider-b"),
      resolver.resolve("provider-a"),
      resolver.resolve("provider-b"),
      resolver.resolve("provider-a"),
    ];

    expect(results[0]).toBe(providerA);
    expect(results[1]).toBe(providerB);
    expect(results[2]).toBe(providerA);
    expect(results[3]).toBe(providerB);
    expect(results[4]).toBe(providerA);
  });

  // ==========================================================================
  // Test 16
  // ==========================================================================

  it("should keep all providers isolated after repeated switching", () => {
    const providerA = createProvider("provider-a", {
      capabilities: [SecurityProviderCapability.ENCRYPTION],
    });

    const providerB = createProvider("provider-b", {
      capabilities: [SecurityProviderCapability.SIGNING],
    });

    const providerC = createProvider("provider-c", {
      capabilities: [SecurityProviderCapability.HMAC],
    });

    registry.register(providerA);
    registry.register(providerB);
    registry.register(providerC);

    resolver.resolve("provider-a");
    resolver.resolve("provider-b");
    resolver.resolve("provider-c");
    resolver.resolve("provider-b");
    resolver.resolve("provider-a");

    expect(providerA.getMetadata().capabilities).toEqual([
      SecurityProviderCapability.ENCRYPTION,
    ]);

    expect(providerB.getMetadata().capabilities).toEqual([
      SecurityProviderCapability.SIGNING,
    ]);

    expect(providerC.getMetadata().capabilities).toEqual([
      SecurityProviderCapability.HMAC,
    ]);
  });
});
