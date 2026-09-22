import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import type {
  SecurityProvider,
  SecurityProviderMetadata,
} from "../../../types/provider.types.js";

import { ProviderRegistryService } from "../../../application/services/provider-registry.service.js";
import { ProviderResolverService } from "../../../application/services/provider-resolver.service.js";

/**
 * ============================================================================
 * Phase 7.13
 * Provider Switching - Manual Verification
 * ============================================================================
 *
 * Verifies:
 *
 * 1. Initial provider selection
 * 2. Switching A -> B
 * 3. Switching B -> A
 * 4. Repeated switching
 * 5. Provider identity preservation
 * 6. Metadata isolation
 * 7. Capability isolation
 * 8. Status isolation
 * 9. Unknown provider switching
 * 10. No fallback
 * 11. Registry preservation
 * ============================================================================
 */

// ============================================================================
// Helpers
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
// Infrastructure
// ============================================================================

const registry = new ProviderRegistryService();

const resolver = new ProviderResolverService(registry);

// ============================================================================
// Providers
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

const providerC = createProvider("provider-c", {
  name: "Provider C",
  version: "3.0.0",
  capabilities: [SecurityProviderCapability.KEY_MANAGEMENT],
  status: SecurityProviderStatus.READY,
});

// ============================================================================
// Registration
// ============================================================================

printSection("1. Provider Registration");

registry.register(providerA);
registry.register(providerB);
registry.register(providerC);

assert(registry.list().length === 3, "Expected three registered providers");

console.log("✓ Provider A registered");
console.log("✓ Provider B registered");
console.log("✓ Provider C registered");

// ============================================================================
// Initial Provider Selection
// ============================================================================

printSection("2. Initial Provider Selection");

const initialProvider = resolver.resolve("provider-a");

assert(initialProvider === providerA, "Initial provider should be Provider A");

console.log("✓ Initial provider = Provider A");

// ============================================================================
// Switch A -> B
// ============================================================================

printSection("3. Switching Provider A -> Provider B");

const switchedToB = resolver.resolve("provider-b");

assert(switchedToB === providerB, "Switch to Provider B failed");

assert(
  switchedToB !== providerA,
  "Provider B incorrectly references Provider A",
);

console.log("✓ Provider switched A -> B");

// ============================================================================
// Switch B -> C
// ============================================================================

printSection("4. Switching Provider B -> Provider C");

const switchedToC = resolver.resolve("provider-c");

assert(switchedToC === providerC, "Switch to Provider C failed");

assert(
  switchedToC !== providerB,
  "Provider C incorrectly references Provider B",
);

console.log("✓ Provider switched B -> C");

// ============================================================================
// Switch C -> A
// ============================================================================

printSection("5. Switching Provider C -> Provider A");

const switchedBackToA = resolver.resolve("provider-a");

assert(switchedBackToA === providerA, "Switch back to Provider A failed");

console.log("✓ Provider switched C -> A");

// ============================================================================
// Repeated Switching
// ============================================================================

printSection("6. Repeated Provider Switching");

const switchResults = [
  resolver.resolve("provider-a"),
  resolver.resolve("provider-b"),
  resolver.resolve("provider-c"),
  resolver.resolve("provider-a"),
  resolver.resolve("provider-c"),
  resolver.resolve("provider-b"),
  resolver.resolve("provider-a"),
];

assert(switchResults[0] === providerA, "Switch 1 should resolve Provider A");

assert(switchResults[1] === providerB, "Switch 2 should resolve Provider B");

assert(switchResults[2] === providerC, "Switch 3 should resolve Provider C");

assert(switchResults[3] === providerA, "Switch 4 should resolve Provider A");

assert(switchResults[4] === providerC, "Switch 5 should resolve Provider C");

assert(switchResults[5] === providerB, "Switch 6 should resolve Provider B");

assert(switchResults[6] === providerA, "Switch 7 should resolve Provider A");

console.log("✓ Repeated provider switching passed");

// ============================================================================
// Metadata Isolation
// ============================================================================

printSection("7. Metadata Isolation During Switching");

const metadataA = providerA.getMetadata();

const metadataB = providerB.getMetadata();

const metadataC = providerC.getMetadata();

assert(metadataA.id === "provider-a", "Provider A metadata ID changed");

