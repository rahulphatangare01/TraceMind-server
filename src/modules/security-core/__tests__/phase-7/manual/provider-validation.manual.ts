import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import type { SecurityProvider } from "../../../types/provider.types.js";

import { ProviderValidationService } from "../../../application/services/provider-validation.service.js";

const service = new ProviderValidationService();

const createProvider = (
  id: string,
  status: SecurityProviderStatus,
): SecurityProvider => {
  return {
    getMetadata: () => ({
      id,
      name: "Manual Provider",
      type: SecurityProviderType.LOCAL,
      version: "1.0.0",
      capabilities: [
        SecurityProviderCapability.KEY_MANAGEMENT,
        SecurityProviderCapability.ENCRYPTION,
      ],
    }),

    getStatus: () => status,
  };
};

console.log("\n=== Provider Validation Manual Verification ===\n");

const provider = createProvider(
  "manual-provider",
  SecurityProviderStatus.READY,
);

const result = service.validate(provider);

console.log(`Valid provider: ${result.valid ? "PASS" : "FAIL"}`);

console.log(`Metadata id: ${result.metadata.id}`);

console.log(
  `Provider type: ${
    result.metadata.type === SecurityProviderType.LOCAL ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Provider status: ${
    result.status === SecurityProviderStatus.READY ? "PASS" : "FAIL"
  }`,
);

try {
  service.validate({
    getMetadata: () => ({
      id: "",
      name: "Invalid Provider",
      type: SecurityProviderType.LOCAL,
      version: "1.0.0",
      capabilities: [SecurityProviderCapability.ENCRYPTION],
    }),

    getStatus: () => SecurityProviderStatus.READY,
  });

  console.log("Invalid metadata rejection: FAIL");
} catch {
  console.log("Invalid metadata rejection: PASS");
}

try {
  service.validate({
    getMetadata: () => ({
      id: "invalid-provider",
      name: "Invalid Provider",
      type: SecurityProviderType.LOCAL,
      version: "1.0.0",
      capabilities: [SecurityProviderCapability.ENCRYPTION],
    }),

    getStatus: () => "INVALID_STATUS" as SecurityProviderStatus,
  });

  console.log("Invalid status rejection: FAIL");
} catch {
  console.log("Invalid status rejection: PASS");
}

const unchangedMetadata = provider.getMetadata();

service.validate(provider);

console.log(
  `Provider unchanged after validation: ${
    provider.getMetadata().id === unchangedMetadata.id ? "PASS" : "FAIL"
  }`,
);

console.log("\n=== Manual Verification Complete ===\n");
