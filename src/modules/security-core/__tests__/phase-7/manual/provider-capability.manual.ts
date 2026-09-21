import { SecurityProviderCapability } from "../../../types/provider.types.js";

import type { ProviderCapabilitySet } from "../../../types/provider-capability.types.js";

import { ProviderCapabilityService } from "../../../application/services/provider-capability.service.js";

console.log("==============================================");
console.log("TraceMind - Phase 7.2 Provider Capability Test");
console.log("==============================================");

const service = new ProviderCapabilityService();

const localCapabilities: ProviderCapabilitySet = {
  capabilities: [
    SecurityProviderCapability.KEY_MANAGEMENT,
    SecurityProviderCapability.KEY_MATERIAL,
    SecurityProviderCapability.ENCRYPTION,
    SecurityProviderCapability.DECRYPTION,
    SecurityProviderCapability.HASHING,
    SecurityProviderCapability.SIGNING,
    SecurityProviderCapability.HMAC,
  ],
};

console.log("\n1. LOCAL Provider Capabilities");

console.log(localCapabilities.capabilities);

console.log("\n2. Encryption Capability");

console.log(
  "Supported:",
  service.supports(localCapabilities, SecurityProviderCapability.ENCRYPTION),
);

console.log("\n3. Signing Capability");

console.log(
  "Supported:",
  service.supports(localCapabilities, SecurityProviderCapability.SIGNING),
);

const limitedProvider: ProviderCapabilitySet = {
  capabilities: [
    SecurityProviderCapability.ENCRYPTION,
    SecurityProviderCapability.DECRYPTION,
  ],
};

console.log("\n4. Limited Provider Capabilities");

console.log(limitedProvider.capabilities);

console.log("\n5. HMAC Capability on Limited Provider");

const hmacSupported = service.supports(
  limitedProvider,
  SecurityProviderCapability.HMAC,
);

console.log("Supported:", hmacSupported);

console.log("\n6. Require Unsupported Capability");

try {
  service.require(limitedProvider, SecurityProviderCapability.HMAC);

  console.log("ERROR: Unsupported capability was accepted");

  process.exitCode = 1;
} catch (error) {
  console.log(
    "Expected failure:",
    error instanceof Error ? error.message : error,
  );
}

console.log("\n==============================================");
console.log("Phase 7.2 manual test completed.");
console.log("==============================================");
