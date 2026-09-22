// import {
//   EncryptionAlgorithm,
//   CryptoEncoding,
//   SecurityScope,
//   DataClassification,
//   SecurityPurpose,
//   KeyPurpose,
// } from "../../../domain/enums";

// import {
//   HashAlgorithm,
//   SignatureAlgorithm,
//   HmacAlgorithm,
// } from "../../../domain/enums";

// import {
//   SecurityProviderCapability,
//   SecurityProviderStatus,
//   SecurityProviderType,
// } from "../../../types/provider.types.js";

// import type { SecurityContext } from "../../../domain/models";

// import type { SecurityProvider } from "../../../types/provider.types.js";

// import { securityCore } from "../../../security-core.container.js";

// import { ProviderRegistryService } from "../../../application/services/provider-registry.service.js";
// import { ProviderResolverService } from "../../../application/services/provider-resolver.service.js";

// /**
//  * ============================================================================
//  * Phase 7.14
//  * Backward Compatibility - Manual Verification
//  * ============================================================================
//  */

// const assert = (condition: boolean, message: string): void => {
//   if (!condition) {
//     throw new Error(`Manual verification failed: ${message}`);
//   }
// };

// const printSection = (title: string): void => {
//   console.log("");
//   console.log("--------------------------------------------------");
//   console.log(title);
//   console.log("--------------------------------------------------");
// };

// const createProvider = (id: string): SecurityProvider => ({
//   getMetadata: () => ({
//     id,
//     name: id,
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
//   }),

//   getStatus: () => SecurityProviderStatus.READY,
// });

// // const context: SecurityContext = {
// //   scope: "ORGANIZATION",
// //   organizationId: "org-regression-manual",
// //   classification: "CONFIDENTIAL",
// //   purpose: "ENCRYPTED_CONFIGURATION",
// // };
// const context = (): SecurityContext => ({
//   scope: SecurityScope.ORGANIZATION,
//   organizationId: "org-regression-test",
//   classification: DataClassification.CONFIDENTIAL,
//   purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
// });
// // ============================================================================
// // 1. Existing Security Core
// // ============================================================================

// printSection("1. Existing Security Core Compatibility");

// assert(securityCore !== undefined, "Security Core container is unavailable");

// assert(
//   securityCore.cryptoProvider !== undefined,
//   "CryptoProvider is unavailable",
// );

// assert(
//   securityCore.encryptionService !== undefined,
//   "EncryptionService is unavailable",
// );

// assert(securityCore.keyProvider !== undefined, "KeyProvider is unavailable");

// console.log("✓ Security Core container available");

// console.log("✓ Existing crypto provider available");

// console.log("✓ Existing encryption service available");

// console.log("✓ Existing key provider available");

// // ============================================================================
// // 2. Key Management
// // ============================================================================

// printSection("2. Key Management Compatibility");
// // const createSecurityContext = (): SecurityContext => ({
// //   scope: SecurityScope.ORGANIZATION,
// //   organizationId: "org-regression-test",
// //   classification: DataClassification.CONFIDENTIAL,
// //   purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
// // });
// // const  key = await securityCore.keyProvider.createKey({

// const key = await securityCore.keyProvider.createKey({
//   purpose: KeyPurpose.ENCRYPTION,
//   scope: SecurityScope.ORGANIZATION,
//   organizationId: "org-regression-manual",
// });

// assert(key !== undefined, "Key creation failed");

// assert(key.id !== undefined, "Created key has no ID");

// const activeVersion = await securityCore.keyProvider.getActiveVersion(key.id);

// assert(activeVersion !== null, "Active key version could not be resolved");

// assert(
//   activeVersion?.keyId === key.id,
//   "Active version belongs to incorrect key",
// );

// console.log("✓ Key creation works");

// console.log("✓ Active key version resolution works");

// // ============================================================================
// // 3. Encryption
// // ============================================================================

// printSection("3. Encryption Compatibility");

// const plaintext = "TraceMind backward compatibility manual test";