assert(metadataB.id === "provider-b", "Provider B metadata ID changed");

assert(metadataC.id === "provider-c", "Provider C metadata ID changed");

assert(metadataA.name === "Provider A", "Provider A metadata name changed");

assert(metadataB.name === "Provider B", "Provider B metadata name changed");

assert(metadataC.name === "Provider C", "Provider C metadata name changed");

console.log("✓ Provider metadata preserved during switching");

// ============================================================================
// Capability Isolation
// ============================================================================

printSection("8. Capability Isolation During Switching");

assert(
  metadataA.capabilities.includes(SecurityProviderCapability.ENCRYPTION),
  "Provider A lost ENCRYPTION capability",
);

assert(
  metadataB.capabilities.includes(SecurityProviderCapability.SIGNING),
  "Provider B lost SIGNING capability",
);

assert(
  metadataB.capabilities.includes(SecurityProviderCapability.HMAC),
  "Provider B lost HMAC capability",
);

assert(
  metadataC.capabilities.includes(SecurityProviderCapability.KEY_MANAGEMENT),
  "Provider C lost KEY_MANAGEMENT capability",
);

assert(
  !metadataB.capabilities.includes(SecurityProviderCapability.ENCRYPTION),
  "Provider B inherited Provider A ENCRYPTION capability",
);

assert(
  !metadataC.capabilities.includes(SecurityProviderCapability.SIGNING),
  "Provider C inherited Provider B SIGNING capability",
);

console.log("✓ Provider capabilities remain isolated");

// ============================================================================
// Status Isolation
// ============================================================================

printSection("9. Status Isolation During Switching");

assert(
  providerA.getStatus() === SecurityProviderStatus.READY,
  "Provider A status changed",
);

assert(
  providerB.getStatus() === SecurityProviderStatus.READY,
  "Provider B status changed",
);

assert(
  providerC.getStatus() === SecurityProviderStatus.READY,
  "Provider C status changed",
);

console.log("✓ Provider statuses remain isolated");

// ============================================================================
// Unknown Provider Switching
// ============================================================================

printSection("10. Unknown Provider Switching");

let unknownProviderRejected = false;

try {
  resolver.resolve("unknown-provider");
} catch (error) {
  unknownProviderRejected = true;

  const message = error instanceof Error ? error.message : String(error);

  assert(
    message === "Provider could not be resolved: unknown-provider",
    "Unexpected unknown-provider error message",
  );
}

assert(unknownProviderRejected, "Unknown provider should have been rejected");

console.log("✓ Unknown provider rejected");

// ============================================================================
// No Fallback
// ============================================================================

printSection("11. No Provider Fallback");

const providerAfterFailure = resolver.resolve("provider-a");

assert(
  providerAfterFailure === providerA,
  "Resolver did not preserve Provider A after failed switch",
);

console.log("✓ No fallback occurred");
console.log("✓ Provider A remains available");

// ============================================================================
// Registry Preservation
// ============================================================================

printSection("12. Registry Preservation");

assert(registry.has("provider-a"), "Provider A disappeared from registry");

assert(registry.has("provider-b"), "Provider B disappeared from registry");

assert(registry.has("provider-c"), "Provider C disappeared from registry");

assert(
  registry.list().length === 3,
  "Provider switching modified registry membership",
);

console.log("✓ Provider A remains registered");
console.log("✓ Provider B remains registered");
console.log("✓ Provider C remains registered");
console.log("✓ Registry preserved");

// ============================================================================
// Final Verification
// ============================================================================

console.log("");
console.log("==================================================");
console.log("Phase 7.13 Provider Switching Verification");
console.log("==================================================");
console.log("✓ Initial provider selection");
console.log("✓ A -> B switching");
console.log("✓ B -> C switching");
console.log("✓ C -> A switching");
console.log("✓ Repeated provider switching");
console.log("✓ Provider identity preservation");
console.log("✓ Metadata isolation");
console.log("✓ Capability isolation");
console.log("✓ Status isolation");
console.log("✓ Unknown provider rejection");
console.log("✓ No provider fallback");
console.log("✓ Registry preservation");
console.log("==================================================");
console.log("PHASE 7.13 MANUAL VERIFICATION PASSED");
console.log("==================================================");
