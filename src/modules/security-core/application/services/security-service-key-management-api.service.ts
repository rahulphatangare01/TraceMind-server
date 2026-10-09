import type { KeyProvider } from "../interfaces/key.provider.interface.js";

import type { CreateKeyRequest } from "../interfaces/key.provider.interface.js";

import type {
  SecurityKey,
  SecurityKeyVersion,
} from "../../domain/models/index.js";

import type { KeyReference } from "../../types/index.js";

import type { KeyStatus } from "../../domain/enums/index.js";

export class SecurityServiceKeyManagementApi {
  constructor(private readonly keyProvider: KeyProvider) {}

  async createKey(request: CreateKeyRequest): Promise<SecurityKey> {
    return this.keyProvider.createKey(request);
  }

  async getKey(keyId: string): Promise<SecurityKey | null> {
    return this.keyProvider.getKey(keyId);
  }

  async getKeyVersion(
    reference: KeyReference,
  ): Promise<SecurityKeyVersion | null> {
    return this.keyProvider.getKeyVersion(reference);
  }

  async getActiveKeyVersion(keyId: string): Promise<SecurityKeyVersion | null> {
    return this.keyProvider.getActiveVersion(keyId);
  }

  async rotateKey(keyId: string): Promise<SecurityKeyVersion> {
    return this.keyProvider.rotateKey(keyId);
  }

  async changeKeyStatus(
    reference: KeyReference,
    status: KeyStatus,
  ): Promise<SecurityKeyVersion> {
    return this.keyProvider.changeKeyStatus(reference, status);
  }
}
