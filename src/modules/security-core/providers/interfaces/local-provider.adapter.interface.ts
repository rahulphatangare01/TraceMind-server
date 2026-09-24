import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";
import type { KeyProvider } from "../../application/interfaces/key.provider.interface.js";
import type { KeyMaterialProvider } from "../interfaces/key-material.provider.interface.js";
// import type { SigningKeyProvider } from "../../application/interfaces/signing-key.provider.interface.js";
import type { SigningKeyProvider } from "./signing-key.provider.interface.js";
// import type { HmacKeyProvider } from "../../application/interfaces/hmac-key.provider.interface.js";
import type { HmacKeyProvider } from "./hmac-key.provider.interface.js";

export interface LocalProviderAdapter {
  readonly keyProvider: KeyProvider;

  readonly keyMaterialProvider: KeyMaterialProvider;

  readonly signingKeyProvider: SigningKeyProvider;

  readonly hmacKeyProvider: HmacKeyProvider;

  readonly cryptoProvider: CryptoProvider;
}
