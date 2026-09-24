import { SecurityProviderType } from "../../../types/provider.types.js";

import { ProviderFactoryService } from "../../../application/services/provider-factory.service.js";

import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

const factory = new ProviderFactoryService();

console.log("\n=== Provider Factory Manual Verification ===\n");

const localProvider = factory.create(SecurityProviderType.LOCAL);

console.log(
  `Local provider created: ${
    localProvider instanceof LocalSecurityProvider ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Provider type: ${
    localProvider.getMetadata().type === SecurityProviderType.LOCAL
      ? "PASS"
      : "FAIL"
  }`,
);

console.log(`Provider id: ${localProvider.getMetadata().id}`);

console.log(`Provider name: ${localProvider.getMetadata().name}`);

console.log(`Provider version: ${localProvider.getMetadata().version}`);

console.log(
  `Capability count: ${localProvider.getMetadata().capabilities.length}`,
);

try {
  factory.create(SecurityProviderType.AWS_KMS);

  console.log("Unsupported AWS provider rejection: FAIL");
} catch {
  console.log("Unsupported AWS provider rejection: PASS");
}

try {
  factory.create(SecurityProviderType.AZURE_KEY_VAULT);

  console.log("Unsupported Azure provider rejection: FAIL");
} catch {
  console.log("Unsupported Azure provider rejection: PASS");
}

const secondLocalProvider = factory.create(SecurityProviderType.LOCAL);

console.log(
  `Independent Local instances: ${
    localProvider !== secondLocalProvider ? "PASS" : "FAIL"
  }`,
);

console.log(
  `No Local fallback for AWS: ${
    (() => {
      try {
        const provider = factory.create(SecurityProviderType.AWS_KMS);

        return provider.getMetadata().type !== SecurityProviderType.LOCAL;
      } catch {
        return true;
      }
    })()
      ? "PASS"
      : "FAIL"
  }`,
);

console.log("\n=== Manual Verification Complete ===\n");
