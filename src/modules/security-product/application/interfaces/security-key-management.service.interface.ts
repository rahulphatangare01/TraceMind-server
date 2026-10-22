import type { SecurityKeyPersistenceRecord } from "../../domain/models/security-key-persistence.model.js";
import type { SecurityKeyVersionPersistenceRecord } from "../../domain/models/security-key-version-persistence.model.js";
import type { SecurityResourceScope } from "./security-resource-scope.port.js";

/**
 * Application contract for managing persisted security keys and versions.
 *
 * All operations require an explicit resource scope to preserve tenant
 * isolation. Key lifecycle changes that affect both key metadata and
 * version history must use the transaction port.
 */
export interface SecurityKeyManagementService {
  /**
   * Create key metadata and its initial version atomically.
   */
  createKey(
    scope: SecurityResourceScope,
    key: SecurityKeyPersistenceRecord,
    initialVersion: SecurityKeyVersionPersistenceRecord,
  ): Promise<SecurityKeyPersistenceRecord>;

  /**
   * Retrieve a key within the supplied tenant scope.
   */
  getKey(
    scope: SecurityResourceScope,
    keyId: string,
  ): Promise<SecurityKeyPersistenceRecord | null>;

  /**
   * Retrieve a specific version within the supplied tenant scope.
   */
  getKeyVersion(
    scope: SecurityResourceScope,
    keyId: string,
    version: number,
  ): Promise<SecurityKeyVersionPersistenceRecord | null>;

  /**
   * Retrieve the active version for a key within the supplied tenant scope.
   */
  getActiveKeyVersion(
    scope: SecurityResourceScope,
    keyId: string,
  ): Promise<SecurityKeyVersionPersistenceRecord | null>;

  /**
   * Retrieve all persisted versions for a key.
   */
  getKeyVersions(
    scope: SecurityResourceScope,
    keyId: string,
  ): Promise<SecurityKeyVersionPersistenceRecord[]>;

  /**
   * Rotate a key and update its version history atomically.
   *
   * Returns false if the key is missing from the scope or its current
   * version no longer matches expectedCurrentVersion.
   */
  rotateKey(
    scope: SecurityResourceScope,
    keyId: string,
    expectedCurrentVersion: number,
    previousVersion: SecurityKeyVersionPersistenceRecord,
    nextVersion: SecurityKeyVersionPersistenceRecord,
    updatedAt: Date,
    updatedBy?: string | null,
  ): Promise<boolean>;
}
