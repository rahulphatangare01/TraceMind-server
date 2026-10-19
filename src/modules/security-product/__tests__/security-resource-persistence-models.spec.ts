import { describe, expect, it } from "vitest";

import {
  KeyPurpose,
  KeyStatus,
  SecurityScope,
  type SecurityKey,
  type SecurityKeyVersion,
} from "../../security-core/public-api.js";

import {
  toSecurityKeyDomainModel,
  toSecurityKeyPersistenceRecord,
} from "../domain/mappers/security-key-persistence.mapper.js";

import {
  toSecurityKeyVersionDomainModel,
  toSecurityKeyVersionPersistenceRecord,
} from "../domain/mappers/security-key-version-persistence.mapper.js";

import { assertValidSecurityKeyForPersistence } from "../domain/validators/security-key-persistence.validator.js";

function createSecurityKey(overrides: Partial<SecurityKey> = {}): SecurityKey {
  return {
    id: "key-001",
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-001",
    provider: "local",
    status: KeyStatus.ACTIVE,
    currentVersion: 1,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function createSecurityKeyVersion(
  overrides: Partial<SecurityKeyVersion> = {},
): SecurityKeyVersion {
  return {
    id: "version-001",
    keyId: "key-001",
    version: 1,
    purpose: KeyPurpose.ENCRYPTION,
    status: KeyStatus.ACTIVE,
    providerKeyReference: "local-reference-001",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    activatedAt: new Date("2026-01-01T00:01:00.000Z"),
    ...overrides,
  };
}

describe("Security resource persistence models", () => {
  describe("security key mapping", () => {
    it("maps organization-scoped key metadata to a persistence record", () => {
      const key = createSecurityKey();

      const record = toSecurityKeyPersistenceRecord(key);

      expect(record).toMatchObject({
        id: key.id,
        organizationId: key.organizationId,
        projectId: null,
        applicationId: null,
        environmentId: null,
        scope: SecurityScope.ORGANIZATION,
        deletedAt: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
      });
    });

    it("round-trips a valid security key without persistence-only fields", () => {
      const key = createSecurityKey();

      const record = toSecurityKeyPersistenceRecord(key);
      const restored = toSecurityKeyDomainModel(record);

      expect(restored).toEqual(key);
    });

    it("rejects a key without an organization ID", () => {
      const key = createSecurityKey({
        organizationId: undefined,
      });

      expect(() => toSecurityKeyPersistenceRecord(key)).toThrow(
        /organizationId/,
      );
    });

    it("rejects a project-scoped key without a project ID", () => {
      const key = createSecurityKey({
        scope: SecurityScope.PROJECT,
        projectId: undefined,
      });

      expect(() => assertValidSecurityKeyForPersistence(key)).toThrow(
        /projectId/,
      );
    });

    it("rejects organization-scoped keys containing project identifiers", () => {
      const key = createSecurityKey({
        projectId: "project-001",
      });

      expect(() => assertValidSecurityKeyForPersistence(key)).toThrow(
        /projectId is not allowed/,
      );
    });

    it("rejects platform scope for tenant resource persistence", () => {
      const key = createSecurityKey({
        scope: SecurityScope.PLATFORM,
      });

      expect(() => assertValidSecurityKeyForPersistence(key)).toThrow(
        /not supported/,
      );
    });

    it("accepts a valid environment-scoped key", () => {
      const key = createSecurityKey({
        scope: SecurityScope.ENVIRONMENT,
        projectId: "project-001",
        applicationId: "application-001",
        environmentId: "environment-001",
      });

      expect(() => assertValidSecurityKeyForPersistence(key)).not.toThrow();
    });
  });

  describe("security key version mapping", () => {
    it("maps optional lifecycle timestamps to null", () => {
      const version = createSecurityKeyVersion({
        activatedAt: undefined,
        rotatedAt: undefined,
        disabledAt: undefined,
        destroyedAt: undefined,
      });

      const record = toSecurityKeyVersionPersistenceRecord(version);

      expect(record.activatedAt).toBeNull();
      expect(record.rotatedAt).toBeNull();
      expect(record.disabledAt).toBeNull();
      expect(record.destroyedAt).toBeNull();
    });

    it("round-trips key-version metadata and lifecycle timestamps", () => {
      const version = createSecurityKeyVersion();

      const record = toSecurityKeyVersionPersistenceRecord(version);
      const restored = toSecurityKeyVersionDomainModel(record);

      expect(restored).toEqual(version);
    });

    it("does not add raw key material to the persistence record", () => {
      const record = toSecurityKeyVersionPersistenceRecord(
        createSecurityKeyVersion(),
      );

      expect(record).not.toHaveProperty("keyMaterial");
      expect(record).not.toHaveProperty("secret");
      expect(record).not.toHaveProperty("privateKey");
    });
  });
});
