import { beforeEach, describe, expect, it, vi } from "vitest";

import { SecurityKeyPersistenceService } from "../application/services/security-key-persistence.service.js";

import type { SecurityKeyRepositoryPort } from "../application/interfaces/security-key.repository.port.js";
import type { SecurityKeyVersionRepositoryPort } from "../application/interfaces/security-key-version.repository.port.js";
import type { SecurityKeyTransactionPort } from "../application/interfaces/security-key-transaction.port.js";
import type { SecurityResourceScope } from "../application/interfaces/security-resource-scope.port.js";

import type { SecurityKeyPersistenceRecord } from "../domain/models/security-key-persistence.model.js";
import type { SecurityKeyVersionPersistenceRecord } from "../domain/models/security-key-version-persistence.model.js";

import {
  KeyPurpose,
  KeyStatus,
  SecurityScope,
} from "../../security-core/public-api.js";

describe("SecurityKeyPersistenceService", () => {
  let service: SecurityKeyPersistenceService;

  let keyRepository: {
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    softDelete: ReturnType<typeof vi.fn>;
  };

  let keyVersionRepository: {
    create: ReturnType<typeof vi.fn>;
    findByKeyAndVersion: ReturnType<typeof vi.fn>;
    findActiveByKeyId: ReturnType<typeof vi.fn>;
    findAllByKeyId: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  let keyTransaction: {
    createKeyWithInitialVersion: ReturnType<typeof vi.fn>;
    rotateKeyWithVersion: ReturnType<typeof vi.fn>;
  };

  let scope: SecurityResourceScope;
  let keyRecord: SecurityKeyPersistenceRecord;
  let initialVersion: SecurityKeyVersionPersistenceRecord;
  let activeVersion: SecurityKeyVersionPersistenceRecord;

  beforeEach(() => {
    vi.clearAllMocks();

    scope = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-001",
      projectId: "project-001",
      applicationId: "application-001",
    };

    keyRecord = {
      id: "key-001",
      purpose: KeyPurpose.ENCRYPTION,
      scope: SecurityScope.APPLICATION,
      organizationId: "org-001",
      projectId: "project-001",
      applicationId: "application-001",
      environmentId: null,
      provider: "local",
      status: KeyStatus.ACTIVE,
      currentVersion: 1,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      deletedAt: null,
      createdBy: null,
      updatedBy: null,
      deletedBy: null,
    };

    initialVersion = {
      id: "key-version-001",
      keyId: "key-001",
      version: 1,
      purpose: KeyPurpose.ENCRYPTION,
      status: KeyStatus.ACTIVE,
      providerKeyReference: "provider-ref-001",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      activatedAt: new Date("2026-01-01T00:00:00.000Z"),
      rotatedAt: null,
      disabledAt: null,
      destroyedAt: null,
    };

    activeVersion = { ...initialVersion };

    keyRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };

    keyVersionRepository = {
      create: vi.fn(),
      findByKeyAndVersion: vi.fn(),
      findActiveByKeyId: vi.fn(),
      findAllByKeyId: vi.fn(),
      update: vi.fn(),
    };

    keyTransaction = {
      createKeyWithInitialVersion: vi.fn(),
      rotateKeyWithVersion: vi.fn(),
    };

    service = new SecurityKeyPersistenceService(
      keyRepository as unknown as SecurityKeyRepositoryPort,
      keyVersionRepository as unknown as SecurityKeyVersionRepositoryPort,
      keyTransaction as unknown as SecurityKeyTransactionPort,
    );
  });

  describe("createKey", () => {
    it("creates the key and initial version transactionally, then retrieves the key in scope", async () => {
      keyRepository.findById.mockResolvedValue(keyRecord);
      keyTransaction.createKeyWithInitialVersion.mockResolvedValue(undefined);

      const result = await service.createKey(scope, keyRecord, initialVersion);

      expect(keyTransaction.createKeyWithInitialVersion).toHaveBeenCalledTimes(
        1,
      );

      expect(keyTransaction.createKeyWithInitialVersion).toHaveBeenCalledWith(
        scope,
        keyRecord,
        initialVersion,
      );

      expect(keyRepository.findById).toHaveBeenCalledTimes(1);
      expect(keyRepository.findById).toHaveBeenCalledWith(scope, keyRecord.id);

      expect(result).toEqual(keyRecord);
    });

    it("propagates a transaction failure", async () => {
      const error = new Error("Transaction failed");

      keyTransaction.createKeyWithInitialVersion.mockRejectedValue(error);

      await expect(
        service.createKey(scope, keyRecord, initialVersion),
      ).rejects.toBe(error);

      expect(keyRepository.findById).not.toHaveBeenCalled();
    });

    it("throws when the created key cannot be retrieved in the supplied scope", async () => {
      keyTransaction.createKeyWithInitialVersion.mockResolvedValue(undefined);
      keyRepository.findById.mockResolvedValue(null);

      await expect(
        service.createKey(scope, keyRecord, initialVersion),
      ).rejects.toThrow(
        "Security key was created but could not be retrieved in its supplied scope.",
      );
    });

    it("propagates errors when retrieving the created key", async () => {
      const error = new Error("Key lookup failed");

      keyTransaction.createKeyWithInitialVersion.mockResolvedValue(undefined);
      keyRepository.findById.mockRejectedValue(error);

      await expect(
        service.createKey(scope, keyRecord, initialVersion),
      ).rejects.toBe(error);
    });
  });

  describe("getKey", () => {
    it("delegates the scoped key lookup to the key repository", async () => {
      keyRepository.findById.mockResolvedValue(keyRecord);

      const result = await service.getKey(scope, keyRecord.id);

      expect(keyRepository.findById).toHaveBeenCalledWith(scope, keyRecord.id);
      expect(result).toEqual(keyRecord);
    });

    it("returns null when the key is not found in scope", async () => {
      keyRepository.findById.mockResolvedValue(null);

      const result = await service.getKey(scope, "missing-key");

      expect(result).toBeNull();
    });

    it("propagates repository errors", async () => {
      const error = new Error("Repository unavailable");
      keyRepository.findById.mockRejectedValue(error);

      await expect(service.getKey(scope, keyRecord.id)).rejects.toBe(error);
    });
  });

  describe("getKeyVersion", () => {
    it("delegates the scoped key-version lookup", async () => {
      keyVersionRepository.findByKeyAndVersion.mockResolvedValue(
        initialVersion,
      );

      const result = await service.getKeyVersion(scope, keyRecord.id, 1);

      expect(keyVersionRepository.findByKeyAndVersion).toHaveBeenCalledWith(
        scope,
        keyRecord.id,
        1,
      );

      expect(result).toEqual(initialVersion);
    });

    it("returns null when the requested version is not found", async () => {
      keyVersionRepository.findByKeyAndVersion.mockResolvedValue(null);

      const result = await service.getKeyVersion(scope, keyRecord.id, 99);

      expect(result).toBeNull();
    });

    it("propagates version repository errors", async () => {
      const error = new Error("Version lookup failed");

      keyVersionRepository.findByKeyAndVersion.mockRejectedValue(error);

      await expect(service.getKeyVersion(scope, keyRecord.id, 1)).rejects.toBe(
        error,
      );
    });
  });

  describe("getActiveKeyVersion", () => {
    it("delegates the scoped active-version lookup", async () => {
      keyVersionRepository.findActiveByKeyId.mockResolvedValue(activeVersion);

      const result = await service.getActiveKeyVersion(scope, keyRecord.id);

      expect(keyVersionRepository.findActiveByKeyId).toHaveBeenCalledWith(
        scope,
        keyRecord.id,
      );

      expect(result).toEqual(activeVersion);
    });

    it("returns null when no active version exists", async () => {
      keyVersionRepository.findActiveByKeyId.mockResolvedValue(null);

      const result = await service.getActiveKeyVersion(scope, keyRecord.id);

      expect(result).toBeNull();
    });

    it("propagates repository errors", async () => {
      const error = new Error("Active-version lookup failed");

      keyVersionRepository.findActiveByKeyId.mockRejectedValue(error);

      await expect(
        service.getActiveKeyVersion(scope, keyRecord.id),
      ).rejects.toBe(error);
    });
  });

  describe("getKeyVersions", () => {
    it("returns all versions for the key within the supplied scope", async () => {
      const secondVersion: SecurityKeyVersionPersistenceRecord = {
        ...initialVersion,
        id: "key-version-002",
        version: 2,
        status: KeyStatus.ACTIVE,
        providerKeyReference: "provider-ref-002",
      };

      keyVersionRepository.findAllByKeyId.mockResolvedValue([
        initialVersion,
        secondVersion,
      ]);

      const result = await service.getKeyVersions(scope, keyRecord.id);

      expect(keyVersionRepository.findAllByKeyId).toHaveBeenCalledWith(
        scope,
        keyRecord.id,
      );

      expect(result).toEqual([initialVersion, secondVersion]);
    });

    it("returns an empty array when no versions exist", async () => {
      keyVersionRepository.findAllByKeyId.mockResolvedValue([]);

      const result = await service.getKeyVersions(scope, keyRecord.id);

      expect(result).toEqual([]);
    });

    it("propagates version-history repository errors", async () => {
      const error = new Error("Version history failed");

      keyVersionRepository.findAllByKeyId.mockRejectedValue(error);

      await expect(service.getKeyVersions(scope, keyRecord.id)).rejects.toBe(
        error,
      );
    });
  });

  describe("rotateKey", () => {
    it("delegates rotation to the transaction port and returns its result", async () => {
      const nextVersion: SecurityKeyVersionPersistenceRecord = {
        ...initialVersion,
        id: "key-version-002",
        version: 2,
        status: KeyStatus.ACTIVE,
        providerKeyReference: "provider-ref-002",
      };

      const previousVersion: SecurityKeyVersionPersistenceRecord = {
        ...initialVersion,
        status: KeyStatus.DECRYPT_ONLY,
        rotatedAt: new Date("2026-02-01T00:00:00.000Z"),
      };

      const updatedAt = new Date("2026-02-01T00:00:00.000Z");
      const updatedBy = "user-001";

      keyTransaction.rotateKeyWithVersion.mockResolvedValue(true);

      const result = await service.rotateKey(
        scope,
        keyRecord.id,
        1,
        previousVersion,
        nextVersion,
        updatedAt,
        updatedBy,
      );

      expect(keyTransaction.rotateKeyWithVersion).toHaveBeenCalledTimes(1);

      expect(keyTransaction.rotateKeyWithVersion).toHaveBeenCalledWith(
        scope,
        keyRecord.id,
        1,
        previousVersion,
        nextVersion,
        updatedAt,
        updatedBy,
      );

      expect(result).toBe(true);
    });

    it("returns false when the transaction reports a stale or missing key", async () => {
      keyTransaction.rotateKeyWithVersion.mockResolvedValue(false);

      const result = await service.rotateKey(
        scope,
        keyRecord.id,
        1,
        {
          ...initialVersion,
          status: KeyStatus.DECRYPT_ONLY,
        },
        {
          ...initialVersion,
          id: "key-version-002",
          version: 2,
        },
        new Date("2026-02-01T00:00:00.000Z"),
      );

      expect(result).toBe(false);
    });

    it("propagates transaction errors", async () => {
      const error = new Error("Rotation transaction failed");

      keyTransaction.rotateKeyWithVersion.mockRejectedValue(error);

      await expect(
        service.rotateKey(
          scope,
          keyRecord.id,
          1,
          {
            ...initialVersion,
            status: KeyStatus.DECRYPT_ONLY,
          },
          {
            ...initialVersion,
            id: "key-version-002",
            version: 2,
          },
          new Date("2026-02-01T00:00:00.000Z"),
        ),
      ).rejects.toBe(error);
    });
  });
});
