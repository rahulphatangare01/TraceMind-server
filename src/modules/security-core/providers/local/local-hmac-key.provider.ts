import { randomBytes } from "node:crypto";

import type { SecurityContext } from "../../domain/models/security-context.js";

import type {
  HmacKeyMaterial,
  HmacKeyProvider,
} from "../interfaces/hmac-key.provider.interface.js";

export class LocalHmacKeyProvider implements HmacKeyProvider {
  private readonly keyStore = new Map<string, HmacKeyMaterial>();

  async getHmacKey(context: SecurityContext): Promise<HmacKeyMaterial> {
    const storageKey = this.createStorageKey(context);

    const existingKey = this.keyStore.get(storageKey);

    if (existingKey) {
      return {
        secret: Buffer.from(existingKey.secret),
        keyId: existingKey.keyId,
        keyVersion: existingKey.keyVersion,
      };
    }

    const keyMaterial: HmacKeyMaterial = {
      secret: randomBytes(32),
      keyId: storageKey,
      keyVersion: 1,
    };

    this.keyStore.set(storageKey, keyMaterial);

    return {
      secret: Buffer.from(keyMaterial.secret),
      keyId: keyMaterial.keyId,
      keyVersion: keyMaterial.keyVersion,
    };
  }
  async getHmacKeyByVersion(
    keyId: string,
    keyVersion: number,
  ): Promise<HmacKeyMaterial | null> {
    const keyMaterial = this.keyStore.get(keyId);

    if (!keyMaterial) {
      return null;
    }

    if (keyMaterial.keyVersion !== keyVersion) {
      return null;
    }

    return {
      secret: Buffer.from(keyMaterial.secret),
      keyId: keyMaterial.keyId,
      keyVersion: keyMaterial.keyVersion,
    };
  }
  private createStorageKey(context: SecurityContext): string {
    return [
      context.scope,
      context.organizationId ?? "",
      context.projectId ?? "",
      context.applicationId ?? "",
      context.environmentId ?? "",
    ].join(":");
  }
}
