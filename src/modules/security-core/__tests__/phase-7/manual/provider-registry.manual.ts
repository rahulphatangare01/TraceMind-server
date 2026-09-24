import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import type { SecurityProvider } from "../../../types/provider.types.js";

import { ProviderRegistryService } from "../../../application/services/provider-registry.service.js";

const createProvider = (id: string): SecurityProvider => {
  return {
    getMetadata: () => ({
      id,
      name: id,
      type: SecurityProviderType.LOCAL,
      version: "1.0.0",
      capabilities: [
        SecurityProviderCapability.KEY_MANAGEMENT,
        SecurityProviderCapability.ENCRYPTION,
      ],
    }),

    getStatus: () => SecurityProviderStatus.READY,
  };
};

const registry = new ProviderRegistryService();

console.log("\n=== Provider Registry Manual Verification ===\n");

const providerOne = createProvider("local-provider");
const providerTwo = createProvider("secondary-provider");

registry.register(providerOne);
registry.register(providerTwo);

console.log(`Registered provider count: ${registry.list().length}`);

console.log(
  `local-provider exists: ${registry.has("local-provider") ? "PASS" : "FAIL"}`,
);

console.log(
  `local-provider retrieval: ${
    registry.get("local-provider") === providerOne ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Unknown provider returns null: ${
    registry.get("unknown-provider") === null ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Provider list count: ${registry.list().length === 2 ? "PASS" : "FAIL"}`,
);

try {
  registry.register(createProvider("local-provider"));

  console.log("Duplicate registration rejection: FAIL");
} catch {
  console.log("Duplicate registration rejection: PASS");
}

console.log(
  `Provider removal: ${
    registry.remove("secondary-provider") ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Provider removed from registry: ${
    !registry.has("secondary-provider") ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Unknown provider removal: ${
    !registry.remove("unknown-provider") ? "PASS" : "FAIL"
  }`,
);

console.log("\n=== Manual Verification Complete ===\n");
