import { randomBytes } from "node:crypto";

import { AES_256_GCM_KEY_LENGTH } from "../../constants/encryption.constants.js";

import type { KeyMaterialProvider } from "../interfaces/key-material.provider.interface.js";

export class LocalKeyMaterialProvider implements KeyMaterialProvider {
  private readonly keyStore = new Map<string, Buffer>();

  async getKeyMaterial(keyId: string, version: number): Promise<Buffer> {
    const storageKey = this.buildStorageKey(keyId, version);

    const existingKey = this.keyStore.get(storageKey);

    if (existingKey) {
      return Buffer.from(existingKey);
    }

    const keyMaterial = randomBytes(AES_256_GCM_KEY_LENGTH);

    this.keyStore.set(storageKey, keyMaterial);

    return Buffer.from(keyMaterial);
  }

  private buildStorageKey(keyId: string, version: number): string {
    return `${keyId}:v${version}`;
  }
}
