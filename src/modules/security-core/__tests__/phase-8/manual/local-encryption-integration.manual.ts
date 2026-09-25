import {
  SecurityScope,
  DataClassification,
  SecurityPurpose,
  KeyPurpose,
} from "../../../domain/enums/index.js";

import type { SecurityContext } from "../../../domain/models/security-context.js";

import { LocalKeyProvider } from "../../../providers/local/local-key.provider.js";
import { LocalKeyMaterialProvider } from "../../../providers/local/local-key-material.provider.js";
import { LocalCryptoProvider } from "../../../providers/local/local-crypto.provider.js";

import { EncryptionService } from "../../../application/services/encryption.service.js";
import { SecurityBoundaryValidator } from "../../../application/services/security-boundary-validator.service.js";

/**
 * Phase 8.7
 * Local Encryption Integration
 *
 * Manual verification covers:
 * 1. Encryption
 * 2. Decryption
 * 3. Round-trip plaintext verification
 * 4. Security context protection
 * 5. Tampered ciphertext rejection
 * 6. Key rotation compatibility
 * 7. Unicode plaintext
 */

const runManualVerification = async (): Promise<void> => {
  const context: SecurityContext = {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-encryption-manual",
    classification: DataClassification.CONFIDENTIAL,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  const keyProvider = new LocalKeyProvider();

  const keyMaterialProvider = new LocalKeyMaterialProvider();

  const cryptoProvider = new LocalCryptoProvider();

  const securityBoundaryValidator = new SecurityBoundaryValidator();

  const encryptionService = new EncryptionService(
    keyProvider,
    keyMaterialProvider,
    cryptoProvider,
    securityBoundaryValidator,
  );

  /**
   * Create encryption key
   */
  const key = await keyProvider.createKey({
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-encryption-manual",
  });

  console.log("Created encryption key:", key.id);

  /**
   * ---------------------------------------------------------
   * 1. Basic Encryption
   * ---------------------------------------------------------
   */

  const plaintext = "TraceMind encryption manual test";

  const encrypted = await encryptionService.encrypt(plaintext, context, key.id);

  if (!encrypted) {
    throw new Error("Encryption did not produce encrypted data");
  }

  if (typeof encrypted !== "string") {
    throw new Error("Encryption result is not a string");
  }

  if (encrypted.length === 0) {
    throw new Error("Encrypted value is empty");
  }

  console.log("✓ Encryption successful");

  /**
   * ---------------------------------------------------------
   * 2. Basic Decryption
   * ---------------------------------------------------------
   */

  // const decrypted = await encryptionService.decrypt(encrypted, context, key.id);
  const decrypted = await encryptionService.decrypt(encrypted, context);

  if (decrypted !== plaintext) {
    throw new Error("Decrypted plaintext does not match original plaintext");
  }

  console.log("✓ Decryption successful");

  /**
   * ---------------------------------------------------------
   * 3. Security Context Protection
   * ---------------------------------------------------------
   */

  const wrongContext: SecurityContext = {
    ...context,
    organizationId: "different-organization",
  };

  let wrongContextRejected = false;

  try {
    // await encryptionService.decrypt(encrypted, wrongContext, key.id);
    await encryptionService.decrypt(encrypted, wrongContext);
  } catch {
    wrongContextRejected = true;
  }

  if (!wrongContextRejected) {
    throw new Error("Wrong security context was accepted");
  }

  console.log("✓ Wrong security context rejected");

  /**
   * ---------------------------------------------------------
   * 4. Tampered Ciphertext
   * ---------------------------------------------------------
   */

  const encryptedBuffer = Buffer.from(encrypted, "base64");

  if (encryptedBuffer.length === 0) {
    throw new Error("Encrypted value could not be decoded");
  }

  encryptedBuffer[0] = encryptedBuffer[0] ^ 0xff;

  const tamperedCiphertext = encryptedBuffer.toString("base64");

  let tamperedCiphertextRejected = false;

  try {
    await encryptionService.decrypt(tamperedCiphertext, context);
    // await encryptionService.decrypt(tamperedCiphertext, context, key.id);
  } catch {
    tamperedCiphertextRejected = true;
  }

  if (!tamperedCiphertextRejected) {
    throw new Error("Tampered ciphertext was accepted");
  }

  console.log("✓ Tampered ciphertext rejected");

  /**
   * ---------------------------------------------------------
   * 5. Different IV / Non-Deterministic Encryption
   * ---------------------------------------------------------
   *
   * Encrypting the same plaintext twice should produce
   * different encrypted values because AES-GCM uses a
   * fresh random IV for each encryption.
   */

  const firstEncryption = await encryptionService.encrypt(
    "same plaintext",
    context,
    key.id,
  );

  const secondEncryption = await encryptionService.encrypt(
    "same plaintext",
    context,
    key.id,
  );

  if (firstEncryption === secondEncryption) {
    throw new Error("Separate encryptions produced the same encrypted value");
  }

  console.log("✓ Separate encryptions produced different values");

  /**
   * ---------------------------------------------------------
   * 6. Historical Key Version
   * ---------------------------------------------------------
   *
   * Encrypt using the current key version.
   * Rotate the key.
   * Existing encrypted data should still be decryptable.
   */

  const historicalPlaintext = "historical-key-test";

  const historicalEncryption = await encryptionService.encrypt(
    historicalPlaintext,
    context,
    key.id,
  );

  if (!historicalEncryption) {
    throw new Error("Historical encryption did not produce encrypted data");
  }

  await keyProvider.rotateKey(key.id);

  console.log("✓ Encryption key rotated");

  /**
   * Decrypt data created before rotation.
   */
  const historicalDecryption = await encryptionService.decrypt(
    historicalEncryption,
    context,
    // key.id,
  );

  if (historicalDecryption !== historicalPlaintext) {
    throw new Error(
      "Historical key version could not decrypt existing ciphertext",
    );
  }

  console.log("✓ Historical encrypted data decrypted successfully");

  /**
   * ---------------------------------------------------------
   * 7. Unicode Plaintext
   * ---------------------------------------------------------
   */

  const unicodePlaintext = "TraceMind सुरक्षित 🔐";

  const unicodeEncrypted = await encryptionService.encrypt(
    unicodePlaintext,
    context,
    key.id,
  );

  const unicodeDecrypted = await encryptionService.decrypt(
    unicodeEncrypted,
    context,
    // key.id,
  );

  if (unicodeDecrypted !== unicodePlaintext) {
    throw new Error("Unicode plaintext was not preserved correctly");
  }

  console.log("✓ Unicode plaintext preserved");

  /**
   * ---------------------------------------------------------
   * Final Result
   * ---------------------------------------------------------
   */

  console.log("Phase 8.7 manual verification passed");
};
void runManualVerification();
