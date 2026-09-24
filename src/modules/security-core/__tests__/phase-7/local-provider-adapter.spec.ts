import { describe, expect, it } from "vitest";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/provider.types.js";

import { LocalSecurityProvider } from "../../providers/local/local-security.provider.js";

describe("LocalSecurityProvider", () => {
  it("should implement the SecurityProvider contract", () => {
    const provider = new LocalSecurityProvider();

    expect(typeof provider.getMetadata).toBe("function");
    expect(typeof provider.getStatus).toBe("function");
  });

  it("should expose LOCAL provider type", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.getMetadata().type).toBe(SecurityProviderType.LOCAL);
  });

  it("should expose stable Local provider metadata", () => {
    const provider = new LocalSecurityProvider();

    const metadata = provider.getMetadata();

    expect(metadata.id).toBe("local-security-provider");

    expect(metadata.name).toBe("Local Security Provider");

    expect(metadata.version).toBe("1.0.0");
  });

  it("should expose READY status", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.getStatus()).toBe(SecurityProviderStatus.READY);
  });

  it("should expose KeyProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.keyProvider).toBeDefined();
    expect(typeof provider.keyProvider.createKey).toBe("function");
  });

  it("should expose KeyMaterialProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.keyMaterialProvider).toBeDefined();

    expect(typeof provider.keyMaterialProvider.getKeyMaterial).toBe("function");
  });

  it("should expose SigningKeyProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.signingKeyProvider).toBeDefined();

    expect(typeof provider.signingKeyProvider.getSigningKey).toBe("function");

    expect(typeof provider.signingKeyProvider.getVerificationKey).toBe(
      "function",
    );
  });

  it("should expose HmacKeyProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.hmacKeyProvider).toBeDefined();

    expect(typeof provider.hmacKeyProvider.getHmacKey).toBe("function");
  });

  it("should expose CryptoProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(provider.cryptoProvider).toBeDefined();

    expect(typeof provider.cryptoProvider.encrypt).toBe("function");

    expect(typeof provider.cryptoProvider.decrypt).toBe("function");

    expect(typeof provider.cryptoProvider.hash).toBe("function");

    expect(typeof provider.cryptoProvider.sign).toBe("function");

    expect(typeof provider.cryptoProvider.createHmac).toBe("function");
  });

  it("should expose all declared capabilities", () => {
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

  it("should create independent Local provider instances", () => {
    const first = new LocalSecurityProvider();
    const second = new LocalSecurityProvider();

    expect(first).not.toBe(second);

    expect(first.keyProvider).not.toBe(second.keyProvider);

    expect(first.cryptoProvider).not.toBe(second.cryptoProvider);
  });

  it("should not expose raw key material through provider metadata", () => {
    const provider = new LocalSecurityProvider();

    const metadata = provider.getMetadata();

    expect(JSON.stringify(metadata)).not.toContain("privateKey");

    expect(JSON.stringify(metadata)).not.toContain("keyMaterial");
  });

  it("should preserve the provider contract without operation methods on SecurityProvider", () => {
    const provider = new LocalSecurityProvider();

    expect(
      (provider as unknown as Record<string, unknown>).encrypt,
    ).toBeUndefined();

    expect(
      (provider as unknown as Record<string, unknown>).decrypt,
    ).toBeUndefined();
  });
});
