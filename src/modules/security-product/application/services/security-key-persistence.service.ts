import type { SecurityKeyManagementService } from "../interfaces/security-key-management.service.interface.js";
import type { SecurityKeyRepositoryPort } from "../interfaces/security-key.repository.port.js";
import type { SecurityKeyVersionRepositoryPort } from "../interfaces/security-key-version.repository.port.js";
import type { SecurityKeyTransactionPort } from "../interfaces/security-key-transaction.port.js";
import type { SecurityResourceScope } from "../interfaces/security-resource-scope.port.js";
import type { SecurityKeyPersistenceRecord } from "../../domain/models/security-key-persistence.model.js";
import type { SecurityKeyVersionPersistenceRecord } from "../../domain/models/security-key-version-persistence.model.js";

export class SecurityKeyPersistenceService implements SecurityKeyManagementService {
  constructor(
    private readonly keyRepository: SecurityKeyRepositoryPort,
    private readonly keyVersionRepository: SecurityKeyVersionRepositoryPort,
    private readonly keyTransaction: SecurityKeyTransactionPort,
  ) {}

  async createKey(
    scope: SecurityResourceScope,
    key: SecurityKeyPersistenceRecord,
    initialVersion: SecurityKeyVersionPersistenceRecord,
  ): Promise<SecurityKeyPersistenceRecord> {
    await this.keyTransaction.createKeyWithInitialVersion(
      scope,
      key,
      initialVersion,
    );

    const persistedKey = await this.keyRepository.findById(scope, key.id);

    if (!persistedKey) {
      throw new Error(
        "Security key was created but could not be retrieved in its supplied scope.",
      );
    }

    return persistedKey;
  }

  async getKey(
    scope: SecurityResourceScope,
    keyId: string,
  ): Promise<SecurityKeyPersistenceRecord | null> {
    return this.keyRepository.findById(scope, keyId);
  }

  async getKeyVersion(
    scope: SecurityResourceScope,
    keyId: string,
    version: number,
  ): Promise<SecurityKeyVersionPersistenceRecord | null> {
    return this.keyVersionRepository.findByKeyAndVersion(scope, keyId, version);
  }

  async getActiveKeyVersion(
    scope: SecurityResourceScope,
    keyId: string,
  ): Promise<SecurityKeyVersionPersistenceRecord | null> {
    return this.keyVersionRepository.findActiveByKeyId(scope, keyId);
  }

  async getKeyVersions(
    scope: SecurityResourceScope,
    keyId: string,
  ): Promise<SecurityKeyVersionPersistenceRecord[]> {
    return this.keyVersionRepository.findAllByKeyId(scope, keyId);
  }

  async rotateKey(
    scope: SecurityResourceScope,
    keyId: string,
    expectedCurrentVersion: number,
    previousVersion: SecurityKeyVersionPersistenceRecord,
    nextVersion: SecurityKeyVersionPersistenceRecord,
    updatedAt: Date,
    updatedBy?: string | null,
  ): Promise<boolean> {
    return this.keyTransaction.rotateKeyWithVersion(
      scope,
      keyId,
      expectedCurrentVersion,
      previousVersion,
      nextVersion,
      updatedAt,
      updatedBy,
    );
  }
}
