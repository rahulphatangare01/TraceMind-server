// import type { SecurityKeyVersionPersistenceRecord } from "../../domain/models/security-key-version-persistence.model.js";

// /**
//  * Persistence contract for Security Key version metadata.
//  *
//  * Implementations must preserve historical versions and must not
//  * persist raw cryptographic key material.
//  */
// export interface SecurityKeyVersionRepositoryPort {
//   /**
//    * Creates a new version record.
//    *
//    * Implementations must respect the unique (keyId, version)
//    * constraint and reject duplicate version numbers.
//    */
//   create(
//     record: SecurityKeyVersionPersistenceRecord,
//   ): Promise<SecurityKeyVersionPersistenceRecord>;

//   /**
//    * Retrieves a version belonging to the specified key.
//    */
//   findByKeyAndVersion(
//     keyId: string,
//     version: number,
//   ): Promise<SecurityKeyVersionPersistenceRecord | null>;

//   /**
//    * Retrieves the active version for a key.
//    *
//    * Returns null when no active version exists.
//    */
//   findActiveByKeyId(
//     keyId: string,
//   ): Promise<SecurityKeyVersionPersistenceRecord | null>;

//   /**
//    * Lists historical versions for a key, newest version first.
//    */
//   findAllByKeyId(keyId: string): Promise<SecurityKeyVersionPersistenceRecord[]>;

//   /**
//    * Updates lifecycle metadata for an existing version.
//    *
//    * Returns null when the specified version does not exist.
//    */
//   update(
//     keyId: string,
//     version: number,
//     changes: Partial<
//       Pick<
//         SecurityKeyVersionPersistenceRecord,
//         "status" | "activatedAt" | "rotatedAt" | "disabledAt" | "destroyedAt"
//       >
//     >,
//   ): Promise<SecurityKeyVersionPersistenceRecord | null>;
// }

import type { SecurityKeyVersionPersistenceRecord } from "../../domain/models/security-key-version-persistence.model.js";
import type { SecurityResourceScope } from "./security-resource-scope.port.js";

/**
 * Persistence contract for Security Key version metadata.
 *
 * Implementations must:
 * - Enforce the complete tenant resource scope in database queries.
 * - Preserve historical key versions.
 * - Never persist raw cryptographic key material.
 * - Never perform version operations using keyId alone.
 */
export interface SecurityKeyVersionRepositoryPort {
  create(
    scope: SecurityResourceScope,
    record: SecurityKeyVersionPersistenceRecord,
  ): Promise<SecurityKeyVersionPersistenceRecord>;

  findByKeyAndVersion(
    scope: SecurityResourceScope,
    keyId: string,
    version: number,
  ): Promise<SecurityKeyVersionPersistenceRecord | null>;

  findActiveByKeyId(
    scope: SecurityResourceScope,
    keyId: string,
  ): Promise<SecurityKeyVersionPersistenceRecord | null>;

  findAllByKeyId(
    scope: SecurityResourceScope,
    keyId: string,
  ): Promise<SecurityKeyVersionPersistenceRecord[]>;

  update(
    scope: SecurityResourceScope,
    keyId: string,
    version: number,
    changes: Partial<
      Pick<
        SecurityKeyVersionPersistenceRecord,
        "status" | "activatedAt" | "rotatedAt" | "disabledAt" | "destroyedAt"
      >
    >,
  ): Promise<SecurityKeyVersionPersistenceRecord | null>;
}
