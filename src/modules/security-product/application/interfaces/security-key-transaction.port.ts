import type { SecurityKeyPersistenceRecord } from "../../domain/models/security-key-persistence.model.js";
import type { SecurityKeyVersionPersistenceRecord } from "../../domain/models/security-key-version-persistence.model.js";
import type { SecurityResourceScope } from "./security-resource-scope.port.js";

/**
 * Transaction-aware persistence operations for Security Key lifecycle
 * changes that must update key metadata and version history atomically.
 *
 * Implementations must enforce the supplied tenant scope in database
 * queries and roll back all changes if an operation fails.
 */
export interface SecurityKeyTransactionPort {
  createKeyWithInitialVersion(
    scope: SecurityResourceScope,
    key: SecurityKeyPersistenceRecord,
    initialVersion: SecurityKeyVersionPersistenceRecord,
  ): Promise<void>;

  rotateKeyWithVersion(
    scope: SecurityResourceScope,
    keyId: string,
    expectedCurrentVersion: number,
    previousVersion: SecurityKeyVersionPersistenceRecord,
    nextVersion: SecurityKeyVersionPersistenceRecord,
    updatedAt: Date,
    updatedBy?: string | null,
  ): Promise<boolean>;
}
