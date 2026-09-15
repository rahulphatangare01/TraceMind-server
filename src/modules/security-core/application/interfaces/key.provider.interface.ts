import type {
  KeyPurpose,
  KeyStatus,
  SecurityScope,
} from "../../domain/enums/index.js";

import type { KeyReference } from "../../types/index.js";

export interface CreateKeyRequest {
  purpose: KeyPurpose;
  scope: SecurityScope;

  organizationId?: string;
  projectId?: string;
  applicationId?: string;
  environmentId?: string;
}
import type {
  SecurityKey,
  SecurityKeyVersion,
} from "../../domain/models/index.js";

export interface ResolveKeyRequest {
  purpose: KeyPurpose;

  scope: SecurityScope;

  organizationId?: string;
  projectId?: string;
  applicationId?: string;
  environmentId?: string;
}
export interface KeyProvider {
  createKey(request: CreateKeyRequest): Promise<SecurityKey>;

  getKey(keyId: string): Promise<SecurityKey | null>;

  getKeyVersion(reference: KeyReference): Promise<SecurityKeyVersion | null>;

  getActiveVersion(keyId: string): Promise<SecurityKeyVersion | null>;

  rotateKey(keyId: string): Promise<SecurityKeyVersion>;
  changeKeyStatus(
    reference: KeyReference,
    status: KeyStatus,
  ): Promise<SecurityKeyVersion>;
}

// resolveKey(request)
