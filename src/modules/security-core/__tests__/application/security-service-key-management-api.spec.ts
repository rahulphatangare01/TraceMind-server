import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  KeyPurpose,
  KeyStatus,
  SecurityScope,
} from "../../domain/enums/index.js";

import type {
  SecurityKey,
  SecurityKeyVersion,
} from "../../domain/models/index.js";

import type { KeyReference } from "../../types/index.js";

import type {
  CreateKeyRequest,
  KeyProvider,
} from "../../application/interfaces/key.provider.interface.js";

import { SecurityServiceKeyManagementApi } from "../../application/services/security-service-key-management-api.service.js";

describe("SecurityServiceKeyManagementApi", () => {
  const createKeyMock =
    vi.fn<(request: CreateKeyRequest) => Promise<SecurityKey>>();

  const getKeyMock = vi.fn<(keyId: string) => Promise<SecurityKey | null>>();

  const getKeyVersionMock =
    vi.fn<(reference: KeyReference) => Promise<SecurityKeyVersion | null>>();

  const getActiveVersionMock =
    vi.fn<(keyId: string) => Promise<SecurityKeyVersion | null>>();

  const rotateKeyMock = vi.fn<(keyId: string) => Promise<SecurityKeyVersion>>();

  const changeKeyStatusMock =
    vi.fn<
      (
        reference: KeyReference,
        status: KeyStatus,
      ) => Promise<SecurityKeyVersion>
    >();

  const keyProvider = {
    createKey: createKeyMock,
    getKey: getKeyMock,
    getKeyVersion: getKeyVersionMock,
    getActiveVersion: getActiveVersionMock,
    rotateKey: rotateKeyMock,
    changeKeyStatus: changeKeyStatusMock,
  } as unknown as KeyProvider;

  const service = new SecurityServiceKeyManagementApi(keyProvider);

  const createRequest: CreateKeyRequest = {
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-phase-9-12",
  };

  const key: SecurityKey = {
    id: "security-key-phase-9-12",
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-phase-9-12",
    provider: "LOCAL",
    status: KeyStatus.ACTIVE,
    currentVersion: 1,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const keyVersion: SecurityKeyVersion = {
    id: "security-key-version-phase-9-12",
    keyId: key.id,
    version: 1,
    purpose: KeyPurpose.ENCRYPTION,
    status: KeyStatus.ACTIVE,
    providerKeyReference: `${key.id}:v1`,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    activatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("delegates createKey to the key provider", async () => {
    createKeyMock.mockResolvedValue(key);

    const result = await service.createKey(createRequest);

    expect(createKeyMock).toHaveBeenCalledWith(createRequest);
    expect(result).toEqual(key);
  });

  it("delegates getKey to the key provider", async () => {
    getKeyMock.mockResolvedValue(key);

    const result = await service.getKey(key.id);

    expect(getKeyMock).toHaveBeenCalledWith(key.id);
    expect(result).toEqual(key);
  });

  it("returns null when the requested key does not exist", async () => {
    getKeyMock.mockResolvedValue(null);

    const result = await service.getKey("unknown-key-id");

    expect(getKeyMock).toHaveBeenCalledWith("unknown-key-id");
    expect(result).toBeNull();
  });

  it("delegates getKeyVersion to the key provider", async () => {
    const reference: KeyReference = {
      keyId: key.id,
      version: 1,
    };

    getKeyVersionMock.mockResolvedValue(keyVersion);

    const result = await service.getKeyVersion(reference);

    expect(getKeyVersionMock).toHaveBeenCalledWith(reference);
    expect(result).toEqual(keyVersion);
  });

  it("delegates getActiveKeyVersion to getActiveVersion", async () => {
    getActiveVersionMock.mockResolvedValue(keyVersion);

    const result = await service.getActiveKeyVersion(key.id);

    expect(getActiveVersionMock).toHaveBeenCalledWith(key.id);
    expect(result).toEqual(keyVersion);
  });

  it("delegates rotateKey to the key provider", async () => {
    const rotatedVersion: SecurityKeyVersion = {
      ...keyVersion,
      id: "security-key-version-phase-9-12-v2",
      version: 2,
      providerKeyReference: `${key.id}:v2`,
    };

    rotateKeyMock.mockResolvedValue(rotatedVersion);

    const result = await service.rotateKey(key.id);

    expect(rotateKeyMock).toHaveBeenCalledWith(key.id);
    expect(result).toEqual(rotatedVersion);
  });

  it("delegates changeKeyStatus to the key provider", async () => {
    const reference: KeyReference = {
      keyId: key.id,
      version: 1,
    };

    const updatedVersion: SecurityKeyVersion = {
      ...keyVersion,
      status: KeyStatus.DISABLED,
      disabledAt: new Date("2026-01-02T00:00:00.000Z"),
    };

    changeKeyStatusMock.mockResolvedValue(updatedVersion);

    const result = await service.changeKeyStatus(reference, KeyStatus.DISABLED);

    expect(changeKeyStatusMock).toHaveBeenCalledWith(
      reference,
      KeyStatus.DISABLED,
    );

    expect(result).toEqual(updatedVersion);
  });

  it("propagates provider errors", async () => {
    createKeyMock.mockRejectedValue(new Error("Key provider failure"));

    await expect(service.createKey(createRequest)).rejects.toThrow(
      "Key provider failure",
    );
  });

  it("does not expose raw key material through the API result", async () => {
    createKeyMock.mockResolvedValue(key);

    const result = await service.createKey(createRequest);

    const serialized = JSON.stringify(result);

    expect(serialized).not.toMatch(
      /secret|privateKey|publicKey|keyMaterial|password|token/i,
    );
  });

  it("does not expose raw key material through key versions", async () => {
    const reference: KeyReference = {
      keyId: key.id,
      version: 1,
    };

    getKeyVersionMock.mockResolvedValue(keyVersion);

    const result = await service.getKeyVersion(reference);

    const serialized = JSON.stringify(result);

    expect(serialized).not.toMatch(
      /secret|privateKey|publicKey|keyMaterial|password|token/i,
    );
  });
});
