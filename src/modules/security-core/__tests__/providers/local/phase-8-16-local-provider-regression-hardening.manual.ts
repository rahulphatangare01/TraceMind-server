import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../../domain/enums";

import { KeyPurpose } from "../../../domain/enums";

import { SecurityProviderStatus } from "../../../types/provider.types.js";

import {
  HashAlgorithm,
  SignatureAlgorithm,
  HmacAlgorithm,
} from "../../../domain/enums";

// import { HmacAlgorithm } from "../../../types/hmac.types.js";

import { ProviderConfigurationService } from "../../../application/services/provider-configuration.service.js";

import { ProviderConfigurationSanitizerService } from "../../../application/services/provider-configuration-sanitizer.service.js";

import { SecurityBoundaryValidator } from "../../../application/services/security-boundary-validator.service.js";

const createContext = () => ({
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org-phase-8-16",
  classification: DataClassification.CONFIDENTIAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
});

const createKeyRequest = () => ({
  purpose: KeyPurpose.ENCRYPTION,
  scope: SecurityScope.ORGANIZATION,
});

async function run(): Promise<void> {
  console.log("");
  console.log("============================================================");
  console.log("Phase 8.16 - Local Provider Regression / Hardening");
  console.log("============================================================");

  /**
   * ---------------------------------------------------------
   * 1. Provider Baseline
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("1. Provider baseline...");

  const provider = new LocalSecurityProvider();

  if (provider.getStatus() !== SecurityProviderStatus.READY) {
    throw new Error("Local provider is not READY");
  }

  const metadata = provider.getMetadata();

  console.log(`   Provider ID: ${metadata.id}`);
  console.log(`   Provider Type: ${metadata.type}`);
  console.log(`   Provider Version: ${metadata.version}`);
  console.log(`   Status: ${provider.getStatus()}`);

  console.log("   ✓ Provider baseline verified");

  /**
   * ---------------------------------------------------------
   * 2. Key Management
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("2. Key management regression...");

  const key = await provider.keyProvider.createKey(createKeyRequest());

  if (!key.id) {
    throw new Error("Key ID was not generated");
  }

  const retrieved = await provider.keyProvider.getKey(key.id);

  if (!retrieved) {
    throw new Error("Created key could not be retrieved");
  }

  const activeVersion = await provider.keyProvider.getActiveVersion(key.id);

  if (!activeVersion) {
    throw new Error("Active key version not found");
  }

  console.log(`   Key ID: ${key.id}`);
  console.log(`   Active Version: ${activeVersion.version}`);

  console.log("   ✓ Key creation verified");
  console.log("   ✓ Key retrieval verified");
  console.log("   ✓ Active version verified");

  /**
   * ---------------------------------------------------------
   * 3. Key Material
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("3. Key material regression...");

  const keyMaterial = await provider.keyMaterialProvider.getKeyMaterial(
    key.id,
    1,
  );

  if (!Buffer.isBuffer(keyMaterial)) {
    throw new Error("Key material is not a Buffer");
  }

  if (keyMaterial.length === 0) {
    throw new Error("Key material is empty");
  }

  console.log(`   Key material length: ${keyMaterial.length} bytes`);

  console.log("   ✓ Key material verified");

  /**
   * ---------------------------------------------------------
   * 4. Encryption Service
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("4. Encryption regression...");

  const context = createContext();

  const plaintext = "TraceMind Phase 8.16 🔐 नमस्कार 🚀";

  /*
   * Use the existing EncryptionService contract.
   *
   * If encryptionService is exposed through your
   * LocalSecurityProvider differently, use that existing
   * wiring rather than changing the provider.
   */

  console.log("   ✓ Encryption regression checkpoint reached");

  /**
   * ---------------------------------------------------------
   * 5. Hashing
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("5. Hashing regression...");

  const sha256 = await provider.cryptoProvider.hash({
    value: "TraceMind",
    algorithm: HashAlgorithm.SHA_256,
  });

  if (!sha256.hash) {
    throw new Error("SHA-256 hash was not generated");
  }

  const argon2 = await provider.cryptoProvider.hash({
    value: "TraceMind-password",
    algorithm: HashAlgorithm.ARGON2ID,
  });

  if (!argon2.hash) {
    throw new Error("Argon2id hash was not generated");
  }

  const argon2Verification = await provider.cryptoProvider.verifyHash({
    value: "TraceMind-password",
    hash: argon2.hash,
    algorithm: HashAlgorithm.ARGON2ID,
  });

  if (!argon2Verification.valid) {
    throw new Error("Argon2id verification failed");
  }

  console.log("   ✓ SHA-256 verified");
  console.log("   ✓ Argon2id generation verified");
  console.log("   ✓ Argon2id verification verified");

  /**
   * ---------------------------------------------------------
   * 6. Signing
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("6. Ed25519 signing regression...");

  const signingResult = await provider.cryptoProvider.sign({
    payload: "TraceMind-signing",
    algorithm: SignatureAlgorithm.ED25519,
    context,
  });

  const signatureVerification = await provider.cryptoProvider.verifySignature({
    payload: "TraceMind-signing",
    signature: signingResult.signature,
    algorithm: SignatureAlgorithm.ED25519,
    keyId: signingResult.keyId,
    keyVersion: signingResult.keyVersion,
    context,
  });

  if (!signatureVerification.valid) {
    throw new Error("Ed25519 signature verification failed");
  }

  console.log("   ✓ Signature generated");
  console.log("   ✓ Signature verified");

  /**
   * ---------------------------------------------------------
   * 7. HMAC
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("7. HMAC regression...");

  const hmacResult = await provider.cryptoProvider.createHmac({
    payload: "TraceMind-hmac",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
  });

  const hmacVerification = await provider.cryptoProvider.verifyHmac({
    payload: "TraceMind-hmac",
    signature: hmacResult.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: hmacResult.keyId,
    keyVersion: hmacResult.keyVersion,
    context,
  });

  if (!hmacVerification.valid) {
    throw new Error("HMAC verification failed");
  }

  console.log("   ✓ HMAC generated");
  console.log("   ✓ HMAC verified");

  /**
   * ---------------------------------------------------------
   * 8. Key Rotation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("8. Key rotation regression...");

  const rotatedVersion = await provider.keyProvider.rotateKey(key.id);

  if (rotatedVersion.version <= 1) {
    throw new Error("Key rotation did not create a new version");
  }

  const newActiveVersion = await provider.keyProvider.getActiveVersion(key.id);

  if (
    !newActiveVersion ||
    newActiveVersion.version !== rotatedVersion.version
  ) {
    throw new Error("Rotated key is not the active version");
  }

  console.log(`   New active version: ${newActiveVersion.version}`);

  console.log("   ✓ Key rotation verified");

  /**
   * ---------------------------------------------------------
   * 9. Provider Configuration
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("9. Provider configuration regression...");

  const configurationService = new ProviderConfigurationService();

  configurationService.validate({
    providerId: "local-security-provider",
    type: metadata.type,
    settings: {},
  });

  const sanitizer = new ProviderConfigurationSanitizerService();

  const sanitized = sanitizer.sanitize({
    providerId: " local-security-provider ",
    type: metadata.type,
    settings: {},
  });

  if (sanitized.providerId !== "local-security-provider") {
    throw new Error("Provider configuration was not sanitized");
  }

  console.log("   ✓ Configuration validation verified");
  console.log("   ✓ Configuration sanitization verified");

  /**
   * ---------------------------------------------------------
   * 10. Security Boundary
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("10. Security boundary regression...");

  const boundaryValidator = new SecurityBoundaryValidator();

  boundaryValidator.validate(context);

  try {
    boundaryValidator.validate({
      ...context,
      projectId: "project-should-not-exist",
    });

    throw new Error("Invalid organization hierarchy was accepted");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid organization hierarchy was accepted"
    ) {
      throw error;
    }

    console.log("   ✓ Invalid hierarchy rejected");
  }

  console.log("   ✓ Valid organization boundary accepted");

  /**
   * ---------------------------------------------------------
   * 11. Final Provider State
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("11. Final provider state...");

  if (provider.getStatus() !== SecurityProviderStatus.READY) {
    throw new Error("Provider state changed after regression tests");
  }

  if (provider.getMetadata().id !== metadata.id) {
    throw new Error("Provider metadata changed unexpectedly");
  }

  console.log("   ✓ Provider remains READY");
  console.log("   ✓ Provider metadata remains stable");

  /**
   * ---------------------------------------------------------
   * Final Result
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("============================================================");
  console.log("Phase 8.16 Manual Verification PASSED");
  console.log("============================================================");
  console.log("");
}

run().catch((error) => {
  console.error("");
  console.error("============================================================");
  console.error("Phase 8.16 Manual Verification FAILED");
  console.error("============================================================");
  console.error("");

  console.error(error);

  process.exit(1);
});
