import type {
  KeyPurpose,
  KeyStatus,
  SecurityScope,
} from "../../../security-core/public-api.js";

/**
 * Persistence representation of Security Key metadata.
 *
 * Contains metadata only. Raw key material must never be stored here.
 */
export interface SecurityKeyPersistenceRecord {
  id: string;

  purpose: KeyPurpose;
  scope: SecurityScope;

  organizationId: string;
  projectId: string | null;
  applicationId: string | null;
  environmentId: string | null;

  provider: string;
  status: KeyStatus;
  currentVersion: number;

  createdAt: Date;
  updatedAt: Date;

  deletedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
