import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

const provider = new LocalSecurityProvider();

const metadata = provider.getMetadata();
const status = provider.getStatus();

if (metadata.type !== SecurityProviderType.LOCAL) {
  throw new Error("Local provider type is invalid");
}

if (metadata.id !== "local-security-provider") {
  throw new Error("Local provider id is invalid");
}

if (!Object.values(SecurityProviderStatus).includes(status)) {
  throw new Error("Local provider status is invalid");
}

const requiredCapabilities = [
  SecurityProviderCapability.KEY_MANAGEMENT,
  SecurityProviderCapability.KEY_MATERIAL,
  SecurityProviderCapability.ENCRYPTION,
  SecurityProviderCapability.DECRYPTION,
  SecurityProviderCapability.HASHING,
  SecurityProviderCapability.SIGNING,
  SecurityProviderCapability.HMAC,
];

for (const capability of requiredCapabilities) {
  if (!metadata.capabilities.includes(capability)) {
    throw new Error(`Missing capability: ${capability}`);
  }
}

if (metadata.capabilities.length !== requiredCapabilities.length) {
  throw new Error("Unexpected capability count");
}

if (!provider.keyProvider) {
  throw new Error("KeyProvider is missing");
}

if (!provider.keyMaterialProvider) {
  throw new Error("KeyMaterialProvider is missing");
}

if (!provider.signingKeyProvider) {
  throw new Error("SigningKeyProvider is missing");
}

if (!provider.hmacKeyProvider) {
  throw new Error("HmacKeyProvider is missing");
}

if (!provider.cryptoProvider) {
  throw new Error("CryptoProvider is missing");
}

if (typeof provider.keyProvider.createKey !== "function") {
  throw new Error("KeyProvider contract is invalid");
}

if (typeof provider.keyMaterialProvider.getKeyMaterial !== "function") {
  throw new Error("KeyMaterialProvider contract is invalid");
}

if (typeof provider.signingKeyProvider.getSigningKey !== "function") {
  throw new Error("SigningKeyProvider contract is invalid");
}

if (typeof provider.cryptoProvider.encrypt !== "function") {
  throw new Error("CryptoProvider contract is invalid");
}

const serializedMetadata = JSON.stringify(metadata);

if (
  /privateKey|publicKey|keyMaterial|secret|password|token/i.test(
    serializedMetadata,
  )
) {
  throw new Error("Provider metadata exposes sensitive material");
}

console.log("Phase 8.2 manual verification passed");
