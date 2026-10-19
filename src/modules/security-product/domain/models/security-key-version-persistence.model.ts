import type {
  KeyPurpose,
  KeyStatus,
} from "../../../security-core/public-api.js";

/**
 * Persistence representation of a Security Key version.
 *
 * Stores version metadata and the provider reference only.
 * Raw key material must never be stored in this record.
 */
export interface SecurityKeyVersionPersistenceRecord {
  id: string;

  keyId: string;
  version: number;

  purpose: KeyPurpose;
  status: KeyStatus;

  providerKeyReference: string;

  createdAt: Date;
  activatedAt: Date | null;
  rotatedAt: Date | null;
  disabledAt: Date | null;
  destroyedAt: Date | null;
}
