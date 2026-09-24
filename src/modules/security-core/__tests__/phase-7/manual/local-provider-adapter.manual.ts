import {
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

const provider = new LocalSecurityProvider();

console.log("\n=== Local Provider Adapter Manual Verification ===\n");

console.log(
  `Provider type: ${
    provider.getMetadata().type === SecurityProviderType.LOCAL ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Provider status: ${
    provider.getStatus() === SecurityProviderStatus.READY ? "PASS" : "FAIL"
  }`,
);

console.log(`Provider id: ${provider.getMetadata().id}`);

console.log(`Provider name: ${provider.getMetadata().name}`);

console.log(`Provider version: ${provider.getMetadata().version}`);

console.log(`KeyProvider available: ${provider.keyProvider ? "PASS" : "FAIL"}`);

console.log(
  `KeyMaterialProvider available: ${
    provider.keyMaterialProvider ? "PASS" : "FAIL"
  }`,
);

console.log(
  `SigningKeyProvider available: ${
    provider.signingKeyProvider ? "PASS" : "FAIL"
  }`,
);

console.log(
  `HmacKeyProvider available: ${provider.hmacKeyProvider ? "PASS" : "FAIL"}`,
);

console.log(
  `CryptoProvider available: ${provider.cryptoProvider ? "PASS" : "FAIL"}`,
);

console.log(
  `Crypto encrypt available: ${
    typeof provider.cryptoProvider.encrypt === "function" ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Crypto decrypt available: ${
    typeof provider.cryptoProvider.decrypt === "function" ? "PASS" : "FAIL"
  }`,
);

console.log(`Capability count: ${provider.getMetadata().capabilities.length}`);

console.log(
  `Raw key material absent from metadata: ${
    !JSON.stringify(provider.getMetadata()).includes("privateKey")
      ? "PASS"
      : "FAIL"
  }`,
);

console.log(
  `Provider adapter independently constructed: ${
    new LocalSecurityProvider() !== provider ? "PASS" : "FAIL"
  }`,
);

console.log("\n=== Manual Verification Complete ===\n");
