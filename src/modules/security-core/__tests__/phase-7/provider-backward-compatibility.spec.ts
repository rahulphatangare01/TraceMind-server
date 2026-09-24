import { beforeEach, describe, expect, it } from "vitest";

// import {
//   EncryptionAlgorithm,
//   CryptoEncoding,
// } from "../../types/";

import {
  EncryptionAlgorithm,
  CryptoEncoding,
  SecurityScope,
  DataClassification,
  SecurityPurpose,
  KeyPurpose,
} from "../../domain/enums/index";
import { HashAlgorithm } from "../../domain/enums";

import { SignatureAlgorithm } from "../../domain/enums";

import { HmacAlgorithm } from "../../domain/enums";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/provider.types.js";

import type { SecurityContext } from "../../domain/models";

import type { SecurityProvider } from "../../types/provider.types.js";

import { ProviderRegistryService } from "../../application/services/provider-registry.service";
import { ProviderResolverService } from "../../application/services/provider-resolver.service";

import { securityCore } from "../../security-core.container.js";

/**
 * ============================================================================
 * Phase 7.14
 * Provider Backward Compatibility Tests
 * ============================================================================
 *
 * Purpose:
 *
 * Verify that introducing the Phase 7 Provider Architecture does not break
 * previously implemented Security Core functionality.
 *
 * Compatibility areas:
 *
 * - Existing Security Core container
 * - Key management
 * - Encryption
 * - Hashing
 * - Signing
 * - HMAC
 * - Security context
 * - Security boundary validation
 * - Provider registry
 * - Provider resolver
 *
 * Principle:
 *
 * Phase 7 is additive and must not break Phase 2-6 behavior.
 * ============================================================================
 */

// ============================================================================
// Test Helpers
// ============================================================================

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

// const createSecurityContext = (): SecurityContext => ({
//   scope: "ORGANIZATION",
//   organizationId: "org-regression-test",
//   classification: "CONFIDENTIAL",
//   purpose: "ENCRYPTED_CONFIGURATION",
// });
const createSecurityContext = (): SecurityContext => ({
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org-regression-test",
  classification: DataClassification.CONFIDENTIAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
});
// ============================================================================
// Test Suite
// ============================================================================

