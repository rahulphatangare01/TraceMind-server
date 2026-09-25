import { describe, expect, it } from "vitest";

import {
  CryptoEncoding,
  DataClassification,
  EncryptionAlgorithm,
  KeyPurpose,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

import { InvalidCiphertextError } from "../../errors/invalid-ciphertext.error.js";

import { EncryptionService } from "../../application/services/encryption.service.js";
import { SecurityBoundaryValidator } from "../../application/services/security-boundary-validator.service.js";

import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";
import { LocalKeyMaterialProvider } from "../../providers/local/local-key-material.provider.js";
import { LocalKeyProvider } from "../../providers/local/local-key.provider.js";

describe("Phase 8.7 - Local Encryption Integration", () => {
  const organizationId = "org-phase-8-7";
  const projectId = "project-phase-8-7";
  const applicationId = "application-phase-8-7";

  const createContext = (): SecurityContext => ({
    scope: SecurityScope.APPLICATION,
    organizationId,
    projectId,
    applicationId,
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  });

  const createComponents = () => {
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

    return {
      keyProvider,
      keyMaterialProvider,
      cryptoProvider,
      securityBoundaryValidator,
      encryptionService,
    };
  };

  const createEncryptionKey = async (keyProvider: LocalKeyProvider) => {
    return keyProvider.createKey({
      purpose: KeyPurpose.ENCRYPTION,
      scope: SecurityScope.APPLICATION,
      organizationId,
      projectId,
      applicationId,
      provider: "LOCAL",
    });
  };

  it("should encrypt plaintext successfully", async () => {
    const { keyProvider, encryptionService } = createComponents();

    const key = await createEncryptionKey(keyProvider);

    const encrypted = await encryptionService.encrypt(
      "TraceMind encryption test",
      createContext(),
      key.id,
    );

    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe("string");
    expect(encrypted.length).toBeGreaterThan(0);
  });

  it("should decrypt encrypted plaintext successfully", async () => {
    const { keyProvider, encryptionService } = createComponents();

    const key = await createEncryptionKey(keyProvider);

    const plaintext = "TraceMind encryption round trip";
    const context = createContext();

    const encrypted = await encryptionService.encrypt(
      plaintext,
      context,
      key.id,
    );

    const decrypted = await encryptionService.decrypt(
      encrypted,
      context,
      //   key.id,
    );

    expect(decrypted).toBe(plaintext);
  });

  it("should generate different IVs for separate encryptions", async () => {
    const { keyProvider, encryptionService } = createComponents();

    const key = await createEncryptionKey(keyProvider);
    const context = createContext();

    const first = await encryptionService.encrypt(
      "same plaintext",
      context,
      key.id,
    );

    const second = await encryptionService.encrypt(
      "same plaintext",
      context,
      key.id,
    );

    expect(first).not.toBe(second);
  });

  it("should reject decryption with a different security context", async () => {
    const { keyProvider, encryptionService } = createComponents();

    const key = await createEncryptionKey(keyProvider);

    const context = createContext();

    const encrypted = await encryptionService.encrypt(
      "context protected value",
      context,
      key.id,
    );

    const wrongContext: SecurityContext = {
      ...createContext(),
      applicationId: "different-application",
    };

    await expect(
      encryptionService.decrypt(
        encrypted,
        wrongContext,
        //   key.id,
      ),
    ).rejects.toBeInstanceOf(InvalidCiphertextError);
  });

  it("should reject tampered ciphertext", async () => {
    const { keyProvider, encryptionService } = createComponents();

    const key = await createEncryptionKey(keyProvider);
    const context = createContext();

    const encrypted = await encryptionService.encrypt(
      "tamper test",
      context,
      key.id,
    );

    const encryptedBuffer = Buffer.from(encrypted, "base64");

    encryptedBuffer[0] = encryptedBuffer[0] ^ 0xff;

    const tamperedCiphertext = encryptedBuffer.toString("base64");

    await expect(
      encryptionService.decrypt(
        tamperedCiphertext,
        context,
        //   key.id,
      ),
    ).rejects.toBeInstanceOf(InvalidCiphertextError);
  });

  it("should reject tampered authentication tag", async () => {
    const { keyProvider, encryptionService } = createComponents();

    const key = await createEncryptionKey(keyProvider);
    const context = createContext();

    const encrypted = await encryptionService.encrypt(
      "authentication tag test",
      context,
      key.id,
    );

    const encryptedBuffer = Buffer.from(encrypted, "base64");

    encryptedBuffer[encryptedBuffer.length - 1] =
      encryptedBuffer[encryptedBuffer.length - 1] ^ 0xff;

    const tamperedEncryptedValue = encryptedBuffer.toString("base64");

    await expect(
      encryptionService.decrypt(
        tamperedEncryptedValue,
        context,
        //   key.id,
      ),
    ).rejects.toBeInstanceOf(InvalidCiphertextError);
  });

  it("should decrypt data encrypted with an older key version", async () => {
    const { keyProvider, encryptionService } = createComponents();

    const key = await createEncryptionKey(keyProvider);

    const plaintext = "historical key version test";
    const context = createContext();

    const encrypted = await encryptionService.encrypt(
      plaintext,
      context,
      key.id,
    );

    await keyProvider.rotateKey(key.id);

    const decrypted = await encryptionService.decrypt(
      encrypted,
      context,
      //   key.id,
    );

    expect(decrypted).toBe(plaintext);
  });

  it("should preserve Unicode plaintext", async () => {
    const { keyProvider, encryptionService } = createComponents();

    const key = await createEncryptionKey(keyProvider);

    const plaintext = "TraceMind सुरक्षित 🔐";
    const context = createContext();

    const encrypted = await encryptionService.encrypt(
      plaintext,
      context,
      key.id,
    );

    const decrypted = await encryptionService.decrypt(
      encrypted,
      context,
      // key.id,
    );

    expect(decrypted).toBe(plaintext);
  });
});