// const encrypted = await securityCore.encryptionService.encrypt({
//   plaintext,
//   algorithm: EncryptionAlgorithm.AES_256_GCM,
//   context,
//   encoding: CryptoEncoding.BASE64,
//   keyVersion: 1,
// });

// assert(
//   encrypted.ciphertext !== undefined,
//   "Encryption did not return ciphertext",
// );

// assert(encrypted.iv !== undefined, "Encryption did not return IV");

// assert(
//   encrypted.authTag !== undefined,
//   "Encryption did not return authentication tag",
// );

// console.log("✓ AES-256-GCM encryption works");

// // ============================================================================
// // 4. Decryption
// // ============================================================================

// printSection("4. Decryption Compatibility");

// const decrypted = await securityCore.encryptionService.decrypt({
//   ciphertext: encrypted.ciphertext,
//   algorithm: encrypted.algorithm,
//   encoding: encrypted.encoding,
//   iv: encrypted.iv,
//   authTag: encrypted.authTag,
//   keyId: encrypted.keyId,
//   keyVersion: encrypted.keyVersion,
//   context,
// });

// assert(
//   decrypted.plaintext === plaintext,
//   "Decrypted plaintext does not match original",
// );

// console.log("✓ Encryption/decryption round trip works");

// // ============================================================================
// // 5. SHA-256
// // ============================================================================

// printSection("5. SHA-256 Compatibility");

// const hash = await securityCore.cryptoProvider.hash({
//   value: "TraceMind SHA-256 regression",
//   algorithm: HashAlgorithm.SHA_256,
// });

// assert(hash.hash !== undefined, "SHA-256 hash was not generated");

// const hashVerification = await securityCore.cryptoProvider.verifyHash({
//   value: "TraceMind SHA-256 regression",
//   hash: hash.hash,
//   algorithm: HashAlgorithm.SHA_256,
// });

// assert(hashVerification.valid === true, "SHA-256 verification failed");

// console.log("✓ SHA-256 hashing works");

// console.log("✓ SHA-256 verification works");

// // ============================================================================
// // 6. Argon2id
// // ============================================================================

// printSection("6. Argon2id Compatibility");

// const passwordHash = await securityCore.cryptoProvider.hash({
//   value: "TraceMind Argon2 regression",
//   algorithm: HashAlgorithm.ARGON2ID,
// });

// assert(passwordHash.hash !== undefined, "Argon2id hash was not generated");

// console.log("✓ Argon2id hashing works");

// // ============================================================================
// // 7. Ed25519
// // ============================================================================

// printSection("7. Ed25519 Compatibility");

// const signature = await securityCore.cryptoProvider.sign({
//   payload: "TraceMind signing regression",
//   algorithm: SignatureAlgorithm.ED25519,
//   context,
// });

// assert(signature.signature !== undefined, "Signature was not generated");

// const signatureVerification = await securityCore.cryptoProvider.verifySignature(
//   {
//     payload: "TraceMind signing regression",
//     signature: signature.signature,
//     algorithm: SignatureAlgorithm.ED25519,
//     keyId: signature.keyId,
//     keyVersion: signature.keyVersion,
//     context,
//   },
// );

// assert(
//   signatureVerification.valid === true,
//   "Ed25519 signature verification failed",
// );

// console.log("✓ Ed25519 signing works");

// console.log("✓ Ed25519 verification works");

// // ============================================================================
// // 8. HMAC
// // ============================================================================

// printSection("8. HMAC Compatibility");

// const hmac = await securityCore.cryptoProvider.createHmac({
//   payload: "TraceMind HMAC regression",
//   algorithm: HmacAlgorithm.HMAC_SHA_256,
//   context,
// });

// assert(hmac.signature !== undefined, "HMAC was not generated");

// const hmacVerification = await securityCore.cryptoProvider.verifyHmac({
//   payload: "TraceMind HMAC regression",
//   signature: hmac.signature,
//   algorithm: HmacAlgorithm.HMAC_SHA_256,
//   keyId: hmac.keyId,
//   keyVersion: hmac.keyVersion,
//   context,
// });

