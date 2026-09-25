import { describe, expect, it } from "vitest";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/provider.types.js";

import type { SecurityProvider } from "../../types/provider.types.js";

import type { LocalProviderAdapter } from "../../providers/interfaces/local-provider.adapter.interface.js";

import { LocalSecurityProvider } from "../../providers/local/local-security.provider.js";

describe("Phase 8.2 — Local Provider Contract Compliance", () => {
  const createProvider = (): LocalSecurityProvider => {
    return new LocalSecurityProvider();
  };

  it("should implement SecurityProvider contract", () => {
    const provider: SecurityProvider = createProvider();

    expect(provider).toBeDefined();
    expect(typeof provider.getMetadata).toBe("function");
    expect(typeof provider.getStatus).toBe("function");
  });

  it("should implement LocalProviderAdapter contract", () => {
    const provider: LocalProviderAdapter = createProvider();

    expect(provider.keyProvider).toBeDefined();
    expect(provider.keyMaterialProvider).toBeDefined();
    expect(provider.signingKeyProvider).toBeDefined();
    expect(provider.hmacKeyProvider).toBeDefined();
    expect(provider.cryptoProvider).toBeDefined();
  });

  it("should expose KeyProvider contract", () => {
    const provider = createProvider();

    expect(typeof provider.keyProvider.createKey).toBe("function");
    expect(typeof provider.keyProvider.getKey).toBe("function");
    expect(typeof provider.keyProvider.getKeyVersion).toBe("function");
    expect(typeof provider.keyProvider.getActiveVersion).toBe("function");
    expect(typeof provider.keyProvider.rotateKey).toBe("function");
    expect(typeof provider.keyProvider.changeKeyStatus).toBe("function");
  });

  it("should expose KeyMaterialProvider contract", () => {
    const provider = createProvider();

    expect(typeof provider.keyMaterialProvider.getKeyMaterial).toBe("function");
  });

  it("should expose SigningKeyProvider contract", () => {
    const provider = createProvider();

    expect(typeof provider.signingKeyProvider.getSigningKey).toBe("function");
    expect(typeof provider.signingKeyProvider.getVerificationKey).toBe(
      "function",
    );
  });

  //   it("should expose HmacKeyProvider contract", () => {
  //     const provider = createProvider();

  //     expect(typeof provider.hmacKeyProvider.getHmacKey).toBe("function");
  //     expect(typeof provider.hmacKeyProvider.getVerificationKey).toBe("function");
  //   });
  it("should expose HmacKeyProvider contract", () => {
    const provider = createProvider();

    expect(typeof provider.hmacKeyProvider.getHmacKey).toBe("function");
    expect(typeof provider.hmacKeyProvider.getHmacKeyByVersion).toBe(
      "function",
    );
  });
  it("should expose CryptoProvider contract", () => {
    const provider = createProvider();

    expect(typeof provider.cryptoProvider.encrypt).toBe("function");
    expect(typeof provider.cryptoProvider.decrypt).toBe("function");
    expect(typeof provider.cryptoProvider.hash).toBe("function");
    expect(typeof provider.cryptoProvider.verifyHash).toBe("function");
    expect(typeof provider.cryptoProvider.sign).toBe("function");
    expect(typeof provider.cryptoProvider.verifySignature).toBe("function");
    expect(typeof provider.cryptoProvider.createHmac).toBe("function");
    expect(typeof provider.cryptoProvider.verifyHmac).toBe("function");
  });

  it("should expose LOCAL provider identity", () => {
    const provider = createProvider();
    const metadata = provider.getMetadata();

    expect(metadata.type).toBe(SecurityProviderType.LOCAL);
    expect(metadata.id).toBe("local-security-provider");
  });

  it("should expose a valid provider status", () => {
    const provider = createProvider();

    expect(Object.values(SecurityProviderStatus)).toContain(
      provider.getStatus(),
    );
  });

  it("should expose capabilities matching the Local provider", () => {
    const provider = createProvider();
    const capabilities = provider.getMetadata().capabilities;

    const expectedCapabilities = [
      SecurityProviderCapability.KEY_MANAGEMENT,
      SecurityProviderCapability.KEY_MATERIAL,
      SecurityProviderCapability.ENCRYPTION,
      SecurityProviderCapability.DECRYPTION,
      SecurityProviderCapability.HASHING,
      SecurityProviderCapability.SIGNING,
      SecurityProviderCapability.HMAC,
    ];

    expect(capabilities).toEqual(expect.arrayContaining(expectedCapabilities));

    expect(capabilities).toHaveLength(expectedCapabilities.length);
  });

  it("should not expose duplicate capabilities", () => {
    const provider = createProvider();

    const capabilities = provider.getMetadata().capabilities;

    expect(new Set(capabilities).size).toBe(capabilities.length);
  });

  it("should expose stable metadata across instances", () => {
    const providerA = createProvider();
    const providerB = createProvider();

    expect(providerA.getMetadata()).toEqual(providerB.getMetadata());
  });

  it("should create independent provider dependency instances", () => {
    const providerA = createProvider();
    const providerB = createProvider();

    expect(providerA).not.toBe(providerB);

    expect(providerA.keyProvider).not.toBe(providerB.keyProvider);
    expect(providerA.keyMaterialProvider).not.toBe(
      providerB.keyMaterialProvider,
    );
    expect(providerA.signingKeyProvider).not.toBe(providerB.signingKeyProvider);
    expect(providerA.hmacKeyProvider).not.toBe(providerB.hmacKeyProvider);
    expect(providerA.cryptoProvider).not.toBe(providerB.cryptoProvider);
  });

  it("should not expose raw key material through provider metadata", () => {
    const provider = createProvider();
    const metadata = provider.getMetadata();

    const serializedMetadata = JSON.stringify(metadata);

    expect(serializedMetadata).not.toMatch(
      /privateKey|publicKey|keyMaterial|secret|password|token/i,
    );
  });
});
