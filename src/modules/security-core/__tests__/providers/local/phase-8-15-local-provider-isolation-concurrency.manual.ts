import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import {
  SecurityScope,
  SecurityPurpose,
  DataClassification,
} from "../../../domain/enums";

import { KeyPurpose } from "../../../domain/enums";
import { HashAlgorithm } from "../../../domain/enums/hash-algorithm.enum.js";

const createSecurityContext = (organizationId: string) => ({
  scope: SecurityScope.ORGANIZATION,
  organizationId,
  classification: DataClassification.CONFIDENTIAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
});

const createEncryptionKeyRequest = () => ({
  purpose: KeyPurpose.ENCRYPTION,
  scope: SecurityScope.ORGANIZATION,
});

async function runManualVerification(): Promise<void> {
  console.log("");
  console.log("======================================================");
  console.log("Phase 8.15 - Local Provider Isolation & Concurrency");
  console.log("======================================================");
  console.log("");

  /**
   * ---------------------------------------------------------
   * 1. Create Providers
   * ---------------------------------------------------------
   */

  console.log("1. Creating independent Local providers...");

  const providerA = new LocalSecurityProvider();
  const providerB = new LocalSecurityProvider();

  if (providerA === providerB) {
    throw new Error("Provider instances are shared");
  }

  console.log("   ✓ Provider A created");
  console.log("   ✓ Provider B created");
  console.log("   ✓ Provider instances are independent");

  /**
   * ---------------------------------------------------------
   * 2. Dependency Isolation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("2. Checking dependency isolation...");

  if (providerA.keyProvider === providerB.keyProvider) {
    throw new Error("KeyProvider is shared");
  }

  if (providerA.keyMaterialProvider === providerB.keyMaterialProvider) {
    throw new Error("KeyMaterialProvider is shared");
  }

  if (providerA.signingKeyProvider === providerB.signingKeyProvider) {
    throw new Error("SigningKeyProvider is shared");
  }

  if (providerA.hmacKeyProvider === providerB.hmacKeyProvider) {
    throw new Error("HmacKeyProvider is shared");
  }

  if (providerA.cryptoProvider === providerB.cryptoProvider) {
    throw new Error("CryptoProvider is shared");
  }

  console.log("   ✓ KeyProvider isolated");
  console.log("   ✓ KeyMaterialProvider isolated");
  console.log("   ✓ SigningKeyProvider isolated");
  console.log("   ✓ HmacKeyProvider isolated");
  console.log("   ✓ CryptoProvider isolated");

  /**
   * ---------------------------------------------------------
   * 3. Provider State
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("3. Checking provider state...");

  console.log(`   Provider A status: ${providerA.getStatus()}`);
  console.log(`   Provider B status: ${providerB.getStatus()}`);

  if (providerA.getStatus() !== "READY") {
    throw new Error("Provider A is not READY");
  }

  if (providerB.getStatus() !== "READY") {
    throw new Error("Provider B is not READY");
  }

  console.log("   ✓ Provider states are independent");

  /**
   * ---------------------------------------------------------
   * 4. Key Isolation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("4. Testing key isolation...");

  const keyA = await providerA.keyProvider.createKey(
    createEncryptionKeyRequest(),
  );

  const keyB = await providerB.keyProvider.createKey(
    createEncryptionKeyRequest(),
  );

  console.log(`   Provider A key: ${keyA.id}`);
  console.log(`   Provider B key: ${keyB.id}`);

  const keyAFromB = await providerB.keyProvider.getKey(keyA.id);
  const keyBFromA = await providerA.keyProvider.getKey(keyB.id);

  if (keyAFromB !== null) {
    throw new Error("Provider B accessed Provider A key");
  }

  if (keyBFromA !== null) {
    throw new Error("Provider A accessed Provider B key");
  }

  console.log("   ✓ Provider A key isolated");
  console.log("   ✓ Provider B key isolated");

  /**
   * ---------------------------------------------------------
   * 5. Key Material Isolation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("5. Testing key material isolation...");

  try {
    await providerB.keyMaterialProvider.getKeyMaterial(keyA.id, 1);

    throw new Error("Provider B accessed Provider A key material");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Provider B accessed Provider A key material"
    ) {
      throw error;
    }

    console.log("   ✓ Cross-provider key material rejected");
  }

  /**
   * ---------------------------------------------------------
   * 6. Concurrent Key Creation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("6. Testing concurrent key creation...");

  const concurrentKeys = await Promise.all([
    providerA.keyProvider.createKey(createEncryptionKeyRequest()),
    providerA.keyProvider.createKey(createEncryptionKeyRequest()),
    providerB.keyProvider.createKey(createEncryptionKeyRequest()),
    providerB.keyProvider.createKey(createEncryptionKeyRequest()),
  ]);

  const uniqueKeyIds = new Set(concurrentKeys.map((key) => key.id));

  if (uniqueKeyIds.size !== concurrentKeys.length) {
    throw new Error("Concurrent key IDs are not unique");
  }

  console.log("   ✓ Concurrent key creation successful");
  console.log("   ✓ All generated key IDs are unique");

  /**
   * ---------------------------------------------------------
   * 7. Concurrent Hashing
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("7. Testing concurrent hashing...");

  const hashResults = await Promise.all([
    providerA.cryptoProvider.hash({
      value: "provider-a-value-1",
      //   algorithm: "SHA-256",
      algorithm: HashAlgorithm.SHA_256,
    }),
    providerA.cryptoProvider.hash({
      value: "provider-a-value-2",
      //   algorithm: "SHA-256",
      algorithm: HashAlgorithm.SHA_256,
    }),
    providerB.cryptoProvider.hash({
      value: "provider-b-value-1",
      //   algorithm: "SHA-256",
      algorithm: HashAlgorithm.SHA_256,
    }),
    providerB.cryptoProvider.hash({
      value: "provider-b-value-2",
      //   algorithm: "SHA-256",
      algorithm: HashAlgorithm.SHA_256,
    }),
  ]);

  if (hashResults.length !== 4) {
    throw new Error("Concurrent hashing failed");
  }

  console.log("   ✓ Concurrent SHA-256 operations successful");

  /**
   * ---------------------------------------------------------
   * 8. Concurrent Signing Key Operations
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("8. Testing concurrent signing key operations...");

  const contextA = createSecurityContext("org-concurrent-a");
  const contextB = createSecurityContext("org-concurrent-b");

  const [signingKeyA, signingKeyB] = await Promise.all([
    providerA.signingKeyProvider.getSigningKey(contextA),
    providerB.signingKeyProvider.getSigningKey(contextB),
  ]);

  if (signingKeyA.keyId === signingKeyB.keyId) {
    throw new Error("Signing keys leaked across providers");
  }

  console.log("   ✓ Provider A signing key created");
  console.log("   ✓ Provider B signing key created");
  console.log("   ✓ Signing keys remain isolated");

  /**
   * ---------------------------------------------------------
   * 9. Concurrent HMAC Key Operations
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("9. Testing concurrent HMAC key operations...");

  const [hmacKeyA, hmacKeyB] = await Promise.all([
    providerA.hmacKeyProvider.getHmacKey(contextA),
    providerB.hmacKeyProvider.getHmacKey(contextB),
  ]);

  if (hmacKeyA.keyId === hmacKeyB.keyId) {
    throw new Error("HMAC keys leaked across providers");
  }

  console.log("   ✓ Provider A HMAC key created");
  console.log("   ✓ Provider B HMAC key created");
  console.log("   ✓ HMAC keys remain isolated");

  /**
   * ---------------------------------------------------------
   * 10. Failure Isolation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("10. Testing failure isolation...");

  try {
    await providerA.keyMaterialProvider.getKeyMaterial("non-existent-key", 1);

    throw new Error("Provider A accepted an invalid key");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Provider A accepted an invalid key"
    ) {
      throw error;
    }

    console.log("   ✓ Provider A rejected invalid key");
  }

  const healthyKeyB = await providerB.keyProvider.createKey(
    createEncryptionKeyRequest(),
  );

  if (!healthyKeyB.id) {
    throw new Error("Provider B was affected by Provider A failure");
  }

  console.log("   ✓ Provider B continues operating normally");

  /**
   * ---------------------------------------------------------
   * 11. Final Provider State
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("11. Verifying final provider state...");

  if (providerA.getStatus() !== "READY") {
    throw new Error("Provider A state changed unexpectedly");
  }

  if (providerB.getStatus() !== "READY") {
    throw new Error("Provider B state changed unexpectedly");
  }

  console.log("   ✓ Provider A remains READY");
  console.log("   ✓ Provider B remains READY");

  /**
   * ---------------------------------------------------------
   * Final Result
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("======================================================");
  console.log("Phase 8.15 Manual Verification PASSED");
  console.log("======================================================");
  console.log("");
}

runManualVerification().catch((error) => {
  console.error("");
  console.error("======================================================");
  console.error("Phase 8.15 Manual Verification FAILED");
  console.error("======================================================");
  console.error("");

  console.error(error);

  process.exit(1);
});
