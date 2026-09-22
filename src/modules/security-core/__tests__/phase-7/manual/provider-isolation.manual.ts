import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/index";

import type {
  SecurityProvider,
  SecurityProviderMetadata,
} from "../../../types/index";

import { ProviderRegistryService } from "../../../application/services/provider-registry.service";
import { ProviderResolverService } from "../../../application/services";

/**
 * ============================================================================
 * Phase 7.12
 * Provider Isolation - Manual Verification
 * ============================================================================
 *
 * Purpose:
 * Manually verify that multiple providers can coexist without sharing or
 * leaking state.
 *
 * Verification areas:
 *
 * 1. Provider registration isolation
 * 2. Provider identity isolation
 * 3. Provider metadata isolation
 * 4. Provider capability isolation
 * 5. Provider status isolation
 * 6. Provider resolver isolation
 * 7. Provider removal isolation
 * 8. No provider fallback
 * 9. Multi-provider isolation
 *
 * This script does not perform cryptographic operations.
 * ============================================================================
 */

// ============================================================================
// Helper Functions
// ============================================================================

const createProvider = (
  id: string,
  options: {
    name?: string;
    version?: string;
    capabilities?: SecurityProviderCapability[];
    status?: SecurityProviderStatus;
  } = {},
): SecurityProvider => {
  const metadata: SecurityProviderMetadata = {
    id,
    name: options.name ?? id,
    type: SecurityProviderType.LOCAL,
    version: options.version ?? "1.0.0",
    capabilities: [
      ...(options.capabilities ?? [SecurityProviderCapability.KEY_MANAGEMENT]),
    ],
  };

  const status = options.status ?? SecurityProviderStatus.READY;

  return {
    /**
     * Return fresh metadata.
     *
     * This prevents callers from accidentally mutating
     * provider-owned metadata.
     */
    getMetadata: () => ({
      ...metadata,
      capabilities: [...metadata.capabilities],
    }),

    getStatus: () => status,
  };
};

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
};

const printSection = (title: string): void => {
  console.log("");
  console.log("--------------------------------------------------");
  console.log(title);
  console.log("--------------------------------------------------");
};

// ============================================================================
// Initialize Provider Infrastructure
// ============================================================================

const registry = new ProviderRegistryService();

const resolver = new ProviderResolverService(registry);

// ============================================================================
// Create Providers
// ============================================================================

const providerA = createProvider("provider-a", {
  name: "Provider A",
  version: "1.0.0",
  capabilities: [
    SecurityProviderCapability.ENCRYPTION,
    SecurityProviderCapability.DECRYPTION,
  ],
  status: SecurityProviderStatus.READY,
});

const providerB = createProvider("provider-b", {
  name: "Provider B",
  version: "2.0.0",
  capabilities: [
    SecurityProviderCapability.SIGNING,
    SecurityProviderCapability.HMAC,
  ],
  status: SecurityProviderStatus.READY,
});

// const providerB = createProvider("provider-b", {
//   name: "Provider B",
//   version: "2.0.0",
//   capabilities: [SecurityProviderCapability.SIGNING],
//   status: SecurityProviderStatus.READY,
// });

const providerC = createProvider("provider-c", {
  name: "Provider C",
  version: "3.0.0",
  capabilities: [SecurityProviderCapability.KEY_MANAGEMENT],
  status: SecurityProviderStatus.READY,
});

// ============================================================================
// 1. Provider Registration Isolation
// ============================================================================

printSection("1. Provider Registration Isolation");

registry.register(providerA);
registry.register(providerB);
registry.register(providerC);

assert(registry.has("provider-a"), "Provider A should be registered");

assert(registry.has("provider-b"), "Provider B should be registered");

assert(registry.has("provider-c"), "Provider C should be registered");

assert(
  registry.list().length === 3,
  "Registry should contain exactly three providers",
);

console.log("✓ Provider A registered");
console.log("✓ Provider B registered");
console.log("✓ Provider C registered");
console.log("✓ Three providers coexist");

// ============================================================================
// 2. Provider Identity Isolation
// ============================================================================

printSection("2. Provider Identity Isolation");

const resolvedA = registry.get("provider-a");
const resolvedB = registry.get("provider-b");
const resolvedC = registry.get("provider-c");

assert(resolvedA === providerA, "Provider A identity was not preserved");

assert(resolvedB === providerB, "Provider B identity was not preserved");

assert(resolvedC === providerC, "Provider C identity was not preserved");

assert(resolvedA !== providerB, "Provider A incorrectly references Provider B");

