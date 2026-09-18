import type { SecurityContext } from "../../domain/models/security-context.js";

export interface HmacKeyMaterial {
  secret: Buffer;
  keyId: string;
  keyVersion: number;
}

export interface HmacKeyProvider {
  getHmacKey(context: SecurityContext): Promise<HmacKeyMaterial>;
  getHmacKeyByVersion(
    keyId: string,
    keyVersion: number,
  ): Promise<HmacKeyMaterial | null>;
}
