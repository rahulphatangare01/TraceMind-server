import type { SecurityProvider } from "../../../application/interfaces/security.provider.interface.js";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

console.log("==============================================");
console.log("TraceMind - Phase 7.1 Provider Contract Test");
console.log("==============================================");

const provider: SecurityProvider = {
  getMetadata: () => ({
    id: "provider-local",
    name: "Local Security Provider",
    type: SecurityProviderType.LOCAL,
    version: "1.0.0",
    capabilities: [
      SecurityProviderCapability.KEY_MANAGEMENT,
      SecurityProviderCapability.KEY_MATERIAL,
      SecurityProviderCapability.ENCRYPTION,
      SecurityProviderCapability.DECRYPTION,
      SecurityProviderCapability.HASHING,
      SecurityProviderCapability.SIGNING,
      SecurityProviderCapability.HMAC,
    ],
  }),

  getStatus: () => SecurityProviderStatus.READY,
};

console.log("\n1. Provider Metadata");
console.log(provider.getMetadata());

console.log("\n2. Provider Type");
console.log(provider.getMetadata().type);

console.log("\n3. Provider Capabilities");
console.log(provider.getMetadata().capabilities);

console.log("\n4. Provider Status");
console.log(provider.getStatus());

console.log("\n5. Provider Contract Verification");

const metadata = provider.getMetadata();

if (
  metadata.type === SecurityProviderType.LOCAL &&
  metadata.capabilities.includes(SecurityProviderCapability.ENCRYPTION) &&
  metadata.capabilities.includes(SecurityProviderCapability.DECRYPTION) &&
  provider.getStatus() === SecurityProviderStatus.READY
) {
  console.log("Provider contract: VALID");
} else {
  console.error("Provider contract: INVALID");
  process.exitCode = 1;
}

console.log("\n==============================================");
console.log("Phase 7.1 manual test completed.");
console.log("==============================================");
