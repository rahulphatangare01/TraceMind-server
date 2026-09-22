import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import type { SecurityProvider } from "../../../types/provider.types.js";

import { ProviderRegistryService } from "../../../application/services/provider-registry.service.js";

import { ProviderResolverService } from "../../../application/services/provider-resolver.service.js";

const createProvider = (
  id: string,
  type: SecurityProviderType,
): SecurityProvider => {
  return {
    getMetadata: () => ({
      id,
      name: id,
      type,
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

const resolver = new ProviderResolverService(registry);

console.log("\n=== Provider Resolver Manual Verification ===\n");

const localProvider = createProvider(
  "local-provider",
  SecurityProviderType.LOCAL,
);

const awsProvider = createProvider(
  "aws-provider",
  SecurityProviderType.AWS_KMS,
);

registry.register(localProvider);
registry.register(awsProvider);

const resolvedLocal = resolver.resolve("local-provider");

console.log(
  `Local provider resolution: ${
    resolvedLocal === localProvider ? "PASS" : "FAIL"
  }`,
);

const resolvedAws = resolver.resolve("aws-provider");

console.log(
  `AWS provider resolution: ${resolvedAws === awsProvider ? "PASS" : "FAIL"}`,
);

try {
  resolver.resolve("missing-provider");

  console.log("Unknown provider rejection: FAIL");
} catch {
  console.log("Unknown provider rejection: PASS");
}

registry.remove("local-provider");

try {
  resolver.resolve("local-provider");

  console.log("Removed provider rejection: FAIL");
} catch {
  console.log("Removed provider rejection: PASS");
}

console.log(
  `AWS provider remains resolvable: ${
    resolver.resolve("aws-provider") === awsProvider ? "PASS" : "FAIL"
  }`,
);

console.log(
  `No fallback provider behavior: ${
    (() => {
      try {
        resolver.resolve("unknown-provider");
        return false;
      } catch {
        return true;
      }
    })()
      ? "PASS"
      : "FAIL"
  }`,
);

console.log("\n=== Manual Verification Complete ===\n");
