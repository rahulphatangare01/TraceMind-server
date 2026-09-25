import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import { LocalKeyProvider } from "../../../providers/local/local-key.provider.js";
import { LocalKeyMaterialProvider } from "../../../providers/local/local-key-material.provider.js";
import { LocalSigningKeyProvider } from "../../../providers/local/local-signing-key.provider.js";
import { LocalHmacKeyProvider } from "../../../providers/local/local-hmac-key.provider.js";
import { LocalCryptoProvider } from "../../../providers/local/local-crypto.provider.js";

const provider = new LocalSecurityProvider();

if (!(provider.keyProvider instanceof LocalKeyProvider)) {
  throw new Error("LocalKeyProvider wiring failed");
}

if (!(provider.keyMaterialProvider instanceof LocalKeyMaterialProvider)) {
  throw new Error("LocalKeyMaterialProvider wiring failed");
}

if (!(provider.signingKeyProvider instanceof LocalSigningKeyProvider)) {
  throw new Error("LocalSigningKeyProvider wiring failed");
}

if (!(provider.hmacKeyProvider instanceof LocalHmacKeyProvider)) {
  throw new Error("LocalHmacKeyProvider wiring failed");
}

if (!(provider.cryptoProvider instanceof LocalCryptoProvider)) {
  throw new Error("LocalCryptoProvider wiring failed");
}

const dependencies = [
  provider.keyProvider,
  provider.keyMaterialProvider,
  provider.signingKeyProvider,
  provider.hmacKeyProvider,
  provider.cryptoProvider,
];

for (const dependency of dependencies) {
  if (!dependency) {
    throw new Error("Local provider contains a missing dependency");
  }
}

const secondProvider = new LocalSecurityProvider();

if (provider.keyProvider === secondProvider.keyProvider) {
  throw new Error("KeyProvider instance is unexpectedly shared");
}

if (provider.keyMaterialProvider === secondProvider.keyMaterialProvider) {
  throw new Error("KeyMaterialProvider instance is unexpectedly shared");
}

if (provider.signingKeyProvider === secondProvider.signingKeyProvider) {
  throw new Error("SigningKeyProvider instance is unexpectedly shared");
}

if (provider.hmacKeyProvider === secondProvider.hmacKeyProvider) {
  throw new Error("HmacKeyProvider instance is unexpectedly shared");
}

if (provider.cryptoProvider === secondProvider.cryptoProvider) {
  throw new Error("CryptoProvider instance is unexpectedly shared");
}

console.log("Phase 8.3 manual verification passed");
