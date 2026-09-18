import type { KeyProvider } from "../../application/interfaces/key.provider.interface.js";

import type {
  SecurityKey,
  SecurityKeyVersion,
} from "../../domain/models/index.js";

import { KeyNotFoundError } from "../../errors/index.js";

import type {
  KeyPurpose,
  SecurityScope,
  KeyStatus,
} from "../../domain/enums/index.js";

export class LocalKeyProvider implements KeyProvider {
  private readonly keys = new Map<string, SecurityKey>();

  private readonly keyVersions = new Map<string, SecurityKeyVersion[]>();

  /**
   * Create key metadata.
   */
  async createKey(request: {
    purpose: KeyPurpose;
    scope: SecurityScope;
    organizationId?: string;
    projectId?: string;
    applicationId?: string;
    environmentId?: string;
    provider?: string;
  }): Promise<SecurityKey> {
    const keyId = crypto.randomUUID();

    const now = new Date();

    const key: SecurityKey = {
      id: keyId,
      purpose: request.purpose,
      scope: request.scope,

      organizationId: request.organizationId,
      projectId: request.projectId,
      applicationId: request.applicationId,
      environmentId: request.environmentId,

      provider: request.provider ?? "LOCAL",

      status: "ACTIVE" as KeyStatus,
      currentVersion: 1,

      createdAt: now,
      updatedAt: now,
    };

    this.keys.set(keyId, key);

    const version: SecurityKeyVersion = {
      id: crypto.randomUUID(),
      keyId,
      version: 1,

      purpose: request.purpose,
      status: "ACTIVE" as KeyStatus,

      providerKeyReference: `${keyId}:v1`,

      createdAt: now,
      activatedAt: now,
    };

    this.keyVersions.set(keyId, [version]);

    return key;
  }

  /**
   * Get key metadata.
   */
  async getKey(keyId: string): Promise<SecurityKey | null> {
    return this.keys.get(keyId) ?? null;
  }

  /**
   * Get specific key version.
   *
   * IMPORTANT:
   * Decryption uses this method so that old
   * encrypted data can still be decrypted after rotation.
   */
  async getKeyVersion(reference: {
    keyId: string;
    version: number;
  }): Promise<SecurityKeyVersion | null> {
    const versions = this.keyVersions.get(reference.keyId);

    if (!versions) {
      return null;
    }

    return versions.find((item) => item.version === reference.version) ?? null;
  }

  /**
   * Get currently active key version.
   */
  async getActiveVersion(keyId: string): Promise<SecurityKeyVersion | null> {
    const versions = this.keyVersions.get(keyId);

    if (!versions) {
      return null;
    }

    return versions.find((item) => item.status === "ACTIVE") ?? null;
  }

  /**
   * Rotate key.
   *
   * Existing ACTIVE version becomes DECRYPT_ONLY.
   * New version becomes ACTIVE.
   */
  async rotateKey(keyId: string): Promise<SecurityKeyVersion> {
    const key = this.keys.get(keyId);

    if (!key) {
      throw new KeyNotFoundError(keyId);
    }

    const versions = this.keyVersions.get(keyId);

    if (!versions || versions.length === 0) {
      throw new KeyNotFoundError(keyId);
    }

    const currentVersion = versions.find((item) => item.status === "ACTIVE");

    if (currentVersion) {
      currentVersion.status = "DECRYPT_ONLY" as KeyStatus;

      currentVersion.rotatedAt = new Date();
    }

    const newVersionNumber = key.currentVersion + 1;

    const now = new Date();

    const newVersion: SecurityKeyVersion = {
      id: crypto.randomUUID(),

      keyId,

      version: newVersionNumber,

      purpose: key.purpose,

      status: "ACTIVE" as KeyStatus,

      providerKeyReference: `${keyId}:v${newVersionNumber}`,

      createdAt: now,

      activatedAt: now,
    };

    versions.push(newVersion);

    key.currentVersion = newVersionNumber;
    key.updatedAt = now;

    this.keys.set(keyId, key);

    return newVersion;
  }

  /**
   * Change key version status.
   */
  async changeKeyStatus(
    reference: {
      keyId: string;
      version: number;
    },
    status: KeyStatus,
  ): Promise<SecurityKeyVersion> {
    const keyVersion = await this.getKeyVersion(reference);

    if (!keyVersion) {
      throw new KeyNotFoundError(`${reference.keyId}:v${reference.version}`);
    }

    keyVersion.status = status;

    if (status === "ACTIVE") {
      keyVersion.activatedAt = new Date();
    }

    if (status === "DECRYPT_ONLY") {
      keyVersion.rotatedAt = new Date();
    }

    if (status === "DISABLED") {
      keyVersion.disabledAt = new Date();
    }

    if (status === "DESTROYED") {
      keyVersion.destroyedAt = new Date();
    }

    return keyVersion;
  }
}
