import { describe, expect, it } from "vitest";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/provider.types.js";

import { LocalSecurityProvider } from "../../providers/local/local-security.provider.js";

describe("Phase 8.1 - Local Provider Baseline Review", () => {
  // ==========================================================================
  // 1. Provider Construction
  // ==========================================================================

  it("should create the Local Security Provider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider).toBeDefined();
  });

  // ==========================================================================
  // 2. Provider Metadata
  // ==========================================================================

  it("should expose valid Local provider metadata", () => {
    const provider = new LocalSecurityProvider();

    const metadata = provider.getMetadata();

    expect(metadata).toBeDefined();

    expect(metadata.id).toBe("local-security-provider");

    expect(metadata.name).toBe("Local Security Provider");

    expect(metadata.type).toBe(SecurityProviderType.LOCAL);

    expect(metadata.version).toBe("1.0.0");
  });

  // ==========================================================================
  // 3. Provider Status
  // ==========================================================================

  it("should expose a valid provider status", () => {
    const provider = new LocalSecurityProvider();

    const status = provider.getStatus();

    expect(Object.values(SecurityProviderStatus)).toContain(status);
  });

  // ==========================================================================
  // 4. Provider Capabilities
  // ==========================================================================

  it("should expose all expected Local provider capabilities", () => {
    const provider = new LocalSecurityProvider();

    const capabilities = provider.getMetadata().capabilities;

    expect(capabilities).toContain(SecurityProviderCapability.KEY_MANAGEMENT);

    expect(capabilities).toContain(SecurityProviderCapability.KEY_MATERIAL);

    expect(capabilities).toContain(SecurityProviderCapability.ENCRYPTION);

    expect(capabilities).toContain(SecurityProviderCapability.DECRYPTION);

    expect(capabilities).toContain(SecurityProviderCapability.HASHING);

    expect(capabilities).toContain(SecurityProviderCapability.SIGNING);

    expect(capabilities).toContain(SecurityProviderCapability.HMAC);
  });

  // ==========================================================================
  // 5. Capability Uniqueness
  // ==========================================================================

  it("should not contain duplicate capabilities", () => {
    const provider = new LocalSecurityProvider();

    const capabilities = provider.getMetadata().capabilities;

    const uniqueCapabilities = new Set(capabilities);

    expect(uniqueCapabilities.size).toBe(capabilities.length);
  });

  // ==========================================================================
  // 6. Key Provider
  // ==========================================================================

  it("should expose the KeyProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.keyProvider).toBeDefined();

    expect(typeof provider.keyProvider.createKey).toBe("function");

    expect(typeof provider.keyProvider.getKey).toBe("function");

    expect(typeof provider.keyProvider.getKeyVersion).toBe("function");

    expect(typeof provider.keyProvider.getActiveVersion).toBe("function");

    expect(typeof provider.keyProvider.rotateKey).toBe("function");

    expect(typeof provider.keyProvider.changeKeyStatus).toBe("function");
  });

  // ==========================================================================
  // 7. Key Material Provider
  // ==========================================================================

  it("should expose the KeyMaterialProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.keyMaterialProvider).toBeDefined();

    expect(typeof provider.keyMaterialProvider.getKeyMaterial).toBe("function");
  });

  // ==========================================================================
  // 8. Signing Key Provider
  // ==========================================================================

  it("should expose the SigningKeyProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.signingKeyProvider).toBeDefined();

    expect(typeof provider.signingKeyProvider.getSigningKey).toBe("function");

    expect(typeof provider.signingKeyProvider.getVerificationKey).toBe(
      "function",
    );
  });

  // ==========================================================================
  // 9. HMAC Key Provider
  // ==========================================================================

  it("should expose the HmacKeyProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.hmacKeyProvider).toBeDefined();

    expect(typeof provider.hmacKeyProvider.getHmacKey).toBe("function");

    expect(typeof provider.hmacKeyProvider.getHmacKeyByVersion).toBe(
      "function",
    );
  });

  // ==========================================================================
  // 10. Crypto Provider
  // ==========================================================================

  it("should expose the CryptoProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.cryptoProvider).toBeDefined();

    expect(typeof provider.cryptoProvider.encrypt).toBe("function");

    expect(typeof provider.cryptoProvider.decrypt).toBe("function");

    expect(typeof provider.cryptoProvider.hash).toBe("function");

    expect(typeof provider.cryptoProvider.verifyHash).toBe("function");

    expect(typeof provider.cryptoProvider.sign).toBe("function");

    expect(typeof provider.cryptoProvider.verifySignature).toBe("function");

    expect(typeof provider.cryptoProvider.createHmac).toBe("function");

    expect(typeof provider.cryptoProvider.verifyHmac).toBe("function");
  });

  // ==========================================================================
  // 11. Provider Identity
  // ==========================================================================

  it("should always identify itself as LOCAL", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.getMetadata().type).toBe(SecurityProviderType.LOCAL);
  });

  // ==========================================================================
  // 12. Provider Metadata Immutability Boundary
  // ==========================================================================

  it("should not expose raw cryptographic material through metadata", () => {
    const provider = new LocalSecurityProvider();

    const metadata = provider.getMetadata();

    expect(metadata).not.toHaveProperty("privateKey");

    expect(metadata).not.toHaveProperty("publicKey");

    expect(metadata).not.toHaveProperty("keyMaterial");

    expect(metadata).not.toHaveProperty("secretKey");

    expect(metadata).not.toHaveProperty("password");

    expect(metadata).not.toHaveProperty("token");
  });

  // ==========================================================================
  // 13. Provider Capability Count
  // ==========================================================================

  it("should expose exactly the expected Local capabilities", () => {
    const provider = new LocalSecurityProvider();

    const capabilities = provider.getMetadata().capabilities;

    expect(capabilities).toHaveLength(7);
  });
});
