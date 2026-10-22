import type { KeyPurpose, KeyStatus, SecurityScope } from "../enums/index.js";

/**
 * Represents security key metadata managed by Security Core.
 *
 * This model stores key identity, scope, provider metadata, and lifecycle
 * information. It must never contain raw cryptographic key material.
 */
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
