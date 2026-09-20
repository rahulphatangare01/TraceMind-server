// import { EncryptionAlgorithm, KeyPurpose } from "../../domain/enums/index.js";
// import type { SecurityContext } from "../../domain/models";
// import type { KeyProvider } from "../interfaces/key.provider.interface.js";
// import type { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";
// import { ENCRYPTION_ENVELOPE_VERSION } from "../../constants/encryption.constants.js";
// import {
//   parseEncryptionEnvelope,
//   serializeEncryptionEnvelope,
// } from "../../utils/encryption-envelope.util.js";
// import { KeyMaterialProvider } from "../../providers/interfaces/key-material.provider.interface.js";
// import { KeyNotFoundError } from "../../errors/key-not-found.error.js";

// import { SecurityBoundaryValidator } from "./security-boundary-validator.service.js";
// export class EncryptionService {
//   constructor(
//     private readonly keyProvider: KeyProvider,
//     private readonly keyMaterialProvider: KeyMaterialProvider,
//     private readonly cryptoProvider: LocalCryptoProvider,
//     private readonly securityBoundaryValidator: SecurityBoundaryValidator,
//   ) {}

//   async encrypt(
//     plaintext: string,
//     context: SecurityContext,
//     keyId: string,
//   ): Promise<string> {
//     const key = await this.keyProvider.getActiveVersion(keyId);
//     if (!key) {
//       throw new KeyNotFoundError(keyId);
//     }

//     const keyMaterial = await this.keyMaterialProvider.getKeyMaterial(
//       keyId,
//       key.version,
//     );

//     const result = await this.cryptoProvider.encrypt({
//       plaintext,
//       algorithm: EncryptionAlgorithm.AES_256_GCM,
//       context,
//       keyId,
//       keyVersion: key.version,
//       keyMaterial,
//     });

//     return serializeEncryptionEnvelope({
//       version: ENCRYPTION_ENVELOPE_VERSION,
//       algorithm: result.algorithm,
//       encoding: result.encoding,
//       keyId: result.keyId,
//       keyVersion: result.keyVersion,
//       iv: result.iv,
//       authTag: result.authTag,
//       ciphertext: result.ciphertext,
//     });
//   }

//   async decrypt(
//     encryptedValue: string,
//     context: SecurityContext,
//   ): Promise<string> {
//     const envelope = parseEncryptionEnvelope(encryptedValue);

//     const key = await this.keyProvider.getKeyVersion({
//       keyId: envelope.keyId,
//       version: envelope.keyVersion,
//     });

//     if (!key) {
//       throw new KeyNotFoundError(`${envelope.keyId}:v${envelope.keyVersion}`);
//     }

//     const keyMaterial = await this.keyMaterialProvider.getKeyMaterial(
//       envelope.keyId,
//       envelope.keyVersion,
//     );

//     const result = await this.cryptoProvider.decrypt({
//       ciphertext: envelope.ciphertext,
//       algorithm: envelope.algorithm,
//       encoding: envelope.encoding,
//       iv: envelope.iv,
//       authTag: envelope.authTag,
//       keyId: envelope.keyId,
//       keyVersion: envelope.keyVersion,
//       context,
//       keyMaterial,
//     });

//     return result.plaintext;
//   }
// }
import { EncryptionAlgorithm } from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

import type { KeyProvider } from "../interfaces/key.provider.interface.js";

import type { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";

import { ENCRYPTION_ENVELOPE_VERSION } from "../../constants/encryption.constants.js";

import {
  parseEncryptionEnvelope,
  serializeEncryptionEnvelope,
} from "../../utils/encryption-envelope.util.js";

import type { KeyMaterialProvider } from "../../providers/interfaces/key-material.provider.interface.js";

import { KeyNotFoundError } from "../../errors/key-not-found.error.js";

import { SecurityBoundaryValidator } from "./security-boundary-validator.service.js";

export class EncryptionService {
  constructor(
    private readonly keyProvider: KeyProvider,
    private readonly keyMaterialProvider: KeyMaterialProvider,
    private readonly cryptoProvider: LocalCryptoProvider,
    private readonly securityBoundaryValidator: SecurityBoundaryValidator,
  ) {}

  async encrypt(
    plaintext: string,
    context: SecurityContext,
    keyId: string,
  ): Promise<string> {
    /**
     * 1. Validate and normalize the security boundary.
     */
    const boundaryResult = this.securityBoundaryValidator.validate(context);

    const normalizedContext = boundaryResult.context;

    /**
     * 2. Get the currently active key version.
     */
    const key = await this.keyProvider.getActiveVersion(keyId);

    if (!key) {
      throw new KeyNotFoundError(keyId);
    }

    /**
     * 3. Resolve the actual key material.
     */
    const keyMaterial = await this.keyMaterialProvider.getKeyMaterial(
      keyId,
      key.version,
    );

    /**
     * 4. Perform encryption.
     *
     * LocalCryptoProvider requires keyMaterial
     * internally for AES-256-GCM.
     */
    const result = await this.cryptoProvider.encrypt({
      plaintext,
      algorithm: EncryptionAlgorithm.AES_256_GCM,
      context: normalizedContext,
      keyId,
      keyVersion: key.version,
      keyMaterial,
    });

    /**
     * 5. Serialize the encrypted result.
     */
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
    /**
     * 1. Validate and normalize the security boundary.
     *
     * This happens before key resolution and crypto.
     */
    const boundaryResult = this.securityBoundaryValidator.validate(context);

    const normalizedContext = boundaryResult.context;

    /**
     * 2. Parse the encrypted envelope.
     */
    const envelope = parseEncryptionEnvelope(encryptedValue);

    /**
     * 3. Resolve the exact key version stored
     * inside the envelope.
     *
     * Do not use the currently active key here.
     */
    const key = await this.keyProvider.getKeyVersion({
      keyId: envelope.keyId,
      version: envelope.keyVersion,
    });

    if (!key) {
      throw new KeyNotFoundError(`${envelope.keyId}:v${envelope.keyVersion}`);
    }

    /**
     * 4. Resolve the exact key material.
     */
    const keyMaterial = await this.keyMaterialProvider.getKeyMaterial(
      envelope.keyId,
      envelope.keyVersion,
    );

    /**
     * 5. Decrypt using the normalized security context.
     *
     * The LocalCryptoProvider canonicalizes this context
     * and uses it as AES-256-GCM AAD.
     */
    const result = await this.cryptoProvider.decrypt({
      ciphertext: envelope.ciphertext,
      algorithm: envelope.algorithm,
      encoding: envelope.encoding,
      iv: envelope.iv,
      authTag: envelope.authTag,
      keyId: envelope.keyId,
      keyVersion: envelope.keyVersion,
      context: normalizedContext,
      keyMaterial,
    });

    return result.plaintext;
  }
}
