import { KeyPurpose, KeyStatus, SecurityScope } from "../enums/index.js";

export interface SecurityKey {
  id: string;

  purpose: KeyPurpose;
  scope: SecurityScope;

  organizationId?: string;
  projectId?: string;
  applicationId?: string;
  environmentId?: string;

  provider: string;

  status: KeyStatus;

  currentVersion: number;

  createdAt: Date;
  updatedAt: Date;
}
