import { describe, expect, it } from "vitest";

import { LocalKeyMaterialProvider } from "../../providers/local/local-key-material.provider.js";

import { AES_256_GCM_KEY_LENGTH } from "../../constants/encryption.constants.js";

describe("Phase 8.6 — Local Key Material Management", () => {
  const createProvider = (): LocalKeyMaterialProvider => {
    return new LocalKeyMaterialProvider();
  };

  it("should generate AES-256 key material", async () => {
    const provider = createProvider();

    const result = await provider.getKeyMaterial("key-material-test", 1);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBe(AES_256_GCM_KEY_LENGTH);
  });

  it("should return the same key material for the same key and version", async () => {
    const provider = createProvider();

    const first = await provider.getKeyMaterial("key-material-test", 1);

    const second = await provider.getKeyMaterial("key-material-test", 1);

    expect(second.equals(first)).toBe(true);
  });

  it("should return different material for different key ids", async () => {
    const provider = createProvider();

    const keyA = await provider.getKeyMaterial("key-material-a", 1);

    const keyB = await provider.getKeyMaterial("key-material-b", 1);

    expect(keyA.equals(keyB)).toBe(false);
  });

  it("should keep different versions independently addressable", async () => {
    const provider = createProvider();

    const version1 = await provider.getKeyMaterial("key-material-versioned", 1);

    const version2 = await provider.getKeyMaterial("key-material-versioned", 2);

    expect(version1.length).toBe(AES_256_GCM_KEY_LENGTH);
    expect(version2.length).toBe(AES_256_GCM_KEY_LENGTH);
    expect(version1.equals(version2)).toBe(false);
  });

  it("should return the same material for repeated version lookup", async () => {
    const provider = createProvider();

    const first = await provider.getKeyMaterial("key-material-versioned", 2);

    const second = await provider.getKeyMaterial("key-material-versioned", 2);

    expect(second.equals(first)).toBe(true);
  });

  it("should isolate key material by key id and version", async () => {
    const provider = createProvider();

    const keyA1 = await provider.getKeyMaterial("key-a", 1);
    const keyA2 = await provider.getKeyMaterial("key-a", 2);
    const keyB1 = await provider.getKeyMaterial("key-b", 1);

    expect(keyA1.equals(keyA2)).toBe(false);
    expect(keyA1.equals(keyB1)).toBe(false);
    expect(keyA2.equals(keyB1)).toBe(false);
  });

  it("should return a defensive copy of stored key material", async () => {
    const provider = createProvider();

    const first = await provider.getKeyMaterial("defensive-copy-test", 1);

    const original = Buffer.from(first);

    first.fill(0);

    const second = await provider.getKeyMaterial("defensive-copy-test", 1);

    expect(second.equals(original)).toBe(true);
    expect(second.equals(first)).toBe(false);
  });

  it("should not allow mutation of one returned buffer to affect another lookup", async () => {
    const provider = createProvider();

    const first = await provider.getKeyMaterial("mutation-isolation-test", 1);

    const expected = Buffer.from(first);

    first[0] = first[0] ^ 0xff;

    const second = await provider.getKeyMaterial("mutation-isolation-test", 1);

    expect(second.equals(expected)).toBe(true);
  });

  it("should isolate key material between provider instances", async () => {
    const providerA = createProvider();
    const providerB = createProvider();

    const materialA = await providerA.getKeyMaterial("isolated-key", 1);

    const materialB = await providerB.getKeyMaterial("isolated-key", 1);

    expect(materialA.equals(materialB)).toBe(false);
  });

  it("should create independent material for independent versions", async () => {
    const provider = createProvider();

    const version1 = await provider.getKeyMaterial("rotation-key", 1);

    const version2 = await provider.getKeyMaterial("rotation-key", 2);

    expect(version1.equals(version2)).toBe(false);
  });

  it("should consistently return the configured AES key length", async () => {
    const provider = createProvider();

    const versions = [1, 2, 3, 4, 5];

    for (const version of versions) {
      const material = await provider.getKeyMaterial(
        "length-validation-key",
        version,
      );

      expect(material.length).toBe(AES_256_GCM_KEY_LENGTH);
    }
  });

  it("should not expose key material through enumerable provider metadata", () => {
    const provider = createProvider();

    const serialized = JSON.stringify(provider);

    expect(serialized).not.toMatch(/secret|privateKey|publicKey|keyMaterial/i);
  });
});