// assert(hmacVerification.valid === true, "HMAC verification failed");

// console.log("✓ HMAC generation works");

// console.log("✓ HMAC verification works");

// // ============================================================================
// // 9. Provider Architecture
// // ============================================================================

// printSection("9. Provider Architecture Compatibility");

// const registry = new ProviderRegistryService();

// const resolver = new ProviderResolverService(registry);

// const providerA = createProvider("provider-a");

// const providerB = createProvider("provider-b");

// registry.register(providerA);
// registry.register(providerB);

// assert(
//   resolver.resolve("provider-a") === providerA,
//   "Provider A resolution failed",
// );

// assert(
//   resolver.resolve("provider-b") === providerB,
//   "Provider B resolution failed",
// );

// console.log("✓ Provider A resolution works");

// console.log("✓ Provider B resolution works");

// // ============================================================================
// // 10. Provider Switching Must Not Break Existing Crypto
// // ============================================================================

// printSection("10. Provider Switching + Existing Crypto");

// resolver.resolve("provider-a");
// resolver.resolve("provider-b");
// resolver.resolve("provider-a");

// const postSwitchPlaintext = "Encryption after provider switching";

// const postSwitchEncrypted = await securityCore.encryptionService.encrypt({
//   plaintext: postSwitchPlaintext,
//   algorithm: EncryptionAlgorithm.AES_256_GCM,
//   context,
//   encoding: CryptoEncoding.BASE64,
//   keyVersion: 1,
// });

// const postSwitchDecrypted = await securityCore.encryptionService.decrypt({
//   ciphertext: postSwitchEncrypted.ciphertext,
//   algorithm: postSwitchEncrypted.algorithm,
//   encoding: postSwitchEncrypted.encoding,
//   iv: postSwitchEncrypted.iv,
//   authTag: postSwitchEncrypted.authTag,
//   keyId: postSwitchEncrypted.keyId,
//   keyVersion: postSwitchEncrypted.keyVersion,
//   context,
// });

// assert(
//   postSwitchDecrypted.plaintext === postSwitchPlaintext,
//   "Encryption failed after provider switching",
// );

// console.log("✓ Existing encryption works after provider switching");

// // ============================================================================
// // Final Result
// // ============================================================================

// console.log("");
// console.log("==================================================");
// console.log("Phase 7.14 Backward Compatibility Verification");
// console.log("==================================================");
// console.log("✓ Security Core container compatibility");
// console.log("✓ Key management compatibility");
// console.log("✓ Encryption compatibility");
// console.log("✓ Decryption compatibility");
// console.log("✓ SHA-256 compatibility");
// console.log("✓ Argon2id compatibility");
// console.log("✓ Ed25519 compatibility");
// console.log("✓ HMAC compatibility");
// console.log("✓ Provider registry compatibility");
// console.log("✓ Provider resolver compatibility");
// console.log("✓ Provider switching compatibility");
// console.log("✓ Existing crypto remains functional");
// console.log("==================================================");
// console.log("PHASE 7.14 MANUAL VERIFICATION PASSED");
// console.log("==================================================");

import {
  SecurityScope,
  DataClassification,
  SecurityPurpose,
  KeyPurpose,
} from "../../../domain/enums";

import {
  HashAlgorithm,
  SignatureAlgorithm,
  HmacAlgorithm,
} from "../../../domain/enums";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import type { SecurityContext } from "../../../domain/models";

import type { SecurityProvider } from "../../../types/provider.types.js";

import { securityCore } from "../../../security-core.container.js";

import { ProviderRegistryService } from "../../../application/services/provider-registry.service.js";
import { ProviderResolverService } from "../../../application/services/provider-resolver.service.js";

/**
 * ============================================================================
 * Phase 7.14
 * Backward Compatibility - Manual Verification
 * ============================================================================
 */
