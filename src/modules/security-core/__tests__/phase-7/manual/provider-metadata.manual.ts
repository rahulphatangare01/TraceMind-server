import {
  SecurityProviderCapability,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import type { SecurityProviderMetadata } from "../../../types/provider.types.js";

import { ProviderMetadataService } from "../../../application/services/provider-metadata.service.js";

console.log("==============================================");
console.log("TraceMind - Phase 7.3 Provider Metadata Test");
console.log("==============================================");

const service = new ProviderMetadataService();

const metadata: SecurityProviderMetadata = {
  id: "  provider-local  ",
  name: "  Local Security Provider  ",
  type: SecurityProviderType.LOCAL,
  version: " 1.0.0 ",
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

console.log("\n1. Raw Provider Metadata");

console.log(JSON.stringify(metadata, null, 2));

const validated = service.validate(metadata);

console.log("\n2. Validated Provider Metadata");

console.log(JSON.stringify(validated, null, 2));

console.log("\n3. Normalization Verification");

console.log("ID:", validated.id);

console.log("Name:", validated.name);

console.log("Version:", validated.version);

console.log("\n4. Provider Type");

console.log(validated.type);

console.log("\n5. Provider Capabilities");

console.log(validated.capabilities);

console.log("\n6. Duplicate Capability Verification");

try {
  service.validate({
    ...validated,
    capabilities: [
      SecurityProviderCapability.ENCRYPTION,
      SecurityProviderCapability.ENCRYPTION,
    ],
  });

  console.log("ERROR: Duplicate capabilities were accepted");

  process.exitCode = 1;
} catch (error) {
  console.log(
    "Expected failure:",
    error instanceof Error ? error.message : error,
  );
}

console.log("\n7. Empty Provider ID Verification");

try {
  service.validate({
    ...validated,
    id: "   ",
  });

  console.log("ERROR: Empty provider ID was accepted");

  process.exitCode = 1;
} catch (error) {
  console.log(
    "Expected failure:",
    error instanceof Error ? error.message : error,
  );
}

console.log("\n==============================================");
console.log("Phase 7.3 manual test completed.");
console.log("==============================================");
