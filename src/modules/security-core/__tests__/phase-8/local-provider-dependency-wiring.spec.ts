import { describe, expect, it } from "vitest";

import { LocalSecurityProvider } from "../../providers/local/local-security.provider.js";

import { LocalKeyProvider } from "../../providers/local/local-key.provider.js";
import { LocalKeyMaterialProvider } from "../../providers/local/local-key-material.provider.js";
import { LocalSigningKeyProvider } from "../../providers/local/local-signing-key.provider.js";
import { LocalHmacKeyProvider } from "../../providers/local/local-hmac-key.provider.js";
import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";

describe("Phase 8.3 — Local Provider Dependency Wiring", () => {
  const createProvider = (): LocalSecurityProvider => {
    return new LocalSecurityProvider();
  };

  it("should wire LocalKeyProvider", () => {
    const provider = createProvider();

    expect(provider.keyProvider).toBeInstanceOf(LocalKeyProvider);
  });

  it("should wire LocalKeyMaterialProvider", () => {
    const provider = createProvider();

    expect(provider.keyMaterialProvider).toBeInstanceOf(
      LocalKeyMaterialProvider,
    );
  });

  it("should wire LocalSigningKeyProvider", () => {
    const provider = createProvider();

    expect(provider.signingKeyProvider).toBeInstanceOf(LocalSigningKeyProvider);
  });

  it("should wire LocalHmacKeyProvider", () => {
    const provider = createProvider();

    expect(provider.hmacKeyProvider).toBeInstanceOf(LocalHmacKeyProvider);
  });

  it("should wire LocalCryptoProvider", () => {
    const provider = createProvider();

    expect(provider.cryptoProvider).toBeInstanceOf(LocalCryptoProvider);
  });

  it("should create all primary dependencies during provider construction", () => {
    const provider = createProvider();

    expect(provider.keyProvider).toBeDefined();
    expect(provider.keyMaterialProvider).toBeDefined();
    expect(provider.signingKeyProvider).toBeDefined();
    expect(provider.hmacKeyProvider).toBeDefined();
    expect(provider.cryptoProvider).toBeDefined();
  });

  it("should expose independent dependency instances for separate providers", () => {
    const providerA = createProvider();
    const providerB = createProvider();

    expect(providerA.keyProvider).not.toBe(providerB.keyProvider);

    expect(providerA.keyMaterialProvider).not.toBe(
      providerB.keyMaterialProvider,
    );

    expect(providerA.signingKeyProvider).not.toBe(providerB.signingKeyProvider);

    expect(providerA.hmacKeyProvider).not.toBe(providerB.hmacKeyProvider);

    expect(providerA.cryptoProvider).not.toBe(providerB.cryptoProvider);
  });

  it("should preserve the same dependency references exposed by the provider", () => {
    const provider = createProvider();

    expect(provider.keyProvider).toBe(provider.keyProvider);
    expect(provider.keyMaterialProvider).toBe(provider.keyMaterialProvider);
    expect(provider.signingKeyProvider).toBe(provider.signingKeyProvider);
    expect(provider.hmacKeyProvider).toBe(provider.hmacKeyProvider);
    expect(provider.cryptoProvider).toBe(provider.cryptoProvider);
  });

  it("should not replace local dependencies with unrelated provider implementations", () => {
    const provider = createProvider();

    expect(provider.keyProvider.constructor.name).toBe("LocalKeyProvider");

    expect(provider.keyMaterialProvider.constructor.name).toBe(
      "LocalKeyMaterialProvider",
    );

    expect(provider.signingKeyProvider.constructor.name).toBe(
      "LocalSigningKeyProvider",
    );

    expect(provider.hmacKeyProvider.constructor.name).toBe(
      "LocalHmacKeyProvider",
    );

    expect(provider.cryptoProvider.constructor.name).toBe(
      "LocalCryptoProvider",
    );
  });

  it("should keep signing and HMAC dependencies independently accessible", () => {
    const provider = createProvider();

    expect(provider.signingKeyProvider).toBeDefined();
    expect(provider.hmacKeyProvider).toBeDefined();

    expect(provider.signingKeyProvider).not.toBe(provider.hmacKeyProvider);
  });

  it("should keep key and key-material dependencies independently accessible", () => {
    const provider = createProvider();

    expect(provider.keyProvider).not.toBe(provider.keyMaterialProvider);
  });

  it("should construct a complete local dependency graph without null dependencies", () => {
    const provider = createProvider();

    const dependencies = [
      provider.keyProvider,
      provider.keyMaterialProvider,
      provider.signingKeyProvider,
      provider.hmacKeyProvider,
      provider.cryptoProvider,
    ];

    for (const dependency of dependencies) {
      expect(dependency).not.toBeNull();
      expect(dependency).toBeDefined();
    }
  });
});
