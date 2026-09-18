import { EncryptionAlgorithm, KeyPurpose } from "../../domain/enums/index.js";
import type { SecurityContext } from "../../domain/models";
import type { KeyProvider } from "../interfaces/key.provider.interface.js";
import type { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";
import { ENCRYPTION_ENVELOPE_VERSION } from "../../constants/encryption.constants.js";
import {
  parseEncryptionEnvelope,
  serializeEncryptionEnvelope,
} from "../../utils/encryption-envelope.util.js";
import { KeyMaterialProvider } from "../../providers/interfaces/key-material.provider.interface.js";
import { KeyNotFoundError } from "../../errors/key-not-found.error.js";

export class EncryptionService {
  constructor(
    private readonly keyProvider: KeyProvider,
    private readonly keyMaterialProvider: KeyMaterialProvider,
    private readonly cryptoProvider: LocalCryptoProvider,
  ) {}

  async encrypt(
    plaintext: string,
    context: SecurityContext,
    keyId: string,
  ): Promise<string> {
    const key = await this.keyProvider.getActiveVersion(keyId);
    if (!key) {
      throw new KeyNotFoundError(keyId);
    }

    const keyMaterial = await this.keyMaterialProvider.getKeyMaterial(
      keyId,
      key.version,
    );

    const result = await this.cryptoProvider.encrypt({
      plaintext,
      algorithm: EncryptionAlgorithm.AES_256_GCM,
      context,
      keyId,
      keyVersion: key.version,
      keyMaterial,
    });

    return serializeEncryptionEnvelope({
      version: ENCRYPTION_ENVELOPE_VERSION,
      algorithm: result.algorithm,
      encoding: result.encoding,
      keyId: result.keyId,
      keyVersion: result.keyVersion,
      iv: result.iv,
      authTag: result.authTag,
      ciphertext: result.ciphertext,
    });
  }

  async decrypt(
    encryptedValue: string,
    context: SecurityContext,
  ): Promise<string> {
    const envelope = parseEncryptionEnvelope(encryptedValue);

    const key = await this.keyProvider.getKeyVersion({
      keyId: envelope.keyId,
      version: envelope.keyVersion,
    });

    if (!key) {
      throw new KeyNotFoundError(`${envelope.keyId}:v${envelope.keyVersion}`);
    }

    const keyMaterial = await this.keyMaterialProvider.getKeyMaterial(
      envelope.keyId,
      envelope.keyVersion,
    );

    const result = await this.cryptoProvider.decrypt({
      ciphertext: envelope.ciphertext,
      algorithm: envelope.algorithm,
      encoding: envelope.encoding,
      iv: envelope.iv,
      authTag: envelope.authTag,
      keyId: envelope.keyId,
      keyVersion: envelope.keyVersion,
      context,
      keyMaterial,
    });

    return result.plaintext;
  }
}
