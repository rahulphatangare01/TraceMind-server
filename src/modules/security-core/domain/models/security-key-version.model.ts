import type { KeyPurpose, KeyStatus } from "../enums/index.js";

/**
 * Represents one version of a security key.
 *
 * Stores lifecycle metadata and a provider reference only.
 * Raw key material must remain inside the configured key provider.
 */
export interface SecurityKeyVersion {
  id: string;
  keyId: string;
  version: number;

  purpose: KeyPurpose;
  status: KeyStatus;

  providerKeyReference: string;

  createdAt: Date;
  activatedAt?: Date;
  rotatedAt?: Date;
  disabledAt?: Date;
  destroyedAt?: Date;
}
