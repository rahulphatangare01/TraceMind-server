// import type {
//   SecurityProvider,
//   SecurityProviderMetadata,
// } from "../../types/provider.types.js";

// import {
//   SecurityProviderCapability,
//   SecurityProviderStatus,
//   SecurityProviderType,
// } from "../../types/provider.types.js";

// import { LocalKeyProvider } from "./local-key.provider.js";
// import { LocalKeyMaterialProvider } from "./local-key-material.provider.js";
// import { LocalSigningKeyProvider } from "./local-signing-key.provider.js";
// import { LocalHmacKeyProvider } from "./local-hmac-key.provider.js";
// import { LocalCryptoProvider } from "./local-crypto.provider.js";

// export class LocalSecurityProvider
//   implements SecurityProvider, SecurityProvider
// {
//   private readonly metadata: SecurityProviderMetadata = {
//     id: "local-security-provider",
//     name: "Local Security Provider",
//     type: SecurityProviderType.LOCAL,
//     version: "1.0.0",
//     capabilities: [
//       SecurityProviderCapability.KEY_MANAGEMENT,
//       SecurityProviderCapability.KEY_MATERIAL,
//       SecurityProviderCapability.ENCRYPTION,
//       SecurityProviderCapability.DECRYPTION,
//       SecurityProviderCapability.HASHING,
//       SecurityProviderCapability.SIGNING,
//       SecurityProviderCapability.HMAC,
//     ],
//   };

//   private readonly status = SecurityProviderStatus.READY;

//   readonly keyProvider = new LocalKeyProvider();

//   readonly keyMaterialProvider = new LocalKeyMaterialProvider();

//   readonly signingKeyProvider = new LocalSigningKeyProvider();

//   readonly hmacKeyProvider = new LocalHmacKeyProvider();

//   readonly cryptoProvider = new LocalCryptoProvider(
//     this.signingKeyProvider,
//     this.hmacKeyProvider,
//   );

//   getMetadata(): SecurityProviderMetadata {
//     return this.metadata;
//   }

//   getStatus(): SecurityProviderStatus {
//     return this.status;
//   }
// }
import type {
  SecurityProvider,
  SecurityProviderMetadata,
} from "../../types/provider.types.js";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/provider.types.js";

import type { LocalProviderAdapter } from "../interfaces/local-provider.adapter.interface.js";

import { LocalKeyProvider } from "./local-key.provider.js";
import { LocalKeyMaterialProvider } from "./local-key-material.provider.js";
import { LocalSigningKeyProvider } from "./local-signing-key.provider.js";
import { LocalHmacKeyProvider } from "./local-hmac-key.provider.js";
import { LocalCryptoProvider } from "./local-crypto.provider.js";

export class LocalSecurityProvider
  implements SecurityProvider, LocalProviderAdapter
{
  private readonly metadata: SecurityProviderMetadata = {
    id: "local-security-provider",
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
  };

  private readonly status = SecurityProviderStatus.READY;

  readonly keyProvider = new LocalKeyProvider();

  readonly keyMaterialProvider = new LocalKeyMaterialProvider();

  readonly signingKeyProvider = new LocalSigningKeyProvider();

  readonly hmacKeyProvider = new LocalHmacKeyProvider();

  readonly cryptoProvider = new LocalCryptoProvider(
    this.signingKeyProvider,
    this.hmacKeyProvider,
  );

  getMetadata(): SecurityProviderMetadata {
    return this.metadata;
  }

  getStatus(): SecurityProviderStatus {
    return this.status;
  }
}
