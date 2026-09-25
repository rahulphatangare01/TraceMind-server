import { describe, expect, it } from "vitest";

import { LocalKeyProvider } from "../../providers/local/local-key.provider.js";

import {
  KeyPurpose,
  KeyStatus,
  SecurityScope,
} from "../../domain/enums/index.js";

describe("Phase 8.5 — Local Key Version Lifecycle", () => {
  const createProvider = (): LocalKeyProvider => {
    return new LocalKeyProvider();
  };

  const createKeyRequest = () => ({
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-version-lifecycle-test",
  });

  it("should create the first version as ACTIVE", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    const version = await provider.getKeyVersion({
      keyId: key.id,
      version: 1,
    });

    expect(version).not.toBeNull();
    expect(version?.version).toBe(1);
    expect(version?.status).toBe(KeyStatus.ACTIVE);
  });

  it("should resolve version 1 as the active version", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    const activeVersion = await provider.getActiveVersion(key.id);

    expect(activeVersion).not.toBeNull();
    expect(activeVersion?.version).toBe(1);
    expect(activeVersion?.status).toBe(KeyStatus.ACTIVE);
  });

  it("should create version 2 during the first rotation", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    const rotatedVersion = await provider.rotateKey(key.id);

    expect(rotatedVersion.version).toBe(2);
    expect(rotatedVersion.status).toBe(KeyStatus.ACTIVE);
  });

  it("should make version 2 the active version after rotation", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);

    const activeVersion = await provider.getActiveVersion(key.id);

    expect(activeVersion).not.toBeNull();
    expect(activeVersion?.version).toBe(2);
    expect(activeVersion?.status).toBe(KeyStatus.ACTIVE);
  });

  it("should transition the previous active version to DECRYPT_ONLY", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);

    const previousVersion = await provider.getKeyVersion({
      keyId: key.id,
      version: 1,
    });

    expect(previousVersion).not.toBeNull();
    expect(previousVersion?.status).toBe(KeyStatus.DECRYPT_ONLY);
  });

  it("should preserve version 1 after rotation", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);

    const version = await provider.getKeyVersion({
      keyId: key.id,
      version: 1,
    });

    expect(version).not.toBeNull();
    expect(version?.version).toBe(1);
  });

  it("should update currentVersion to 2 after the first rotation", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);

    const updatedKey = await provider.getKey(key.id);

    expect(updatedKey).not.toBeNull();
    expect(updatedKey?.currentVersion).toBe(2);
  });

  it("should support a second rotation", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);
    const version3 = await provider.rotateKey(key.id);

    expect(version3.version).toBe(3);
    expect(version3.status).toBe(KeyStatus.ACTIVE);
  });

  it("should make version 3 active after the second rotation", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);
    await provider.rotateKey(key.id);

    const activeVersion = await provider.getActiveVersion(key.id);

    expect(activeVersion).not.toBeNull();
    expect(activeVersion?.version).toBe(3);
    expect(activeVersion?.status).toBe(KeyStatus.ACTIVE);
  });

  it("should mark version 2 as DECRYPT_ONLY after the second rotation", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);
    await provider.rotateKey(key.id);

    const version2 = await provider.getKeyVersion({
      keyId: key.id,
      version: 2,
    });

    expect(version2).not.toBeNull();
    expect(version2?.status).toBe(KeyStatus.DECRYPT_ONLY);
  });

  it("should keep version 1 DECRYPT_ONLY after multiple rotations", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);
    await provider.rotateKey(key.id);

    const version1 = await provider.getKeyVersion({
      keyId: key.id,
      version: 1,
    });

    expect(version1).not.toBeNull();
    expect(version1?.status).toBe(KeyStatus.DECRYPT_ONLY);
  });

  it("should update currentVersion to 3 after two rotations", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);
    await provider.rotateKey(key.id);

    const updatedKey = await provider.getKey(key.id);

    expect(updatedKey).not.toBeNull();
    expect(updatedKey?.currentVersion).toBe(3);
  });

  it("should resolve each exact historical version", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    await provider.rotateKey(key.id);
    await provider.rotateKey(key.id);

    const version1 = await provider.getKeyVersion({
      keyId: key.id,
      version: 1,
    });

    const version2 = await provider.getKeyVersion({
      keyId: key.id,
      version: 2,
    });

    const version3 = await provider.getKeyVersion({
      keyId: key.id,
      version: 3,
    });

    expect(version1?.version).toBe(1);
    expect(version2?.version).toBe(2);
    expect(version3?.version).toBe(3);

    expect(version1?.status).toBe(KeyStatus.DECRYPT_ONLY);
    expect(version2?.status).toBe(KeyStatus.DECRYPT_ONLY);
    expect(version3?.status).toBe(KeyStatus.ACTIVE);
  });

  it("should return null for a version that does not exist", async () => {
    const provider = createProvider();

    const key = await provider.createKey(createKeyRequest());

    const version = await provider.getKeyVersion({
      keyId: key.id,
      version: 99,
    });

    expect(version).toBeNull();
  });

  it("should return null when resolving an unknown key active version", async () => {
    const provider = createProvider();

    const activeVersion = await provider.getActiveVersion("unknown-key-id");

    expect(activeVersion).toBeNull();
  });

  it("should isolate version lifecycle between keys", async () => {
    const provider = createProvider();

    const keyA = await provider.createKey(createKeyRequest());
    const keyB = await provider.createKey(createKeyRequest());

    await provider.rotateKey(keyA.id);

    const keyAVersion = await provider.getActiveVersion(keyA.id);
    const keyBVersion = await provider.getActiveVersion(keyB.id);

    expect(keyAVersion?.version).toBe(2);
    expect(keyBVersion?.version).toBe(1);
  });

  it("should isolate version lifecycle between provider instances", async () => {
    const providerA = createProvider();
    const providerB = createProvider();

    const key = await providerA.createKey(createKeyRequest());

    await providerA.rotateKey(key.id);

    expect(await providerB.getKey(key.id)).toBeNull();
    expect(await providerB.getActiveVersion(key.id)).toBeNull();
  });
});
