import type { SecurityKey } from "../../../security-core/public-api.js";
import type { SecurityKeyPersistenceRecord } from "../models/security-key-persistence.model.js";
import { assertValidSecurityKeyForPersistence } from "../validators/security-key-persistence.validator.js";
/**
 * Maps a Security Core key into its persistence representation.
 *
 * Persistence-only audit and soft-delete fields are initialized here.
 * Raw key material is never handled by this mapper.
 */
function requireOrganizationId(key: SecurityKey): string {
  const organizationId = key.organizationId?.trim();

  if (!organizationId) {
    throw new Error("Security key persistence requires an organizationId.");
  }

  return organizationId;
}
export function toSecurityKeyPersistenceRecord(
  key: SecurityKey,
): SecurityKeyPersistenceRecord {
  assertValidSecurityKeyForPersistence(key);
  return {
    id: key.id,
    purpose: key.purpose,
    scope: key.scope,

    // organizationId: key.organizationId ?? "",
    organizationId: requireOrganizationId(key),
    projectId: key.projectId ?? null,
    applicationId: key.applicationId ?? null,
    environmentId: key.environmentId ?? null,

    provider: key.provider,
    status: key.status,
    currentVersion: key.currentVersion,

    createdAt: key.createdAt,
    updatedAt: key.updatedAt,

    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    deletedBy: null,
  };
}

/**
 * Maps a persistence record back to the Security Core domain model.
 *
 * Persistence-only fields are intentionally excluded.
 */
export function toSecurityKeyDomainModel(
  record: SecurityKeyPersistenceRecord,
): SecurityKey {
  return {
    id: record.id,
    purpose: record.purpose,
    scope: record.scope,

    organizationId: record.organizationId,
    projectId: record.projectId ?? undefined,
    applicationId: record.applicationId ?? undefined,
    environmentId: record.environmentId ?? undefined,

    provider: record.provider,
    status: record.status,
    currentVersion: record.currentVersion,

    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
