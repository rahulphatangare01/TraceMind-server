import { describe, expect, it } from "vitest";

import { LocalKeyProvider } from "../../providers/local/local-key.provider.js";

import {
  KeyPurpose,
  KeyStatus,
  SecurityScope,
} from "../../domain/enums/index.js";

describe("Phase 8.4 — Local Key Provider Hardening", () => {
  const createProvider = (): LocalKeyProvider => {
    return new LocalKeyProvider();
  };

  const createKeyRequest = () => ({
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-hardening-test",
  });

  it("should create a key with valid metadata", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    expect(key).toBeDefined();
    expect(key.id).toBeTruthy();
    expect(key.purpose).toBe(KeyPurpose.ENCRYPTION);
    expect(key.scope).toBe(SecurityScope.ORGANIZATION);
    expect(key.organizationId).toBe("org-hardening-test");
    expect(key.currentVersion).toBe(1);
    expect(key.status).toBe(KeyStatus.ACTIVE);
  });

  it("should generate unique key ids for separate keys", async () => {
    const provider = createProvider();

    const keyA = await provider.createKey(createKeyRequest());
    const keyB = await provider.createKey(createKeyRequest());

    expect(keyA.id).not.toBe(keyB.id);
  });

  it("should retrieve a created key by id", async () => {
    const provider = createProvider();

    const created = await provider.createKey(createKeyRequest());
    const retrieved = await provider.getKey(created.id);

    expect(retrieved).toEqual(created);
  });

  it("should return null for an unknown key", async () => {
    const provider = createProvider();

    const result = await provider.getKey("unknown-key-id");

    expect(result).toBeNull();
  });

  it("should create an active first key version", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    const version = await provider.getKeyVersion({
      keyId: key.id,
      version: 1,
    });

    expect(version).not.toBeNull();
    expect(version?.keyId).toBe(key.id);
    expect(version?.version).toBe(1);
    expect(version?.purpose).toBe(KeyPurpose.ENCRYPTION);
    expect(version?.status).toBe(KeyStatus.ACTIVE);
  });

  it("should return the active version", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    const activeVersion = await provider.getActiveVersion(key.id);

    expect(activeVersion).not.toBeNull();
    expect(activeVersion?.keyId).toBe(key.id);
    expect(activeVersion?.version).toBe(1);
    expect(activeVersion?.status).toBe(KeyStatus.ACTIVE);
  });

  it("should return null for an unknown key version", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    const version = await provider.getKeyVersion({
      keyId: key.id,
      version: 999,
    });

    expect(version).toBeNull();
  });

  it("should not resolve a version from another key", async () => {
    const provider = createProvider();

    const keyA = await provider.createKey(createKeyRequest());
    const keyB = await provider.createKey(createKeyRequest());

    const version = await provider.getKeyVersion({
      keyId: keyA.id,
      version: 1,
    });

    expect(version).not.toBeNull();
    expect(version?.keyId).toBe(keyA.id);
    expect(version?.keyId).not.toBe(keyB.id);
  });

  it("should rotate a key to a new version", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    const rotatedVersion = await provider.rotateKey(key.id);

    expect(rotatedVersion).toBeDefined();
    expect(rotatedVersion.keyId).toBe(key.id);
    expect(rotatedVersion.version).toBe(2);
    expect(rotatedVersion.status).toBe(KeyStatus.ACTIVE);
  });

  it("should update currentVersion after rotation", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);

    const updated = await provider.getKey(key.id);

    expect(updated).not.toBeNull();
    expect(updated?.currentVersion).toBe(2);
  });

  it("should keep the previous version addressable after rotation", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);

    const previousVersion = await provider.getKeyVersion({
      keyId: key.id,
      version: 1,
    });

    expect(previousVersion).not.toBeNull();
    expect(previousVersion?.keyId).toBe(key.id);
    expect(previousVersion?.version).toBe(1);
  });

  it("should make the new version active after rotation", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);

    const activeVersion = await provider.getActiveVersion(key.id);

    expect(activeVersion).not.toBeNull();
    expect(activeVersion?.version).toBe(2);
    expect(activeVersion?.status).toBe(KeyStatus.ACTIVE);
  });

  it("should isolate keys between provider instances", async () => {
    const providerA = createProvider();
    const providerB = createProvider();

    const key = await providerA.createKey(createKeyRequest());

    const result = await providerB.getKey(key.id);

    expect(result).toBeNull();
  });

  it("should isolate key versions between provider instances", async () => {
    const providerA = createProvider();
    const providerB = createProvider();

    const key = await providerA.createKey(createKeyRequest());

    const version = await providerB.getKeyVersion({
      keyId: key.id,
      version: 1,
    });

    expect(version).toBeNull();
  });

  it("should not expose raw key material in key metadata", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    const serialized = JSON.stringify(key);

    expect(serialized).not.toMatch(
      /secret|privateKey|publicKey|keyMaterial|password|token/i,
    );
  });

  it("should not expose raw key material in key versions", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    const version = await provider.getKeyVersion({
      keyId: key.id,
      version: 1,
    });

    const serialized = JSON.stringify(version);

    expect(serialized).not.toMatch(
      /secret|privateKey|publicKey|keyMaterial|password|token/i,
    );
  });
});