assert(resolvedB !== providerC, "Provider B incorrectly references Provider C");

assert(resolvedC !== providerA, "Provider C incorrectly references Provider A");

console.log("✓ Provider A identity isolated");
console.log("✓ Provider B identity isolated");
console.log("✓ Provider C identity isolated");

// ============================================================================
// 3. Resolver Isolation
// ============================================================================

printSection("3. Resolver Isolation");

const resolverA = resolver.resolve("provider-a");
const resolverB = resolver.resolve("provider-b");
const resolverC = resolver.resolve("provider-c");

assert(resolverA === providerA, "Resolver returned wrong Provider A instance");

assert(resolverB === providerB, "Resolver returned wrong Provider B instance");

assert(resolverC === providerC, "Resolver returned wrong Provider C instance");

console.log("✓ Resolver returns Provider A");
console.log("✓ Resolver returns Provider B");
console.log("✓ Resolver returns Provider C");
console.log("✓ Resolver isolation verified");

// ============================================================================
// 4. Metadata Isolation
// ============================================================================

printSection("4. Metadata Isolation");

const metadataA = providerA.getMetadata();
const metadataB = providerB.getMetadata();
const metadataC = providerC.getMetadata();

assert(metadataA.id === "provider-a", "Provider A metadata ID is incorrect");

assert(metadataB.id === "provider-b", "Provider B metadata ID is incorrect");

assert(metadataC.id === "provider-c", "Provider C metadata ID is incorrect");

assert(
  metadataA.name === "Provider A",
  "Provider A metadata name is incorrect",
);

assert(
  metadataB.name === "Provider B",
  "Provider B metadata name is incorrect",
);

assert(
  metadataC.name === "Provider C",
  "Provider C metadata name is incorrect",
);

assert(metadataA.version === "1.0.0", "Provider A version is incorrect");

assert(metadataB.version === "2.0.0", "Provider B version is incorrect");

assert(metadataC.version === "3.0.0", "Provider C version is incorrect");

console.log("✓ Provider A metadata isolated");
console.log("✓ Provider B metadata isolated");
console.log("✓ Provider C metadata isolated");

// ============================================================================
// 5. Capability Isolation
// ============================================================================

printSection("5. Capability Isolation");

assert(
  metadataA.capabilities.includes(SecurityProviderCapability.ENCRYPTION),
  "Provider A should have ENCRYPTION capability",
);

assert(
  metadataA.capabilities.includes(SecurityProviderCapability.DECRYPTION),
  "Provider A should have DECRYPTION capability",
);

assert(
  metadataB.capabilities.includes(SecurityProviderCapability.SIGNING),
  "Provider B should have SIGNING capability",
);

assert(
  metadataB.capabilities.includes(SecurityProviderCapability.HMAC),
  "Provider B should have HMAC capability",
);

assert(
  metadataC.capabilities.includes(SecurityProviderCapability.KEY_MANAGEMENT),
  "Provider C should have KEY_MANAGEMENT capability",
);

assert(
  !metadataA.capabilities.includes(SecurityProviderCapability.SIGNING),
  "Provider A must not inherit Provider B SIGNING capability",
);

assert(
  !metadataB.capabilities.includes(SecurityProviderCapability.ENCRYPTION),
  "Provider B must not inherit Provider A ENCRYPTION capability",
);

console.log("✓ Provider A capabilities isolated");
console.log("✓ Provider B capabilities isolated");
console.log("✓ Provider C capabilities isolated");
console.log("✓ No cross-provider capability leakage");

// ============================================================================
// 6. Capability Array Isolation
// ============================================================================

printSection("6. Capability Array Isolation");

const providerACapabilities = providerA.getMetadata().capabilities;

const providerBCapabilities = providerB.getMetadata().capabilities;

assert(
  providerACapabilities !== providerBCapabilities,
  "Provider A and B share the same capability array",
);

// providerACapabilities.push(SecurityProviderCapability.HMAC);
providerACapabilities.push(SecurityProviderCapability.KEY_MANAGEMENT);

const providerBMetadataAfterMutation = providerB.getMetadata();

// assert(
//   !providerBMetadataAfterMutation.capabilities.includes(
//     SecurityProviderCapability.HMAC,
//   ),
//   "Provider A capability mutation leaked into Provider B",
// );
assert(
  !providerBMetadataAfterMutation.capabilities.includes(
    SecurityProviderCapability.KEY_MANAGEMENT,
  ),
  "Provider A capability mutation leaked into Provider B",
);

