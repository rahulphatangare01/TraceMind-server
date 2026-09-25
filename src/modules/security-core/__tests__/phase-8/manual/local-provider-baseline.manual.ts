import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

// ============================================================================
// Helpers
// ============================================================================

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
};

const printSection = (title: string): void => {
  console.log("");
  console.log("--------------------------------------------------");
  console.log(title);
  console.log("--------------------------------------------------");
};

// ============================================================================
// Phase 8.1
// Local Provider Baseline Review
// ============================================================================

const runManualVerification = async (): Promise<void> => {
  // ==========================================================================
  // 1. Provider Construction
  // ==========================================================================

  printSection("1. Local Provider Construction");

  const provider = new LocalSecurityProvider();

  assert(
    provider !== undefined,
    "Local Security Provider could not be created",
  );

  console.log("✓ Local Security Provider created");

  // ==========================================================================
  // 2. Provider Metadata
  // ==========================================================================

  printSection("2. Provider Metadata");

  const metadata = provider.getMetadata();

  assert(metadata !== undefined, "Provider metadata is unavailable");

  assert(metadata.id === "local-security-provider", "Provider ID is incorrect");

  assert(
    metadata.name === "Local Security Provider",
    "Provider name is incorrect",
  );

  assert(
    metadata.type === SecurityProviderType.LOCAL,
    "Provider type is not LOCAL",
  );

  assert(metadata.version === "1.0.0", "Provider version is incorrect");

  console.log("✓ Provider ID is correct");

  console.log("✓ Provider name is correct");

  console.log("✓ Provider type is LOCAL");

  console.log("✓ Provider version is correct");

  // ==========================================================================
  // 3. Provider Status
  // ==========================================================================

  printSection("3. Provider Status");

  const status = provider.getStatus();

  assert(
    Object.values(SecurityProviderStatus).includes(status),
    "Provider status is invalid",
  );

  console.log(`✓ Provider status: ${status}`);

  // ==========================================================================
  // 4. Provider Capabilities
  // ==========================================================================

  printSection("4. Provider Capabilities");

  const capabilities = metadata.capabilities;

  const expectedCapabilities = [
    SecurityProviderCapability.KEY_MANAGEMENT,
    SecurityProviderCapability.KEY_MATERIAL,
    SecurityProviderCapability.ENCRYPTION,
    SecurityProviderCapability.DECRYPTION,
    SecurityProviderCapability.HASHING,
    SecurityProviderCapability.SIGNING,
    SecurityProviderCapability.HMAC,
  ];

  for (const capability of expectedCapabilities) {
    assert(
      capabilities.includes(capability),
      `Missing capability: ${capability}`,
    );
  }

  const uniqueCapabilities = new Set(capabilities);

  assert(
    uniqueCapabilities.size === capabilities.length,
    "Duplicate provider capabilities detected",
  );

  assert(capabilities.length === 7, "Unexpected provider capability count");

  console.log("✓ KEY_MANAGEMENT");

  console.log("✓ KEY_MATERIAL");

  console.log("✓ ENCRYPTION");

  console.log("✓ DECRYPTION");

  console.log("✓ HASHING");

  console.log("✓ SIGNING");

  console.log("✓ HMAC");

  console.log("✓ No duplicate capabilities");

  // ==========================================================================
  // 5. Key Provider
  // ==========================================================================

  printSection("5. Key Provider");

  assert(provider.keyProvider !== undefined, "KeyProvider is unavailable");

  assert(
    typeof provider.keyProvider.createKey === "function",
    "KeyProvider.createKey is unavailable",
  );

  assert(
    typeof provider.keyProvider.getKey === "function",
    "KeyProvider.getKey is unavailable",
  );

  assert(
    typeof provider.keyProvider.getKeyVersion === "function",
    "KeyProvider.getKeyVersion is unavailable",
  );

  assert(
    typeof provider.keyProvider.getActiveVersion === "function",
    "KeyProvider.getActiveVersion is unavailable",
  );

  assert(
    typeof provider.keyProvider.rotateKey === "function",
    "KeyProvider.rotateKey is unavailable",
  );

  assert(
    typeof provider.keyProvider.changeKeyStatus === "function",
    "KeyProvider.changeKeyStatus is unavailable",
  );

  console.log("✓ KeyProvider is available");

  console.log("✓ Key lifecycle operations are available");

  // ==========================================================================
  // 6. Key Material Provider
  // ==========================================================================

  printSection("6. Key Material Provider");

  assert(
    provider.keyMaterialProvider !== undefined,
    "KeyMaterialProvider is unavailable",
  );

  assert(
    typeof provider.keyMaterialProvider.getKeyMaterial === "function",
    "KeyMaterialProvider.getKeyMaterial is unavailable",
  );

  console.log("✓ KeyMaterialProvider is available");

  // ==========================================================================
  // 7. Signing Key Provider
  // ==========================================================================

  printSection("7. Signing Key Provider");

  assert(
    provider.signingKeyProvider !== undefined,
    "SigningKeyProvider is unavailable",
  );

  assert(
    typeof provider.signingKeyProvider.getSigningKey === "function",
    "SigningKeyProvider.getSigningKey is unavailable",
  );

  assert(
    typeof provider.signingKeyProvider.getVerificationKey === "function",
    "SigningKeyProvider.getVerificationKey is unavailable",
  );

  console.log("✓ SigningKeyProvider is available");

  // ==========================================================================
  // 8. HMAC Key Provider
  // ==========================================================================

  printSection("8. HMAC Key Provider");

  assert(
    provider.hmacKeyProvider !== undefined,
    "HmacKeyProvider is unavailable",
  );

  assert(
    typeof provider.hmacKeyProvider.getHmacKey === "function",
    "HmacKeyProvider.getHmacKey is unavailable",
  );

  assert(
    typeof provider.hmacKeyProvider.getHmacKeyByVersion === "function",
    "HmacKeyProvider.getHmacKeyByVersion is unavailable",
  );

  console.log("✓ HmacKeyProvider is available");

  // ==========================================================================
  // 9. Crypto Provider
  // ==========================================================================

  printSection("9. Crypto Provider");

  assert(
    provider.cryptoProvider !== undefined,
    "CryptoProvider is unavailable",
  );

  assert(
    typeof provider.cryptoProvider.encrypt === "function",
    "CryptoProvider.encrypt is unavailable",
  );

  assert(
    typeof provider.cryptoProvider.decrypt === "function",
    "CryptoProvider.decrypt is unavailable",
  );

  assert(
    typeof provider.cryptoProvider.hash === "function",
    "CryptoProvider.hash is unavailable",
  );

  assert(
    typeof provider.cryptoProvider.verifyHash === "function",
    "CryptoProvider.verifyHash is unavailable",
  );

  assert(
    typeof provider.cryptoProvider.sign === "function",
    "CryptoProvider.sign is unavailable",
  );

  assert(
    typeof provider.cryptoProvider.verifySignature === "function",
    "CryptoProvider.verifySignature is unavailable",
  );

  assert(
    typeof provider.cryptoProvider.createHmac === "function",
    "CryptoProvider.createHmac is unavailable",
  );

  assert(
    typeof provider.cryptoProvider.verifyHmac === "function",
    "CryptoProvider.verifyHmac is unavailable",
  );

  console.log("✓ CryptoProvider is available");

  console.log("✓ Encryption/decryption operations available");

  console.log("✓ Hashing operations available");

  console.log("✓ Signing operations available");

  console.log("✓ HMAC operations available");

  // ==========================================================================
  // 10. Metadata Security Boundary
  // ==========================================================================

  printSection("10. Metadata Security Boundary");

  assert(
    !("privateKey" in metadata),
    "Private key exposed through provider metadata",
  );

  assert(
    !("publicKey" in metadata),
    "Public key exposed through provider metadata",
  );

  assert(
    !("keyMaterial" in metadata),
    "Raw key material exposed through provider metadata",
  );

  assert(
    !("secretKey" in metadata),
    "Secret key exposed through provider metadata",
  );

  assert(
    !("password" in metadata),
    "Password exposed through provider metadata",
  );

  assert(!("token" in metadata), "Token exposed through provider metadata");

  console.log("✓ No raw cryptographic material exposed");

  console.log("✓ No credentials exposed");

  // ==========================================================================
  // Final Result
  // ==========================================================================

  console.log("");
  console.log("==================================================");

  console.log("Phase 8.1 Local Provider Baseline Review");

  console.log("==================================================");

  console.log("✓ Local provider construction");

  console.log("✓ Provider metadata");

  console.log("✓ Provider status");

  console.log("✓ Provider capabilities");

  console.log("✓ Key provider");

  console.log("✓ Key material provider");

  console.log("✓ Signing key provider");

  console.log("✓ HMAC key provider");

  console.log("✓ Crypto provider");

  console.log("✓ Metadata security boundary");

  console.log("==================================================");

  console.log("PHASE 8.1 MANUAL VERIFICATION PASSED");

  console.log("==================================================");
};

// ============================================================================
// Start Manual Verification
// ============================================================================

void runManualVerification();
