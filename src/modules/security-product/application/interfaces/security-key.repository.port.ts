// import type { SecurityProductPersistencePort } from "./security-product-persistence.port.js";
// import type { SecurityKeyPersistenceRecord } from "../../domain/models/security-key-persistence.model.js";

// /**
//  * Fields that may be updated without changing a key's identity
//  * or tenant ownership.
//  *
//  * Key lifecycle transitions and version consistency must be coordinated
//  * by the key-management service and transactional persistence operations.
//  */
// export type UpdateSecurityKeyPersistenceInput = Partial<
//   Pick<
//     SecurityKeyPersistenceRecord,
//     "provider" | "status" | "currentVersion" | "updatedAt" | "updatedBy"
//   >
// >;

// /**
//  * Persistence contract for Security Key metadata.
//  *
//  * Implementations must apply the complete supplied tenant scope
//  * directly in database queries.
//  */
// export interface SecurityKeyRepositoryPort extends SecurityProductPersistencePort<
//   SecurityKeyPersistenceRecord,
//   SecurityKeyPersistenceRecord,
//   UpdateSecurityKeyPersistenceInput
// > {}

import type { SecurityProductPersistencePort } from "./security-product-persistence.port.js";
import type { SecurityKeyPersistenceRecord } from "../../domain/models/security-key-persistence.model.js";

export type UpdateSecurityKeyPersistenceInput = Partial<
  Pick<
    SecurityKeyPersistenceRecord,
    "provider" | "status" | "updatedAt" | "updatedBy"
  >
>;

export interface SecurityKeyRepositoryPort extends SecurityProductPersistencePort<
  SecurityKeyPersistenceRecord,
  SecurityKeyPersistenceRecord,
  UpdateSecurityKeyPersistenceInput
> {}
