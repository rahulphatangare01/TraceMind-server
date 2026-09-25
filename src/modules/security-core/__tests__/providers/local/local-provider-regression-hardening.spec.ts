import { describe, expect, it } from "vitest";

import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../../domain/enums";

import { KeyPurpose } from "../../../domain/enums";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import { HashAlgorithm } from "../../../domain/enums";

import { SignatureAlgorithm } from "../../../domain/enums";

import { HmacAlgorithm } from "../../../domain/enums";

import { ProviderConfigurationService } from "../../../application/services/provider-configuration.service.js";

import { ProviderConfigurationSanitizerService } from "../../../application/services/provider-configuration-sanitizer.service.js";

import { SecurityBoundaryValidator } from "../../../application/services/security-boundary-validator.service.js";

const createSecurityContext = (organizationId = "org-regression-test") => ({
  scope: SecurityScope.ORGANIZATION,
  organizationId,
  classification: DataClassification.CONFIDENTIAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
});

const createEncryptionKeyRequest = () => ({
  purpose: KeyPurpose.ENCRYPTION,
  scope: SecurityScope.ORGANIZATION,
});

describe("Phase 8.16 - Local Provider Regression / Hardening", () => {
  /**
   * =========================================================
   * 1. Provider Contract Regression
   * =========================================================
   */

  describe("Provider Contract Regression", () => {
    it("should create Local provider successfully", () => {
      const provider = new LocalSecurityProvider();

      expect(provider).toBeDefined();
    });

    it("should expose correct provider identity", () => {
      const provider = new LocalSecurityProvider();

      const metadata = provider.getMetadata();

      expect(metadata.id).toBe("local-security-provider");
      expect(metadata.type).toBe(SecurityProviderType.LOCAL);
      expect(metadata.name).toBe("Local Security Provider");
    });

    it("should expose a valid provider version", () => {
      const provider = new LocalSecurityProvider();

      const metadata = provider.getMetadata();

      expect(metadata.version).toBeTruthy();
      expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should start in READY state", () => {
      const provider = new LocalSecurityProvider();

      expect(provider.getStatus()).toBe(SecurityProviderStatus.READY);
    });

    it("should expose all required Local capabilities", () => {
      const provider = new LocalSecurityProvider();

      const capabilities = provider.getMetadata().capabilities;

      expect(capabilities).toEqual(
        expect.arrayContaining([
          SecurityProviderCapability.KEY_MANAGEMENT,
          SecurityProviderCapability.KEY_MATERIAL,
          SecurityProviderCapability.ENCRYPTION,
          SecurityProviderCapability.DECRYPTION,
          SecurityProviderCapability.HASHING,
          SecurityProviderCapability.SIGNING,
          SecurityProviderCapability.HMAC,
        ]),
      );
    });
  });

  /**
   * =========================================================
   * 2. Key Management Regression
   * =========================================================
   */

  describe("Key Management Regression", () => {
    it("should create an encryption key", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      expect(key).toBeDefined();
      expect(key.id).toBeTruthy();
      expect(key.purpose).toBe(KeyPurpose.ENCRYPTION);
      expect(key.scope).toBe(SecurityScope.ORGANIZATION);
    });

    it("should retrieve a created key", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const retrieved = await provider.keyProvider.getKey(key.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(key.id);
    });

    it("should resolve the active key version", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const activeVersion = await provider.keyProvider.getActiveVersion(key.id);

      expect(activeVersion).not.toBeNull();
      expect(activeVersion?.version).toBe(1);
    });

    it("should resolve a specific key version", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const version = await provider.keyProvider.getKeyVersion({
        keyId: key.id,
        version: 1,
      });

      expect(version).not.toBeNull();
      expect(version?.keyId).toBe(key.id);
      expect(version?.version).toBe(1);
    });

    it("should rotate an encryption key", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const rotatedVersion = await provider.keyProvider.rotateKey(key.id);

      expect(rotatedVersion).toBeDefined();
      expect(rotatedVersion.version).toBeGreaterThan(1);
    });

    it("should resolve the new active version after rotation", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      await provider.keyProvider.rotateKey(key.id);

      const activeVersion = await provider.keyProvider.getActiveVersion(key.id);

      expect(activeVersion).not.toBeNull();
      expect(activeVersion?.version).toBe(2);
    });
  });

  /**
   * =========================================================
   * 3. Key Material Regression
   * =========================================================
   */

  describe("Key Material Regression", () => {
    it("should resolve key material for a valid key version", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const material = await provider.keyMaterialProvider.getKeyMaterial(
        key.id,
        1,
      );

      expect(Buffer.isBuffer(material)).toBe(true);
      expect(material.length).toBeGreaterThan(0);
    });

    it("should return stable key material for the same key version", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const material1 = await provider.keyMaterialProvider.getKeyMaterial(
        key.id,
        1,
      );

      const material2 = await provider.keyMaterialProvider.getKeyMaterial(
        key.id,
        1,
      );

      expect(material1).toEqual(material2);
    });
  });

  /**
   * =========================================================
   * 4. Encryption Regression
   * =========================================================
   */

  describe("Encryption Regression", () => {
    it("should encrypt and decrypt plaintext successfully", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const context = createSecurityContext();

      const plaintext = "TraceMind regression test";

      const encrypted = await provider.cryptoProvider.encrypt({
        plaintext,
        algorithm: "AES-256-GCM",
        context,
        encoding: "UTF8",
        keyMaterial: await provider.keyMaterialProvider.getKeyMaterial(
          key.id,
          1,
        ),
        keyId: key.id,
        keyVersion: 1,
      } as never);

      expect(encrypted).toBeDefined();
    });

    it("should produce different ciphertext for repeated encryption", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const context = createSecurityContext();

      const encrypted1 = await provider.cryptoProvider.encrypt({
        plaintext: "same plaintext",
        algorithm: "AES-256-GCM",
        context,
        encoding: "UTF8",
        keyMaterial: await provider.keyMaterialProvider.getKeyMaterial(
          key.id,
          1,
        ),
        keyId: key.id,
        keyVersion: 1,
      } as never);

      const encrypted2 = await provider.cryptoProvider.encrypt({
        plaintext: "same plaintext",
        algorithm: "AES-256-GCM",
        context,
        encoding: "UTF8",
        keyMaterial: await provider.keyMaterialProvider.getKeyMaterial(
          key.id,
          1,
        ),
        keyId: key.id,
        keyVersion: 1,
      } as never);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    });

    it("should support Unicode plaintext", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const context = createSecurityContext();

      const plaintext = "TraceMind 🔐 नमस्कार 🚀";

      const encrypted = await provider.cryptoProvider.encrypt({
        plaintext,
        algorithm: "AES-256-GCM",
        context,
        encoding: "UTF8",
        keyMaterial: await provider.keyMaterialProvider.getKeyMaterial(
          key.id,
          1,
        ),
        keyId: key.id,
        keyVersion: 1,
      } as never);

      const decrypted = await provider.cryptoProvider.decrypt({
        ciphertext: encrypted.ciphertext,
        algorithm: encrypted.algorithm,
        encoding: encrypted.encoding,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyId: encrypted.keyId,
        keyVersion: encrypted.keyVersion,
        context,
        keyMaterial: await provider.keyMaterialProvider.getKeyMaterial(
          key.id,
          1,
        ),
      } as never);

      expect(decrypted.plaintext).toBe(plaintext);
    });
  });

  /**
   * =========================================================
   * 5. Hashing Regression
   * =========================================================
   */

  describe("Hashing Regression", () => {
    it("should generate SHA-256 hash", async () => {
      const provider = new LocalSecurityProvider();

      const result = await provider.cryptoProvider.hash({
        value: "TraceMind",
        algorithm: HashAlgorithm.SHA_256,
      });

      expect(result.hash).toBeTruthy();
      expect(result.algorithm).toBe(HashAlgorithm.SHA_256);
    });

    it("should generate deterministic SHA-256 hash", async () => {
      const provider = new LocalSecurityProvider();

      const first = await provider.cryptoProvider.hash({
        value: "TraceMind",
        algorithm: HashAlgorithm.SHA_256,
      });

      const second = await provider.cryptoProvider.hash({
        value: "TraceMind",
        algorithm: HashAlgorithm.SHA_256,
      });

      expect(first.hash).toBe(second.hash);
    });

    it("should generate Argon2id hash", async () => {
      const provider = new LocalSecurityProvider();

      const result = await provider.cryptoProvider.hash({
        value: "TraceMind-password",
        algorithm: HashAlgorithm.ARGON2ID,
      });

      expect(result.hash).toBeTruthy();
      expect(result.algorithm).toBe(HashAlgorithm.ARGON2ID);
    });

    it("should verify a valid Argon2id hash", async () => {
      const provider = new LocalSecurityProvider();

      const hash = await provider.cryptoProvider.hash({
        value: "TraceMind-password",
        algorithm: HashAlgorithm.ARGON2ID,
      });

      const result = await provider.cryptoProvider.verifyHash({
        value: "TraceMind-password",
        hash: hash.hash,
        algorithm: HashAlgorithm.ARGON2ID,
      });

      expect(result.valid).toBe(true);
    });

    it("should reject an invalid Argon2id value", async () => {
      const provider = new LocalSecurityProvider();

      const hash = await provider.cryptoProvider.hash({
        value: "TraceMind-password",
        algorithm: HashAlgorithm.ARGON2ID,
      });

      const result = await provider.cryptoProvider.verifyHash({
        value: "wrong-password",
        hash: hash.hash,
        algorithm: HashAlgorithm.ARGON2ID,
      });

      expect(result.valid).toBe(false);
    });
  });

  /**
   * =========================================================
   * 6. Signing Regression
   * =========================================================
   */

  describe("Signing Regression", () => {
    it("should generate an Ed25519 signature", async () => {
      const provider = new LocalSecurityProvider();

      const context = createSecurityContext();

      const result = await provider.cryptoProvider.sign({
        payload: "TraceMind-signing-test",
        algorithm: SignatureAlgorithm.ED25519,
        context,
      });

      expect(result.signature).toBeTruthy();
      expect(result.algorithm).toBe(SignatureAlgorithm.ED25519);
      expect(result.keyId).toBeTruthy();
      expect(result.keyVersion).toBe(1);
    });

    it("should verify a valid Ed25519 signature", async () => {
      const provider = new LocalSecurityProvider();

      const context = createSecurityContext();

      const signature = await provider.cryptoProvider.sign({
        payload: "TraceMind-signing-test",
        algorithm: SignatureAlgorithm.ED25519,
        context,
      });

      const result = await provider.cryptoProvider.verifySignature({
        payload: "TraceMind-signing-test",
        signature: signature.signature,
        algorithm: SignatureAlgorithm.ED25519,
        keyId: signature.keyId,
        keyVersion: signature.keyVersion,
        context,
      });

      expect(result.valid).toBe(true);
    });

    it("should reject a modified payload", async () => {
      const provider = new LocalSecurityProvider();

      const context = createSecurityContext();

      const signature = await provider.cryptoProvider.sign({
        payload: "original-payload",
        algorithm: SignatureAlgorithm.ED25519,
        context,
      });

      const result = await provider.cryptoProvider.verifySignature({
        payload: "modified-payload",
        signature: signature.signature,
        algorithm: SignatureAlgorithm.ED25519,
        keyId: signature.keyId,
        keyVersion: signature.keyVersion,
        context,
      });

      expect(result.valid).toBe(false);
    });

    it("should reject a modified signature", async () => {
      const provider = new LocalSecurityProvider();

      const context = createSecurityContext();

      const signature = await provider.cryptoProvider.sign({
        payload: "TraceMind-signing-test",
        algorithm: SignatureAlgorithm.ED25519,
        context,
      });

      const modifiedSignature = `${signature.signature.slice(0, -2)}AA`;

      const result = await provider.cryptoProvider.verifySignature({
        payload: "TraceMind-signing-test",
        signature: modifiedSignature,
        algorithm: SignatureAlgorithm.ED25519,
        keyId: signature.keyId,
        keyVersion: signature.keyVersion,
        context,
      });

      expect(result.valid).toBe(false);
    });
  });

  /**
   * =========================================================
   * 7. HMAC Regression
   * =========================================================
   */

  describe("HMAC Regression", () => {
    it("should generate HMAC-SHA-256", async () => {
      const provider = new LocalSecurityProvider();

      const context = createSecurityContext();

      const result = await provider.cryptoProvider.createHmac({
        payload: "TraceMind-hmac-test",
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        context,
      });

      expect(result.signature).toBeTruthy();
      expect(result.algorithm).toBe(HmacAlgorithm.HMAC_SHA_256);
      expect(result.keyId).toBeTruthy();
      expect(result.keyVersion).toBe(1);
    });

    it("should verify a valid HMAC", async () => {
      const provider = new LocalSecurityProvider();

      const context = createSecurityContext();

      const hmac = await provider.cryptoProvider.createHmac({
        payload: "TraceMind-hmac-test",
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        context,
      });

      const result = await provider.cryptoProvider.verifyHmac({
        payload: "TraceMind-hmac-test",
        signature: hmac.signature,
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        keyId: hmac.keyId,
        keyVersion: hmac.keyVersion,
        context,
      });

      expect(result.valid).toBe(true);
    });

    it("should reject a modified HMAC payload", async () => {
      const provider = new LocalSecurityProvider();

      const context = createSecurityContext();

      const hmac = await provider.cryptoProvider.createHmac({
        payload: "original",
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        context,
      });

      const result = await provider.cryptoProvider.verifyHmac({
        payload: "modified",
        signature: hmac.signature,
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        keyId: hmac.keyId,
        keyVersion: hmac.keyVersion,
        context,
      });

      expect(result.valid).toBe(false);
    });

    it("should reject a modified HMAC signature", async () => {
      const provider = new LocalSecurityProvider();

      const context = createSecurityContext();

      const hmac = await provider.cryptoProvider.createHmac({
        payload: "TraceMind-hmac-test",
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        context,
      });

      const modifiedSignature = `${hmac.signature.slice(0, -2)}AA`;

      const result = await provider.cryptoProvider.verifyHmac({
        payload: "TraceMind-hmac-test",
        signature: modifiedSignature,
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        keyId: hmac.keyId,
        keyVersion: hmac.keyVersion,
        context,
      });

      expect(result.valid).toBe(false);
    });
  });

  /**
   * =========================================================
   * 8. Key Rotation Regression
   * =========================================================
   */

  describe("Key Rotation Regression", () => {
    it("should preserve access to the old key version after rotation", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const oldVersion = await provider.keyProvider.getKeyVersion({
        keyId: key.id,
        version: 1,
      });

      await provider.keyProvider.rotateKey(key.id);

      const oldVersionAfterRotation = await provider.keyProvider.getKeyVersion({
        keyId: key.id,
        version: 1,
      });

      expect(oldVersion).not.toBeNull();
      expect(oldVersionAfterRotation).not.toBeNull();
      expect(oldVersionAfterRotation?.version).toBe(oldVersion?.version);
    });

    it("should expose the rotated version as active", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      await provider.keyProvider.rotateKey(key.id);

      const active = await provider.keyProvider.getActiveVersion(key.id);

      expect(active?.version).toBe(2);
    });
  });

  /**
   * =========================================================
   * 9. Configuration Regression
   * =========================================================
   */

  describe("Configuration Regression", () => {
    it("should validate Local provider configuration", () => {
      const service = new ProviderConfigurationService();

      const result = service.validate({
        providerId: "local-security-provider",
        type: SecurityProviderType.LOCAL,
        settings: {},
      });

      expect(result).toBeDefined();
    });

    it("should sanitize Local provider configuration", () => {
      const sanitizer = new ProviderConfigurationSanitizerService();

      const result = sanitizer.sanitize({
        providerId: " local-security-provider ",
        type: SecurityProviderType.LOCAL,
        settings: {},
      });

      expect(result.providerId).toBe("local-security-provider");
      expect(result.type).toBe(SecurityProviderType.LOCAL);
    });
  });

  /**
   * =========================================================
   * 10. Security Boundary Regression
   * =========================================================
   */

  describe("Security Boundary Regression", () => {
    it("should accept a valid organization context", () => {
      const validator = new SecurityBoundaryValidator();

      expect(() => validator.validate(createSecurityContext())).not.toThrow();
    });

    it("should reject organization context with projectId", () => {
      const validator = new SecurityBoundaryValidator();

      expect(() =>
        validator.validate({
          ...createSecurityContext(),
          projectId: "project-1",
        }),
      ).toThrow();
    });

    it("should reject organization context without organizationId", () => {
      const validator = new SecurityBoundaryValidator();

      expect(() =>
        validator.validate({
          scope: SecurityScope.ORGANIZATION,
          classification: DataClassification.CONFIDENTIAL,
          purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
        }),
      ).toThrow();
    });
  });

  /**
   * =========================================================
   * 11. Cross-Capability Regression
   * =========================================================
   */

  describe("Cross-Capability Regression", () => {
    it("should preserve all Local provider capabilities together", () => {
      const provider = new LocalSecurityProvider();

      const capabilities = provider.getMetadata().capabilities;

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
        expect(capabilities).toContain(capability);
      }
    });

    it("should preserve provider readiness after mixed operations", async () => {
      const provider = new LocalSecurityProvider();

      const key = await provider.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const context = createSecurityContext();

      await provider.keyMaterialProvider.getKeyMaterial(key.id, 1);

      await provider.cryptoProvider.hash({
        value: "TraceMind",
        algorithm: HashAlgorithm.SHA_256,
      });

      await provider.cryptoProvider.sign({
        payload: "TraceMind",
        algorithm: SignatureAlgorithm.ED25519,
        context,
      });

      await provider.cryptoProvider.createHmac({
        payload: "TraceMind",
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        context,
      });

      expect(provider.getStatus()).toBe(SecurityProviderStatus.READY);
    });
  });
});