const runManualVerification = async (): Promise<void> => {
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

  const createProvider = (id: string): SecurityProvider => ({
    getMetadata: () => ({
      id,
      name: id,
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
    }),

    getStatus: () => SecurityProviderStatus.READY,
  });

  // const context: SecurityContext = {
  //   scope: "ORGANIZATION",
  //   organizationId: "org-regression-manual",
  //   classification: "CONFIDENTIAL",
  //   purpose: "ENCRYPTED_CONFIGURATION",
  // };
  const context: SecurityContext = {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-regression-manual",
    classification: DataClassification.CONFIDENTIAL,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };
  // ============================================================================
  // 1. Existing Security Core
  // ============================================================================

  printSection("1. Existing Security Core Compatibility");

  assert(securityCore !== undefined, "Security Core container is unavailable");

  assert(
    securityCore.cryptoProvider !== undefined,
    "CryptoProvider is unavailable",
  );

  assert(
    securityCore.encryptionService !== undefined,
    "EncryptionService is unavailable",
  );

  assert(securityCore.keyProvider !== undefined, "KeyProvider is unavailable");

  console.log("✓ Security Core container available");

  console.log("✓ Existing crypto provider available");

  console.log("✓ Existing encryption service available");

  console.log("✓ Existing key provider available");

  // ============================================================================
  // 2. Key Management
  // ============================================================================

  printSection("2. Key Management Compatibility");
  // const createSecurityContext = (): SecurityContext => ({
  //   scope: SecurityScope.ORGANIZATION,
  //   organizationId: "org-regression-test",
  //   classification: DataClassification.CONFIDENTIAL,
  //   purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  // });
  // const  key = await securityCore.keyProvider.createKey({

  const key = await securityCore.keyProvider.createKey({
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-regression-manual",
  });

  assert(key !== undefined, "Key creation failed");

  assert(key.id !== undefined, "Created key has no ID");

  const activeVersion = await securityCore.keyProvider.getActiveVersion(key.id);

  assert(activeVersion !== null, "Active key version could not be resolved");

  assert(
    activeVersion?.keyId === key.id,
    "Active version belongs to incorrect key",
  );

  console.log("✓ Key creation works");

  console.log("✓ Active key version resolution works");

  // ============================================================================
  // 3. Encryption
  // ============================================================================

  printSection("3. Encryption Compatibility");

  const plaintext = "TraceMind backward compatibility manual test";

  const encrypted = await securityCore.encryptionService.encrypt(
    plaintext,
    context,
    key.id,
  );

  assert(
    typeof encrypted === "string" && encrypted.length > 0,
    "Encryption did not return encrypted value",
  );

  console.log("✓ AES-256-GCM encryption works");

  // ============================================================================
  // 4. Decryption
  // ============================================================================

  printSection("4. Decryption Compatibility");

  const decrypted = await securityCore.encryptionService.decrypt(
    encrypted,
    context,
  );

  assert(
    decrypted === plaintext,
    "Decrypted plaintext does not match original",
  );

  console.log("✓ Encryption/decryption round trip works");

  // ============================================================================
  // 5. SHA-256
  // ============================================================================

  printSection("5. SHA-256 Compatibility");

  const hash = await securityCore.cryptoProvider.hash({
    value: "TraceMind SHA-256 regression",
    algorithm: HashAlgorithm.SHA_256,
  });

  assert(hash.hash !== undefined, "SHA-256 hash was not generated");

  const hashVerification = await securityCore.cryptoProvider.verifyHash({
    value: "TraceMind SHA-256 regression",
    hash: hash.hash,
    algorithm: HashAlgorithm.SHA_256,
  });

  assert(hashVerification.valid === true, "SHA-256 verification failed");

  console.log("✓ SHA-256 hashing works");

  console.log("✓ SHA-256 verification works");

  // ============================================================================
  // 6. Argon2id
  // ============================================================================

  printSection("6. Argon2id Compatibility");

  const passwordHash = await securityCore.cryptoProvider.hash({
    value: "TraceMind Argon2 regression",
    algorithm: HashAlgorithm.ARGON2ID,
  });

  assert(passwordHash.hash !== undefined, "Argon2id hash was not generated");

  console.log("✓ Argon2id hashing works");

  // ============================================================================
  // 7. Ed25519
  // ============================================================================

  printSection("7. Ed25519 Compatibility");

  const signature = await securityCore.cryptoProvider.sign({
    payload: "TraceMind signing regression",
    algorithm: SignatureAlgorithm.ED25519,
    context,
  });

  assert(signature.signature !== undefined, "Signature was not generated");

  const signatureVerification =
    await securityCore.cryptoProvider.verifySignature({
      payload: "TraceMind signing regression",
      signature: signature.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signature.keyId,
      keyVersion: signature.keyVersion,
      context,
    });

  assert(
    signatureVerification.valid === true,
    "Ed25519 signature verification failed",
  );

  console.log("✓ Ed25519 signing works");

  console.log("✓ Ed25519 verification works");

  // ============================================================================
  // 8. HMAC
  // ============================================================================

  printSection("8. HMAC Compatibility");

  const hmac = await securityCore.cryptoProvider.createHmac({
    payload: "TraceMind HMAC regression",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
  });

  assert(hmac.signature !== undefined, "HMAC was not generated");

  const hmacVerification = await securityCore.cryptoProvider.verifyHmac({
    payload: "TraceMind HMAC regression",
    signature: hmac.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: hmac.keyId,
    keyVersion: hmac.keyVersion,
    context,
  });

  assert(hmacVerification.valid === true, "HMAC verification failed");

  console.log("✓ HMAC generation works");

  console.log("✓ HMAC verification works");

  // ============================================================================
  // 9. Provider Architecture
  // ============================================================================

  printSection("9. Provider Architecture Compatibility");

  const registry = new ProviderRegistryService();

  const resolver = new ProviderResolverService(registry);

  const providerA = createProvider("provider-a");

  const providerB = createProvider("provider-b");

  registry.register(providerA);
  registry.register(providerB);

  assert(
    resolver.resolve("provider-a") === providerA,
    "Provider A resolution failed",
  );

  assert(
    resolver.resolve("provider-b") === providerB,
    "Provider B resolution failed",
  );

  console.log("✓ Provider A resolution works");

  console.log("✓ Provider B resolution works");

  // ============================================================================
  // 10. Provider Switching Must Not Break Existing Crypto
  // ============================================================================

  printSection("10. Provider Switching + Existing Crypto");

  resolver.resolve("provider-a");
  resolver.resolve("provider-b");
  resolver.resolve("provider-a");

  const postSwitchPlaintext = "Encryption after provider switching";

  const postSwitchEncrypted = await securityCore.encryptionService.encrypt(
    postSwitchPlaintext,
    context,
    key.id,
  );

  const postSwitchDecrypted = await securityCore.encryptionService.decrypt(
    postSwitchEncrypted,
    context,
  );

  assert(
    postSwitchDecrypted === postSwitchPlaintext,
    "Encryption failed after provider switching",
  );

  console.log("✓ Existing encryption works after provider switching");

  // ============================================================================
  // Final Result
  // ============================================================================

  console.log("");
  console.log("==================================================");
  console.log("Phase 7.14 Backward Compatibility Verification");
  console.log("==================================================");
  console.log("✓ Security Core container compatibility");
  console.log("✓ Key management compatibility");
  console.log("✓ Encryption compatibility");
  console.log("✓ Decryption compatibility");
  console.log("✓ SHA-256 compatibility");
  console.log("✓ Argon2id compatibility");
  console.log("✓ Ed25519 compatibility");
  console.log("✓ HMAC compatibility");
  console.log("✓ Provider registry compatibility");
  console.log("✓ Provider resolver compatibility");
  console.log("✓ Provider switching compatibility");
  console.log("✓ Existing crypto remains functional");
  console.log("==================================================");
  console.log("PHASE 7.14 MANUAL VERIFICATION PASSED");
  console.log("==================================================");
  console.log("==================================================");
};

void runManualVerification();