describe("Phase 7.14 - Provider Backward Compatibility", () => {
  let context: SecurityContext;

  beforeEach(() => {
    context = createSecurityContext();
  });

  // ========================================================================
  // 1. Existing Security Core Container
  // ========================================================================

  it("should preserve the existing Security Core container", () => {
    expect(securityCore).toBeDefined();

    expect(securityCore.keyProvider).toBeDefined();

    expect(securityCore.keyMaterialProvider).toBeDefined();

    expect(securityCore.cryptoProvider).toBeDefined();

    expect(securityCore.encryptionService).toBeDefined();

    expect(securityCore.securityContextValidator).toBeDefined();

    expect(securityCore.securityBoundaryValidator).toBeDefined();
  });

  // ========================================================================
  // 2. Provider Architecture Must Not Replace Existing Contracts
  // ========================================================================

  it("should keep existing operation providers available", () => {
    expect(securityCore.keyProvider).toBeDefined();

    expect(securityCore.keyMaterialProvider).toBeDefined();

    expect(securityCore.cryptoProvider).toBeDefined();
  });

  // ========================================================================
  // 3. Key Provider Compatibility
  // ========================================================================

  it("should preserve KeyProvider compatibility", async () => {
    const key = await securityCore.keyProvider.createKey({
      purpose: KeyPurpose.ENCRYPTION,
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-regression-test",
    });

    expect(key).toBeDefined();
    expect(key.id).toBeDefined();

    expect(key.purpose).toBe("ENCRYPTION");

    expect(key.scope).toBe("ORGANIZATION");
  });

  // ========================================================================
  // 4. Key Version Compatibility
  // ========================================================================

  it("should preserve key version resolution", async () => {
    const key = await securityCore.keyProvider.createKey({
      purpose: KeyPurpose.ENCRYPTION,
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-regression-test",
    });

    const activeVersion = await securityCore.keyProvider.getActiveVersion(
      key.id,
    );

    expect(activeVersion).not.toBeNull();

    expect(activeVersion?.keyId).toBe(key.id);
  });

  // ========================================================================
  // 5. Encryption Compatibility
  // ========================================================================

  it("should preserve encryption functionality", async () => {
    const plaintext = "TraceMind backward compatibility test";
    const key = await securityCore.keyProvider.createKey({
      purpose: KeyPurpose.ENCRYPTION,
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-regression-test",
    });
    // const result = await securityCore.encryptionService.encrypt({
    //   plaintext,
    //   algorithm: EncryptionAlgorithm.AES_256_GCM,
    //   context,
    //   encoding: CryptoEncoding.BASE64,
    //   keyVersion: 1,
    // });
    const result = await securityCore.encryptionService.encrypt(
      plaintext,
      context,
      key.id,
    );

    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toBeDefined();

    // expect(result.ciphertext).toBeDefined();

    // expect(result.iv).toBeDefined();

    // expect(result.authTag).toBeDefined();

    // expect(result.keyId).toBeDefined();

    // expect(result.keyVersion).toBe(1);
  });

  // ========================================================================
  // 6. Encryption / Decryption Round Trip
  // ========================================================================

  it("should preserve encryption/decryption round trip", async () => {
    const plaintext = "Backward compatibility plaintext";
    const key = await securityCore.keyProvider.createKey({
      purpose: KeyPurpose.ENCRYPTION,
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-regression-test",
    });
    // const encrypted = await securityCore.encryptionService.encrypt({
    //   plaintext,
    //   algorithm: EncryptionAlgorithm.AES_256_GCM,
    //   context,
    //   encoding: CryptoEncoding.BASE64,
    //   keyVersion: 1,
    // });
    const encrypted = await securityCore.encryptionService.encrypt(
      plaintext,
      context,
      key.id,
      // keyId
    );
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
    const decrypted = await securityCore.encryptionService.decrypt(
      encrypted,
      context,
    );
    // expect(decrypted.plaintext).toBe(plaintext);
    expect(decrypted).toBe(plaintext);
  });

  // ========================================================================
  // 7. Hashing Compatibility
  // ========================================================================

  it("should preserve SHA-256 hashing", async () => {
    const result = await securityCore.cryptoProvider.hash({
      value: "TraceMind regression test",
      algorithm: HashAlgorithm.SHA_256,
    });

    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();

    expect(result.algorithm).toBe(HashAlgorithm.SHA_256);
  });

  // ========================================================================
  // 8. Hash Verification Compatibility
  // ========================================================================

  it("should preserve SHA-256 verification", async () => {
    const value = "TraceMind regression verification";

    const hash = await securityCore.cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
    });

    const verification = await securityCore.cryptoProvider.verifyHash({
      value,
      hash: hash.hash,
      algorithm: HashAlgorithm.SHA_256,
    });

    expect(verification.valid).toBe(true);
  });

  // ========================================================================
  // 9. Argon2id Compatibility
  // ========================================================================

  it("should preserve Argon2id hashing", async () => {
    const result = await securityCore.cryptoProvider.hash({
      value: "TraceMind password compatibility test",
      algorithm: HashAlgorithm.ARGON2ID,
    });

    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();

    expect(result.algorithm).toBe(HashAlgorithm.ARGON2ID);
  });

  // ========================================================================
  // 10. Signing Compatibility
  // ========================================================================

  it("should preserve Ed25519 signing", async () => {
    const result = await securityCore.cryptoProvider.sign({
      payload: "TraceMind signing regression test",
      algorithm: SignatureAlgorithm.ED25519,
      context,
    });

    expect(result).toBeDefined();

    expect(result.signature).toBeDefined();

    expect(result.keyId).toBeDefined();

    expect(result.keyVersion).toBeDefined();

    expect(result.algorithm).toBe(SignatureAlgorithm.ED25519);
  });

  // ========================================================================
  // 11. Signature Verification Compatibility
  // ========================================================================

  it("should preserve Ed25519 signature verification", async () => {
    const payload = "TraceMind signature verification";

    const signature = await securityCore.cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
    });

    const verification = await securityCore.cryptoProvider.verifySignature({
      payload,
      signature: signature.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signature.keyId,
      keyVersion: signature.keyVersion,
      context,
    });

    expect(verification.valid).toBe(true);
  });

  // ========================================================================
  // 12. HMAC Compatibility
  // ========================================================================

  it("should preserve HMAC generation", async () => {
    const result = await securityCore.cryptoProvider.createHmac({
      payload: "TraceMind HMAC regression test",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    expect(result).toBeDefined();

    expect(result.signature).toBeDefined();

    expect(result.keyId).toBeDefined();

    expect(result.keyVersion).toBeDefined();

    expect(result.algorithm).toBe(HmacAlgorithm.HMAC_SHA_256);
  });

  // ========================================================================
  // 13. HMAC Verification Compatibility
  // ========================================================================

  it("should preserve HMAC verification", async () => {
    const payload = "TraceMind HMAC verification";

    const hmac = await securityCore.cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    const verification = await securityCore.cryptoProvider.verifyHmac({
      payload,
      signature: hmac.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: hmac.keyId,
      keyVersion: hmac.keyVersion,
      context,
    });

    expect(verification.valid).toBe(true);
  });

  // ========================================================================
  // 14. Security Context Compatibility
  // ========================================================================

  it("should preserve SecurityContext validation", () => {
    const result = securityCore.securityContextValidator.validate(context);

    expect(result).toBeDefined();
  });

  // ========================================================================
  // 15. Security Boundary Compatibility
  // ========================================================================

  it("should preserve SecurityBoundary validation", () => {
    const result = securityCore.securityBoundaryValidator.validate(context);

    expect(result.valid).toBe(true);
  });

  // ========================================================================
  // 16. Provider Registry Compatibility
  // ========================================================================

  it("should allow provider registration without replacing existing services", () => {
    const registry = new ProviderRegistryService();

    const provider = createProvider("regression-provider");

    registry.register(provider);

    expect(registry.has("regression-provider")).toBe(true);

    expect(securityCore.encryptionService).toBeDefined();

    expect(securityCore.cryptoProvider).toBeDefined();
  });

  // ========================================================================
  // 17. Provider Resolver Compatibility
  // ========================================================================

  it("should resolve a provider without affecting existing Security Core services", () => {
    const registry = new ProviderRegistryService();

    const resolver = new ProviderResolverService(registry);

    const provider = createProvider("resolver-regression-provider");

    registry.register(provider);

    expect(resolver.resolve("resolver-regression-provider")).toBe(provider);

    expect(securityCore.cryptoProvider).toBeDefined();

    expect(securityCore.encryptionService).toBeDefined();
  });

  // ========================================================================
  // 18. Provider Switching Must Not Break Encryption
  // ========================================================================

  it("should preserve encryption after provider registry switching", async () => {
    const registry = new ProviderRegistryService();

    const resolver = new ProviderResolverService(registry);

    const providerA = createProvider("provider-a");

    const providerB = createProvider("provider-b");

    registry.register(providerA);
    registry.register(providerB);

    resolver.resolve("provider-a");
    resolver.resolve("provider-b");
    resolver.resolve("provider-a");

    const plaintext = "Encryption after provider switching";
    const key = await securityCore.keyProvider.createKey({
      purpose: KeyPurpose.ENCRYPTION,
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-regression-test",
    });
    const encrypted = await securityCore.encryptionService.encrypt(
      plaintext,
      context,
      key.id,
    );

    // expect(result).toBeDefined();
    // expect(typeof result).toBe("string");
    // expect(result).toBeDefined();

    // const encrypted = await securityCore.encryptionService.encrypt({
    //   plaintext,
    //   algorithm: EncryptionAlgorithm.AES_256_GCM,
    //   context,
    //   encoding: CryptoEncoding.BASE64,
    //   keyVersion: 1,
    // });

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
    const decrypted = await securityCore.encryptionService.decrypt(
      encrypted,
      context,
    );
    // expect(decrypted.plaintext).toBe(plaintext);
    expect(decrypted).toBe(plaintext);
  });
  // expect(decrypted.plaintext).toBe(plaintext);
});