console.log("✓ Provider capability arrays are independent");
console.log("✓ Capability mutation does not leak");

// ============================================================================
// 7. Provider Status Isolation
// ============================================================================

printSection("7. Provider Status Isolation");

assert(
  providerA.getStatus() === SecurityProviderStatus.READY,
  "Provider A should be READY",
);

assert(
  providerB.getStatus() === SecurityProviderStatus.READY,
  "Provider B should be READY",
);

assert(
  providerC.getStatus() === SecurityProviderStatus.READY,
  "Provider C should be READY",
);

console.log("✓ Provider A status isolated");
console.log("✓ Provider B status isolated");
console.log("✓ Provider C status isolated");

// ============================================================================
// 8. Removal Isolation
// ============================================================================

printSection("8. Provider Removal Isolation");

const removed = registry.remove("provider-b");

assert(removed === true, "Provider B should be successfully removed");

assert(
  registry.has("provider-b") === false,
  "Provider B should no longer exist in registry",
);

assert(
  registry.has("provider-a") === true,
  "Provider A was affected by Provider B removal",
);

assert(
  registry.has("provider-c") === true,
  "Provider C was affected by Provider B removal",
);

console.log("✓ Provider B removed");
console.log("✓ Provider A unaffected");
console.log("✓ Provider C unaffected");

// ============================================================================
// 9. Resolver After Removal
// ============================================================================

printSection("9. Resolver Isolation After Removal");

assert(
  resolver.resolve("provider-a") === providerA,
  "Provider A should still resolve after B removal",
);

assert(
  resolver.resolve("provider-c") === providerC,
  "Provider C should still resolve after B removal",
);

console.log("✓ Provider A still resolves");
console.log("✓ Provider C still resolves");

// ============================================================================
// 10. Removed Provider Must Not Resolve
// ============================================================================

printSection("10. Removed Provider Must Not Resolve");

let removedProviderResolutionFailed = false;

try {
  resolver.resolve("provider-b");
} catch (error) {
  removedProviderResolutionFailed = true;

  const message = error instanceof Error ? error.message : String(error);

  assert(
    message.includes("Provider could not be resolved: provider-b"),
    "Resolver returned an unexpected error for Provider B",
  );
}

assert(
  removedProviderResolutionFailed,
  "Removed Provider B should not resolve",
);

console.log("✓ Removed Provider B cannot be resolved");
console.log("✓ Resolver did not fallback");

// ============================================================================
// 11. Missing Provider Must Not Fallback
// ============================================================================

printSection("11. No Provider Fallback");

let fallbackPrevented = false;

try {
  resolver.resolve("missing-provider");
} catch (error) {
  fallbackPrevented = true;

  const message = error instanceof Error ? error.message : String(error);

  assert(
    message === "Provider could not be resolved: missing-provider",
    "Unexpected error message for missing provider",
  );
}

assert(fallbackPrevented, "Resolver incorrectly resolved a missing provider");

console.log("✓ Missing provider rejected");
console.log("✓ No fallback to Provider A");
console.log("✓ No fallback to Provider C");

// ============================================================================
// 12. Final Registry State
// ============================================================================

printSection("12. Final Registry State");

const finalProviders = registry.list();

assert(
  finalProviders.length === 2,
  "Registry should contain exactly two providers",
);

assert(
  finalProviders.includes(providerA),
  "Provider A should remain in registry",
);

assert(
  finalProviders.includes(providerC),
  "Provider C should remain in registry",
);

assert(
  !finalProviders.includes(providerB),
  "Provider B should not remain in registry",
);

console.log("✓ Final registry contains Provider A");
console.log("✓ Final registry contains Provider C");
console.log("✓ Final registry does not contain Provider B");

// ============================================================================
// Final Result
// ============================================================================

console.log("");
console.log("==================================================");
console.log("Phase 7.12 Provider Isolation Verification");
console.log("==================================================");
console.log("✓ Provider registration isolation");
console.log("✓ Provider identity isolation");
console.log("✓ Resolver isolation");
console.log("✓ Metadata isolation");
console.log("✓ Capability isolation");
console.log("✓ Capability array isolation");
console.log("✓ Provider status isolation");
console.log("✓ Provider removal isolation");
console.log("✓ Resolver isolation after removal");
console.log("✓ Removed provider cannot resolve");
console.log("✓ Missing provider cannot fallback");
console.log("✓ Final registry state verified");
console.log("==================================================");
console.log("PHASE 7.12 MANUAL VERIFICATION PASSED");
console.log("==================================================");
