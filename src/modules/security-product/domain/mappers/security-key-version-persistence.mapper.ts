import type { SecurityKeyVersion } from "../../../security-core/public-api.js";
import type { SecurityKeyVersionPersistenceRecord } from "../models/security-key-version-persistence.model.js";

/**
 * Maps a Security Core key version into its persistence representation.
 *
 * Raw key material is never handled by this mapper.
 */
export function toSecurityKeyVersionPersistenceRecord(
  version: SecurityKeyVersion,
): SecurityKeyVersionPersistenceRecord {
  return {
    id: version.id,
    keyId: version.keyId,
    version: version.version,
    purpose: version.purpose,
    status: version.status,
    providerKeyReference: version.providerKeyReference,
    createdAt: version.createdAt,
    activatedAt: version.activatedAt ?? null,
    rotatedAt: version.rotatedAt ?? null,
    disabledAt: version.disabledAt ?? null,
    destroyedAt: version.destroyedAt ?? null,
  };
}

/**
 * Maps a persistence record back to the Security Core domain model.
 */
export function toSecurityKeyVersionDomainModel(
  record: SecurityKeyVersionPersistenceRecord,
): SecurityKeyVersion {
  return {
    id: record.id,
    keyId: record.keyId,
    version: record.version,
    purpose: record.purpose,
    status: record.status,
    providerKeyReference: record.providerKeyReference,
    createdAt: record.createdAt,
    ...(record.activatedAt !== null ? { activatedAt: record.activatedAt } : {}),
    ...(record.rotatedAt !== null ? { rotatedAt: record.rotatedAt } : {}),
    ...(record.disabledAt !== null ? { disabledAt: record.disabledAt } : {}),
    ...(record.destroyedAt !== null ? { destroyedAt: record.destroyedAt } : {}),
  };
}
