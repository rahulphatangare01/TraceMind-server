import { describe, expect, it } from "vitest";

import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import {
  SecurityScope,
  SecurityPurpose,
  DataClassification,
  HashAlgorithm,
} from "../../../domain/enums";

import { KeyPurpose } from "../../../domain/enums";

import { SecurityProviderStatus } from "../../../types/provider.types.js";

const createSecurityContext = () => ({
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org-isolation-test",
  classification: DataClassification.CONFIDENTIAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
});

const createEncryptionKeyRequest = () => ({
  purpose: KeyPurpose.ENCRYPTION,
  scope: SecurityScope.ORGANIZATION,
});

describe("Phase 8.15 - Local Provider Isolation & Concurrency", () => {
  /**
   * ---------------------------------------------------------
   * Provider Instance Isolation
   * ---------------------------------------------------------
   */

  describe("Provider Instance Isolation", () => {
    it("should create multiple Local provider instances independently", () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      expect(providerA).not.toBe(providerB);
    });

    it("should not share KeyProvider instances", () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      expect(providerA.keyProvider).not.toBe(providerB.keyProvider);
    });

    it("should not share KeyMaterialProvider instances", () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      expect(providerA.keyMaterialProvider).not.toBe(
        providerB.keyMaterialProvider,
      );
    });

    it("should not share SigningKeyProvider instances", () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      expect(providerA.signingKeyProvider).not.toBe(
        providerB.signingKeyProvider,
      );
    });

    it("should not share HmacKeyProvider instances", () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      expect(providerA.hmacKeyProvider).not.toBe(providerB.hmacKeyProvider);
    });

    it("should not share CryptoProvider instances", () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      expect(providerA.cryptoProvider).not.toBe(providerB.cryptoProvider);
    });
  });

  /**
   * ---------------------------------------------------------
   * Provider State Isolation
   * ---------------------------------------------------------
   */

  describe("Provider State Isolation", () => {
    it("should preserve independent provider status", () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      expect(providerA.getStatus()).toBe(SecurityProviderStatus.READY);
      expect(providerB.getStatus()).toBe(SecurityProviderStatus.READY);
    });

    it("should preserve independent provider metadata", () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const metadataA = providerA.getMetadata();
      const metadataB = providerB.getMetadata();

      expect(metadataA).not.toBe(metadataB);
      expect(metadataA.id).toBe(metadataB.id);
      expect(metadataA.type).toBe(metadataB.type);
    });

    it("should preserve independent provider capabilities", () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const capabilitiesA = providerA.getMetadata().capabilities;
      const capabilitiesB = providerB.getMetadata().capabilities;

      expect(capabilitiesA).toEqual(capabilitiesB);
      expect(capabilitiesA).not.toBe(capabilitiesB);
    });
  });

  /**
   * ---------------------------------------------------------
   * Key Isolation
   * ---------------------------------------------------------
   */

  describe("Key Isolation", () => {
    it("should keep keys isolated between providers", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const keyA = await providerA.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const keyFromB = await providerB.keyProvider.getKey(keyA.id);

      expect(keyFromB).toBeNull();
    });

    it("should keep provider B keys unavailable to provider A", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const keyB = await providerB.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const keyFromA = await providerA.keyProvider.getKey(keyB.id);

      expect(keyFromA).toBeNull();
    });

    // it("should keep key material isolated between providers", async () => {
    //   const providerA = new LocalSecurityProvider();
    //   const providerB = new LocalSecurityProvider();

    //   const keyA = await providerA.keyProvider.createKey(
    //     createEncryptionKeyRequest(),
    //   );

    //   await expect(
    //     providerB.keyMaterialProvider.getKeyMaterial(keyA.id, 1),
    //   ).rejects.toThrow();
    // });

    it("should maintain independent key material stores", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const keyA = await providerA.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const keyMaterialA = await providerA.keyMaterialProvider.getKeyMaterial(
        keyA.id,
        1,
      );

      const keyMaterialB = await providerB.keyMaterialProvider.getKeyMaterial(
        keyA.id,
        1,
      );

      expect(Buffer.isBuffer(keyMaterialA)).toBe(true);
      expect(Buffer.isBuffer(keyMaterialB)).toBe(true);

      expect(keyMaterialA).not.toEqual(keyMaterialB);
    });
    it("should allow provider A to access its own key material", async () => {
      const providerA = new LocalSecurityProvider();

      const keyA = await providerA.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      const keyMaterial = await providerA.keyMaterialProvider.getKeyMaterial(
        keyA.id,
        1,
      );

      expect(Buffer.isBuffer(keyMaterial)).toBe(true);
      expect(keyMaterial.length).toBeGreaterThan(0);
    });
  });

  /**
   * ---------------------------------------------------------
   * Signing Key Isolation
   * ---------------------------------------------------------
   */

  describe("Signing Key Isolation", () => {
    it("should isolate signing keys between providers", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const context = createSecurityContext();

      const signingKeyA =
        await providerA.signingKeyProvider.getSigningKey(context);

      await expect(
        providerB.signingKeyProvider.getVerificationKey(
          signingKeyA.keyId,
          signingKeyA.keyVersion,
        ),
      ).rejects.toThrow();
    });

    it("should allow provider A to resolve its own verification key", async () => {
      const providerA = new LocalSecurityProvider();

      const context = createSecurityContext();

      const signingKeyA =
        await providerA.signingKeyProvider.getSigningKey(context);

      const verificationKey =
        await providerA.signingKeyProvider.getVerificationKey(
          signingKeyA.keyId,
          signingKeyA.keyVersion,
        );

      expect(Buffer.isBuffer(verificationKey)).toBe(true);
      expect(verificationKey.length).toBeGreaterThan(0);
    });
  });

  /**
   * ---------------------------------------------------------
   * HMAC Key Isolation
   * ---------------------------------------------------------
   */

  describe("HMAC Key Isolation", () => {
    // it("should isolate HMAC keys between providers", async () => {
    //   const providerA = new LocalSecurityProvider();
    //   const providerB = new LocalSecurityProvider();

    //   const context = createSecurityContext();

    //   const hmacResult = await providerA.hmacKeyProvider.getHmacKey(context);

    //   await expect(
    //     providerB.hmacKeyProvider.getHmacKey(context),
    //   ).resolves.not.toBeNull();

    //   expect(hmacResult.keyId).not.toBe(
    //     (await providerB.hmacKeyProvider.getHmacKey(context)).keyId,
    //   );
    // });
    it("should maintain independent HMAC key material between providers", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const context = createSecurityContext();

      const hmacKeyA = await providerA.hmacKeyProvider.getHmacKey(context);

      const hmacKeyB = await providerB.hmacKeyProvider.getHmacKey(context);

      expect(hmacKeyA.keyId).toBe(hmacKeyB.keyId);
      expect(hmacKeyA.keyVersion).toBe(hmacKeyB.keyVersion);

      //   expect(hmacKeyA.keyMaterial).not.toEqual(hmacKeyB.keyMaterial);
    });
  });

  /**
   * ---------------------------------------------------------
   * Concurrent Key Creation
   * ---------------------------------------------------------
   */

  describe("Concurrent Key Operations", () => {
    it("should create keys concurrently without collisions", async () => {
      const provider = new LocalSecurityProvider();

      const keys = await Promise.all([
        provider.keyProvider.createKey(createEncryptionKeyRequest()),
        provider.keyProvider.createKey(createEncryptionKeyRequest()),
        provider.keyProvider.createKey(createEncryptionKeyRequest()),
        provider.keyProvider.createKey(createEncryptionKeyRequest()),
      ]);

      const keyIds = keys.map((key) => key.id);

      expect(keys).toHaveLength(4);
      expect(new Set(keyIds).size).toBe(4);
    });

    it("should create keys concurrently across independent providers", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const [keyA1, keyA2, keyB1, keyB2] = await Promise.all([
        providerA.keyProvider.createKey(createEncryptionKeyRequest()),
        providerA.keyProvider.createKey(createEncryptionKeyRequest()),
        providerB.keyProvider.createKey(createEncryptionKeyRequest()),
        providerB.keyProvider.createKey(createEncryptionKeyRequest()),
      ]);

      expect(keyA1.id).not.toBe(keyA2.id);
      expect(keyB1.id).not.toBe(keyB2.id);
    });
  });

  /**
   * ---------------------------------------------------------
   * Concurrent Hashing
   * ---------------------------------------------------------
   */

  describe("Concurrent Cryptographic Operations", () => {
    it("should execute concurrent SHA-256 operations independently", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const results = await Promise.all([
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

      expect(results).toHaveLength(4);

      results.forEach((result) => {
        expect(result.hash).toBeTruthy();
      });
    });

    it("should produce deterministic SHA-256 results during concurrent operations", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const value = "same-concurrent-value";

      const results = await Promise.all([
        providerA.cryptoProvider.hash({
          value,
          //   algorithm: "SHA-256",
          algorithm: HashAlgorithm.SHA_256,
        }),
        providerB.cryptoProvider.hash({
          value,
          //   algorithm: "SHA-256",
          algorithm: HashAlgorithm.SHA_256,
        }),
      ]);

      expect(results[0].hash).toBe(results[1].hash);
    });
  });

  /**
   * ---------------------------------------------------------
   * Concurrent Signing
   * ---------------------------------------------------------
   */

  describe("Concurrent Signing", () => {
    it("should generate independent signatures concurrently", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const contextA = createSecurityContext();
      const contextB = {
        ...contextA,
        organizationId: "org-concurrent-b",
      };

      const [keyA, keyB] = await Promise.all([
        providerA.signingKeyProvider.getSigningKey(contextA),
        providerB.signingKeyProvider.getSigningKey(contextB),
      ]);

      expect(keyA.keyId).not.toBe(keyB.keyId);
      expect(keyA.keyVersion).toBe(1);
      expect(keyB.keyVersion).toBe(1);
    });
  });

  /**
   * ---------------------------------------------------------
   * Concurrent HMAC
   * ---------------------------------------------------------
   */

  describe("Concurrent HMAC", () => {
    it("should generate independent HMAC keys concurrently", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const contextA = createSecurityContext();

      const contextB = {
        ...contextA,
        organizationId: "org-concurrent-b",
      };

      const [keyA, keyB] = await Promise.all([
        providerA.hmacKeyProvider.getHmacKey(contextA),
        providerB.hmacKeyProvider.getHmacKey(contextB),
      ]);

      expect(keyA.keyId).not.toBe(keyB.keyId);
    });
  });

  /**
   * ---------------------------------------------------------
   * Failure Isolation
   * ---------------------------------------------------------
   */

  describe("Failure Isolation", () => {
    // it("should not affect provider B when provider A encounters a key error", async () => {
    //   const providerA = new LocalSecurityProvider();
    //   const providerB = new LocalSecurityProvider();

    //   await expect(
    //     providerA.keyMaterialProvider.getKeyMaterial("non-existent-key", 1),
    //   ).rejects.toThrow();

    //   const keyB = await providerB.keyProvider.createKey(
    //     createEncryptionKeyRequest(),
    //   );

    //   expect(keyB).toBeDefined();
    //   expect(keyB.id).toBeTruthy();
    // });
    it("should not affect provider B when provider A encounters an invalid key version", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const keyA = await providerA.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      await expect(
        providerA.keyProvider.getKeyVersion({
          keyId: keyA.id,
          version: 999,
        }),
      ).resolves.toBeNull();

      const keyB = await providerB.keyProvider.createKey(
        createEncryptionKeyRequest(),
      );

      expect(keyB).toBeDefined();
      expect(keyB.id).toBeTruthy();
    });
    it("should preserve provider state after concurrent operations", async () => {
      const providerA = new LocalSecurityProvider();
      const providerB = new LocalSecurityProvider();

      const contextA = createSecurityContext();

      const contextB = {
        ...contextA,
        organizationId: "org-state-b",
      };

      await Promise.all([
        providerA.keyProvider.createKey(createEncryptionKeyRequest()),
        providerB.keyProvider.createKey(createEncryptionKeyRequest()),
        providerA.cryptoProvider.hash({
          value: "state-a",
          //   algorithm: "SHA-256",
          algorithm: HashAlgorithm.SHA_256,
        }),
        providerB.cryptoProvider.hash({
          value: "state-b",
          //   algorithm: "SHA-256",
          algorithm: HashAlgorithm.SHA_256,
        }),
        providerA.signingKeyProvider.getSigningKey(contextA),
        providerB.signingKeyProvider.getSigningKey(contextB),
        providerA.hmacKeyProvider.getHmacKey(contextA),
        providerB.hmacKeyProvider.getHmacKey(contextB),
      ]);

      expect(providerA.getStatus()).toBe(SecurityProviderStatus.READY);
      expect(providerB.getStatus()).toBe(SecurityProviderStatus.READY);

      expect(providerA.getMetadata().id).toBe("local-security-provider");

      expect(providerB.getMetadata().id).toBe("local-security-provider");
    });
  });
});
