import { KeyStatus, KeyPurpose } from "../enums/index.js";

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
