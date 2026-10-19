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

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
}

function createKey(overrides: Partial<SecurityKey> = {}): SecurityKey {
  return {
    id: "manual-key-001",
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "manual-org-001",
    provider: "local",
    status: KeyStatus.ACTIVE,
    currentVersion: 1,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function createKeyVersion(
  overrides: Partial<SecurityKeyVersion> = {},
): SecurityKeyVersion {
  return {
    id: "manual-version-001",
    keyId: "manual-key-001",
    version: 1,
    purpose: KeyPurpose.ENCRYPTION,
    status: KeyStatus.ACTIVE,
    providerKeyReference: "local-reference-001",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function verifyKeyMapping(): void {
  const key = createKey();
  const record = toSecurityKeyPersistenceRecord(key);
  const restored = toSecurityKeyDomainModel(record);

  assert(
    record.organizationId === "manual-org-001",
    "Organization ID is preserved",
  );
  assert(record.projectId === null, "Missing project ID maps to null");
  assert(record.deletedAt === null, "New record has no deletion timestamp");
  assert(
    JSON.stringify(restored) === JSON.stringify(key),
    "Key round-trip succeeds",
  );
}

function verifyTenantScopeValidation(): void {
  const validEnvironmentKey = createKey({
    scope: SecurityScope.ENVIRONMENT,
    projectId: "manual-project-001",
    applicationId: "manual-application-001",
    environmentId: "manual-environment-001",
  });

  assertValidSecurityKeyForPersistence(validEnvironmentKey);

  let rejectedInvalidScope = false;

  try {
    assertValidSecurityKeyForPersistence(
      createKey({ scope: SecurityScope.PLATFORM }),
    );
  } catch {
    rejectedInvalidScope = true;
  }

  assert(rejectedInvalidScope, "Platform scope is rejected");
}

function verifyKeyVersionMapping(): void {
  const version = createKeyVersion();
  const record = toSecurityKeyVersionPersistenceRecord(version);
  const restored = toSecurityKeyVersionDomainModel(record);

  assert(
    record.activatedAt === null,
    "Missing activation timestamp maps to null",
  );
  assert(
    record.destroyedAt === null,
    "Missing destruction timestamp maps to null",
  );
  assert(
    JSON.stringify(restored) === JSON.stringify(version),
    "Key-version round-trip succeeds",
  );
}

function main(): void {
  verifyKeyMapping();
  verifyTenantScopeValidation();
  verifyKeyVersionMapping();

  console.log(
    "Security resource persistence model manual verification passed.",
  );
}

main();
