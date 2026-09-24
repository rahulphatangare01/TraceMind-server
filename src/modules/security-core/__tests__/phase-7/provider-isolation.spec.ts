import { describe, expect, it, beforeEach } from "vitest";

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

/**
 * ============================================================================
 * Phase 7.12
 * Provider Isolation Tests
 * ============================================================================
 *
 * Purpose:
 * - Verify multiple providers can coexist safely.
 * - Verify provider state is isolated.
 * - Verify provider identity is isolated.
 * - Verify metadata/capabilities are isolated.
 * - Verify removing one provider does not affect another.
 * - Verify resolver never silently falls back to another provider.
 *
 * Scope:
 * - Registry
 * - Resolver
 * - Provider metadata
 * - Provider status
 * - Provider capabilities
 *
 * Explicitly OUT OF SCOPE:
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

/**
 * Creates an isolated test provider.
 *
 * Important:
 * Every invocation creates a new provider object and a new metadata object.
 * This prevents accidental shared state between test providers.
 */
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
    /**
     * Return a fresh metadata object.
     *
     * This is intentional.
     * A caller modifying the returned metadata must not mutate
     * the provider's internal state.
     */
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

describe("Phase 7.12 - Provider Isolation", () => {
  let registry: ProviderRegistryService;
  let resolver: ProviderResolverService;

  beforeEach(() => {
    /**
     * Create a completely fresh registry/resolver for every test.
     *
     * This prevents state from one test leaking into another test.
     */
    registry = new ProviderRegistryService();
    resolver = new ProviderResolverService(registry);
  });

  // ==========================================================================
  // Test 1
  // ==========================================================================

  it("should allow multiple independent providers to coexist", () => {
    const providerA = createProvider("provider-a");
    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    expect(registry.has("provider-a")).toBe(true);
    expect(registry.has("provider-b")).toBe(true);

    expect(registry.list()).toHaveLength(2);
  });

  // ==========================================================================
  // Test 2
  // ==========================================================================

  it("should preserve independent provider identities", () => {
    const providerA = createProvider("provider-a");
    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    expect(registry.get("provider-a")).toBe(providerA);
    expect(registry.get("provider-b")).toBe(providerB);

    expect(registry.get("provider-a")).not.toBe(providerB);
    expect(registry.get("provider-b")).not.toBe(providerA);
  });

  // ==========================================================================
  // Test 3
  // ==========================================================================

  it("should resolve the exact requested provider", () => {
    const providerA = createProvider("provider-a");
    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    const resolvedA = resolver.resolve("provider-a");
    const resolvedB = resolver.resolve("provider-b");

    expect(resolvedA).toBe(providerA);
    expect(resolvedB).toBe(providerB);

    expect(resolvedA).not.toBe(providerB);
    expect(resolvedB).not.toBe(providerA);
  });

  // ==========================================================================
  // Test 4
  // ==========================================================================

  it("should isolate provider removal", () => {
    const providerA = createProvider("provider-a");
    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    const removed = registry.remove("provider-a");

    expect(removed).toBe(true);

    expect(registry.has("provider-a")).toBe(false);
    expect(registry.has("provider-b")).toBe(true);

    expect(registry.get("provider-a")).toBeNull();
    expect(registry.get("provider-b")).toBe(providerB);
  });

  // ==========================================================================
  // Test 5
  // ==========================================================================

  it("should preserve registry state for unaffected providers", () => {
    const providerA = createProvider("provider-a");
    const providerB = createProvider("provider-b");
    const providerC = createProvider("provider-c");

    registry.register(providerA);
    registry.register(providerB);
    registry.register(providerC);

    registry.remove("provider-b");

    expect(registry.has("provider-a")).toBe(true);
    expect(registry.has("provider-b")).toBe(false);
    expect(registry.has("provider-c")).toBe(true);

    expect(registry.get("provider-a")).toBe(providerA);
    expect(registry.get("provider-c")).toBe(providerC);

    expect(registry.list()).toHaveLength(2);
  });

  // ==========================================================================
  // Test 6
  // ==========================================================================

  it("should preserve independent provider metadata", () => {
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

    const metadataA = providerA.getMetadata();
    const metadataB = providerB.getMetadata();

    expect(metadataA.id).toBe("provider-a");
    expect(metadataA.name).toBe("Provider A");
    expect(metadataA.version).toBe("1.0.0");

    expect(metadataB.id).toBe("provider-b");
    expect(metadataB.name).toBe("Provider B");
    expect(metadataB.version).toBe("2.0.0");

    expect(metadataA.id).not.toBe(metadataB.id);
    expect(metadataA.name).not.toBe(metadataB.name);
  });

  // ==========================================================================
  // Test 7
  // ==========================================================================

  it("should preserve provider-specific capabilities", () => {
    const providerA = createProvider("provider-a", {
      capabilities: [
        SecurityProviderCapability.ENCRYPTION,
        SecurityProviderCapability.DECRYPTION,
      ],
    });

    const providerB = createProvider("provider-b", {
      capabilities: [
        SecurityProviderCapability.SIGNING,
        SecurityProviderCapability.HMAC,
      ],
    });

    registry.register(providerA);
    registry.register(providerB);

    const capabilitiesA = providerA.getMetadata().capabilities;

    const capabilitiesB = providerB.getMetadata().capabilities;

    expect(capabilitiesA).toEqual([
      SecurityProviderCapability.ENCRYPTION,
      SecurityProviderCapability.DECRYPTION,
    ]);

    expect(capabilitiesB).toEqual([
      SecurityProviderCapability.SIGNING,
      SecurityProviderCapability.HMAC,
    ]);

    expect(capabilitiesA).not.toEqual(capabilitiesB);
  });

  // ==========================================================================
  // Test 8
  // ==========================================================================

  it("should prevent metadata mutation from leaking between providers", () => {
    const providerA = createProvider("provider-a", {
      capabilities: [SecurityProviderCapability.ENCRYPTION],
    });

    const providerB = createProvider("provider-b", {
      capabilities: [SecurityProviderCapability.SIGNING],
    });

    const metadataA = providerA.getMetadata();

    metadataA.capabilities.push(SecurityProviderCapability.HMAC);

    const metadataBAfterMutation = providerB.getMetadata();

    expect(metadataBAfterMutation.capabilities).toEqual([
      SecurityProviderCapability.SIGNING,
    ]);

    expect(metadataBAfterMutation.capabilities).not.toContain(
      SecurityProviderCapability.HMAC,
    );
  });

  // ==========================================================================
  // Test 9
  // ==========================================================================

  it("should not share capability arrays between providers", () => {
    const providerA = createProvider("provider-a", {
      capabilities: [SecurityProviderCapability.ENCRYPTION],
    });

    const providerB = createProvider("provider-b", {
      capabilities: [SecurityProviderCapability.ENCRYPTION],
    });

    const capabilitiesA = providerA.getMetadata().capabilities;

    const capabilitiesB = providerB.getMetadata().capabilities;

    expect(capabilitiesA).not.toBe(capabilitiesB);
  });

  // ==========================================================================
  // Test 10
  // ==========================================================================

  it("should preserve independent provider status", () => {
    const providerA = createProvider("provider-a", {
      status: SecurityProviderStatus.READY,
    });

    const providerB = createProvider("provider-b", {
      status: SecurityProviderStatus.DISABLED,
    });

    registry.register(providerA);
    registry.register(providerB);

    expect(providerA.getStatus()).toBe(SecurityProviderStatus.READY);

    expect(providerB.getStatus()).toBe(SecurityProviderStatus.DISABLED);
  });

  // ==========================================================================
  // Test 11
  // ==========================================================================

  it("should not allow disabled provider state to affect another provider", () => {
    const providerA = createProvider("provider-a", {
      status: SecurityProviderStatus.READY,
    });

    const providerB = createProvider("provider-b", {
      status: SecurityProviderStatus.DISABLED,
    });

    registry.register(providerA);
    registry.register(providerB);

    expect(providerB.getStatus()).toBe(SecurityProviderStatus.DISABLED);

    expect(providerA.getStatus()).toBe(SecurityProviderStatus.READY);

    /**
     * Provider A must remain completely unaffected.
     */
    expect(resolver.resolve("provider-a")).toBe(providerA);
  });

  // ==========================================================================
  // Test 12
  // ==========================================================================

  it("should not silently fallback to another registered provider", () => {
    const providerA = createProvider("provider-a");
    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    expect(() => resolver.resolve("missing-provider")).toThrow(
      "Provider could not be resolved: missing-provider",
    );
  });

  // ==========================================================================
  // Test 13
  // ==========================================================================

  it("should preserve unaffected provider identity after another provider is removed", () => {
    const providerA = createProvider("provider-a");
    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    const beforeRemoval = resolver.resolve("provider-b");

    registry.remove("provider-a");

    const afterRemoval = resolver.resolve("provider-b");

    expect(beforeRemoval).toBe(providerB);
    expect(afterRemoval).toBe(providerB);

    expect(afterRemoval).toBe(beforeRemoval);
  });

  // ==========================================================================
  // Test 14
  // ==========================================================================

  it("should isolate all providers in a multi-provider registry", () => {
    const providerA = createProvider("provider-a");
    const providerB = createProvider("provider-b");
    const providerC = createProvider("provider-c");

    registry.register(providerA);
    registry.register(providerB);
    registry.register(providerC);

    /**
     * Verify initial isolation.
     */
    expect(resolver.resolve("provider-a")).toBe(providerA);

    expect(resolver.resolve("provider-b")).toBe(providerB);

    expect(resolver.resolve("provider-c")).toBe(providerC);

    /**
     * Remove the middle provider.
     */
    registry.remove("provider-b");

    /**
     * A and C must continue working.
     */
    expect(resolver.resolve("provider-a")).toBe(providerA);

    expect(resolver.resolve("provider-c")).toBe(providerC);

    /**
     * B must no longer resolve.
     */
    expect(() => resolver.resolve("provider-b")).toThrow(
      "Provider could not be resolved: provider-b",
    );
  });
});
