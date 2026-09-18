import { describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";

import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";

import {
  CryptoEncoding,
  DataClassification,
  EncryptionAlgorithm,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

describe("Phase 3 - LocalCryptoProvider", () => {
  const provider = new LocalCryptoProvider();

  const keyMaterial = randomBytes(32);

  const keyId = "key_phase3_test";

  const keyVersion = 1;

  const context = {
    scope: SecurityScope.ORGANIZATION,

    organizationId: "org_phase3_test",

    classification: DataClassification.SECRET,

    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  it("should encrypt plaintext using AES-256-GCM", async () => {
    const plaintext = "Hello TraceMind";

    const result = await provider.encrypt({
      plaintext,

      algorithm: EncryptionAlgorithm.AES_256_GCM,

      context,

      keyId,

      keyVersion,

      keyMaterial,

      encoding: CryptoEncoding.BASE64,
    });

    expect(result.ciphertext).toBeTruthy();

    expect(result.iv).toBeTruthy();

    expect(result.authTag).toBeTruthy();

    expect(result.keyId).toBe(keyId);

    expect(result.keyVersion).toBe(keyVersion);

    expect(result.algorithm).toBe(EncryptionAlgorithm.AES_256_GCM);
  });

  it("should decrypt encrypted plaintext", async () => {
    const plaintext = "Hello TraceMind";

    const encrypted = await provider.encrypt({
      plaintext,

      algorithm: EncryptionAlgorithm.AES_256_GCM,

      context,

      keyId,

      keyVersion,

      keyMaterial,

      encoding: CryptoEncoding.BASE64,
    });

    const decrypted = await provider.decrypt({
      ciphertext: encrypted.ciphertext,

      algorithm: encrypted.algorithm,

      encoding: encrypted.encoding,

      iv: encrypted.iv,

      authTag: encrypted.authTag,

      keyId: encrypted.keyId,

      keyVersion: encrypted.keyVersion,

      context,

      keyMaterial,
    });

    expect(decrypted.plaintext).toBe(plaintext);
  });

  it("should generate a different IV for every encryption", async () => {
    const plaintext = "Same plaintext";

    const first = await provider.encrypt({
      plaintext,

      algorithm: EncryptionAlgorithm.AES_256_GCM,

      context,

      keyId,

      keyVersion,

      keyMaterial,
    });

    const second = await provider.encrypt({
      plaintext,

      algorithm: EncryptionAlgorithm.AES_256_GCM,

      context,

      keyId,

      keyVersion,

      keyMaterial,
    });

    expect(first.iv).not.toBe(second.iv);

    expect(first.ciphertext).not.toBe(second.ciphertext);
  });

  it("should reject tampered ciphertext", async () => {
    const encrypted = await provider.encrypt({
      plaintext: "Sensitive TraceMind data",

      algorithm: EncryptionAlgorithm.AES_256_GCM,

      context,

      keyId,

      keyVersion,

      keyMaterial,
    });

    const tamperedCiphertext = encrypted.ciphertext.slice(0, -2) + "AA";

    await expect(
      provider.decrypt({
        ciphertext: tamperedCiphertext,

        algorithm: encrypted.algorithm,

        encoding: encrypted.encoding,

        iv: encrypted.iv,

        authTag: encrypted.authTag,

        keyId: encrypted.keyId,

        keyVersion: encrypted.keyVersion,

        context,

        keyMaterial,
      }),
    ).rejects.toThrow();
  });

  it("should reject tampered authentication tag", async () => {
    const encrypted = await provider.encrypt({
      plaintext: "Sensitive TraceMind data",

      algorithm: EncryptionAlgorithm.AES_256_GCM,

      context,

      keyId,

      keyVersion,

      keyMaterial,
    });

    const tamperedAuthTag = encrypted.authTag.slice(0, -2) + "AA";

    await expect(
      provider.decrypt({
        ciphertext: encrypted.ciphertext,

        algorithm: encrypted.algorithm,

        encoding: encrypted.encoding,

        iv: encrypted.iv,

        authTag: tamperedAuthTag,

        keyId: encrypted.keyId,

        keyVersion: encrypted.keyVersion,

        context,

        keyMaterial,
      }),
    ).rejects.toThrow();
  });

  it("should reject tampered IV", async () => {
    const encrypted = await provider.encrypt({
      plaintext: "Sensitive TraceMind data",

      algorithm: EncryptionAlgorithm.AES_256_GCM,

      context,

      keyId,

      keyVersion,

      keyMaterial,
    });

    const tamperedIv = randomBytes(12).toString("base64");

    await expect(
      provider.decrypt({
        ciphertext: encrypted.ciphertext,

        algorithm: encrypted.algorithm,

        encoding: encrypted.encoding,

        iv: tamperedIv,

        authTag: encrypted.authTag,

        keyId: encrypted.keyId,

        keyVersion: encrypted.keyVersion,

        context,

        keyMaterial,
      }),
    ).rejects.toThrow();
  });

  it("should reject decryption with the wrong security context", async () => {
    const encrypted = await provider.encrypt({
      plaintext: "Organization secret",

      algorithm: EncryptionAlgorithm.AES_256_GCM,

      context,

      keyId,

      keyVersion,

      keyMaterial,
    });

    const wrongContext = {
      ...context,

      organizationId: "org_different",
    };

    await expect(
      provider.decrypt({
        ciphertext: encrypted.ciphertext,

        algorithm: encrypted.algorithm,

        encoding: encrypted.encoding,

        iv: encrypted.iv,

        authTag: encrypted.authTag,

        keyId: encrypted.keyId,

        keyVersion: encrypted.keyVersion,

        context: wrongContext,

        keyMaterial,
      }),
    ).rejects.toThrow();
  });
});
