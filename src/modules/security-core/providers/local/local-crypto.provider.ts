// // import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// // export interface KeyMaterialProvider {
// //   getKeyMaterial(keyId: string, version: number): Promise<Buffer>;
// // }

// // const iv = randomBytes(12);

// // const cipher = createCipheriv("aes-256-gcm", keyMaterial, iv);

// // cipher.setAAD(Buffer.from(aad, "utf8"));

// // const encrypted = Buffer.concat([
// //   cipher.update(Buffer.from(plaintext, "utf8")),
// //   cipher.final(),
// // ]);

// // const authTag = cipher.getAuthTag();

// // const ciphertext = encrypted.toString("base64");
// // const ivEncoded = iv.toString("base64");
// // const authTagEncoded = authTag.toString("base64");

// // const decipher = createDecipheriv("aes-256-gcm", keyMaterial, iv);

// // decipher.setAAD(Buffer.from(aad, "utf8"));

// // decipher.setAuthTag(authTag);

// // const decrypted = Buffer.concat([
// //   decipher.update(ciphertext),
// //   decipher.final(),
// // ]);

// import {
//   createCipheriv,
//   createDecipheriv,
//   randomBytes,
// } from "node:crypto";

// import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";
// import type { KeyMaterialProvider } from "../interfaces/key-material.provider.interface.js";

// import {
//   AES_256_GCM_AUTH_TAG_LENGTH,
//   AES_256_GCM_IV_LENGTH,
//   AES_256_GCM_KEY_LENGTH,
// } from "../../constants/encryption.constants.js";

// import {
//   CryptoEncoding,
//   EncryptionAlgorithm,
// } from "../../domain/enums/index.js";

// import type {
//   DecryptRequest,
//   DecryptResult,
//   EncryptRequest,
//   EncryptResult,
// } from "../../types/encryption.types.js";

// import {
//   CryptoOperationError,
//   InvalidCiphertextError,
// } from "../../errors/index.js";

// import { canonicalizeSecurityContext } from "../../utils/security-context.util.js";

// export class LocalCryptoProvider implements CryptoProvider {
//   constructor(
//     private readonly keyMaterialProvider: KeyMaterialProvider,
//   ) {}

//   async encrypt(
//     request: EncryptRequest,
//   ): Promise<EncryptResult> {
//     if (
//       request.algorithm !==
//       EncryptionAlgorithm.AES_256_GCM
//     ) {
//       throw new CryptoOperationError(
//         `Unsupported encryption algorithm: ${request.algorithm}`,
//       );
//     }

//     try {
//       const keyMaterial =
//         await this.keyMaterialProvider.getKeyMaterial(
//           request.context.organizationId ?? "",
//           1,
//         );

//       this.validateKeyMaterial(keyMaterial);

//       const iv = randomBytes(
//         AES_256_GCM_IV_LENGTH,
//       );

//       const aad =
//         canonicalizeSecurityContext(
//           request.context,
//         );

//       const cipher = createCipheriv(
//         "aes-256-gcm",
//         keyMaterial,
//         iv,
//         {
//           authTagLength:
//             AES_256_GCM_AUTH_TAG_LENGTH,
//         },
//       );

//       cipher.setAAD(
//         Buffer.from(aad, "utf8"),
//       );

//       const encrypted = Buffer.concat([
//         cipher.update(
//           Buffer.from(
//             request.plaintext,
//             "utf8",
//           ),
//         ),
//         cipher.final(),
//       ]);

//       const authTag =
//         cipher.getAuthTag();

//       return {
//         ciphertext:
//           encrypted.toString("base64"),

//         algorithm:
//           EncryptionAlgorithm.AES_256_GCM,

//         encoding:
//           request.encoding ??
//           CryptoEncoding.BASE64,

//         iv: iv.toString("base64"),

//         authTag:
//           authTag.toString("base64"),

//         keyId:
//           request.context.organizationId ?? "",

//         keyVersion: 1,
//       };
//     } catch (error) {
//       if (
//         error instanceof CryptoOperationError
//       ) {
//         throw error;
//       }

//       throw new CryptoOperationError(
//         "Encryption operation failed",
//         error,
//       );
//     }
//   }

//   async decrypt(
//     request: DecryptRequest,
//   ): Promise<DecryptResult> {
//     if (
//       request.algorithm !==
//       EncryptionAlgorithm.AES_256_GCM
//     ) {
//       throw new CryptoOperationError(
//         `Unsupported encryption algorithm: ${request.algorithm}`,
//       );
//     }

//     try {
//       const keyMaterial =
//         await this.keyMaterialProvider.getKeyMaterial(
//           request.keyId,
//           request.keyVersion,
//         );

//       this.validateKeyMaterial(
//         keyMaterial,
//       );

//       const iv =
//         this.decodeBase64(
//           request.iv,
//         );

//       const authTag =
//         this.decodeBase64(
//           request.authTag,
//         );

//       const ciphertext =
//         this.decodeBase64(
//           request.ciphertext,
//         );

//       this.validateIv(iv);

//       this.validateAuthTag(
//         authTag,
//       );

//       this.validateCiphertext(
//         ciphertext,
//       );

//       const aad =
//         canonicalizeSecurityContext(
//           request.context,
//         );

//       const decipher =
//         createDecipheriv(
//           "aes-256-gcm",
//           keyMaterial,
//           iv,
//           {
//             authTagLength:
//               AES_256_GCM_AUTH_TAG_LENGTH,
//           },
//         );

//       decipher.setAAD(
//         Buffer.from(aad, "utf8"),
//       );

//       decipher.setAuthTag(
//         authTag,
//       );

//       const decrypted =
//         Buffer.concat([
//           decipher.update(
//             ciphertext,
//           ),
//           decipher.final(),
//         ]);

//       return {
//         plaintext:
//           decrypted.toString("utf8"),
//       };
//     } catch (error) {
//       if (
//         error instanceof InvalidCiphertextError
//       ) {
//         throw error;
//       }

//       if (
//         error instanceof CryptoOperationError
//       ) {
//         throw error;
//       }

//       throw new InvalidCiphertextError(
//         "Unable to decrypt encrypted data",
//       );
//     }
//   }

//   private validateKeyMaterial(
//     keyMaterial: Buffer,
//   ): void {
//     if (
//       !Buffer.isBuffer(keyMaterial)
//     ) {
//       throw new CryptoOperationError(
//         "Key material must be a Buffer",
//       );
//     }

//     if (
//       keyMaterial.length !==
//       AES_256_GCM_KEY_LENGTH
//     ) {
//       throw new CryptoOperationError(
//         `Invalid AES-256 key length. Expected ${AES_256_GCM_KEY_LENGTH} bytes.`,
//       );
//     }
//   }

//   private decodeBase64(
//     value: string,
//   ): Buffer {
//     if (
//       typeof value !== "string" ||
//       value.length === 0
//     ) {
//       throw new InvalidCiphertextError(
//         "Invalid encrypted value",
//       );
//     }

//     try {
//       return Buffer.from(
//         value,
//         "base64",
//       );
//     } catch {
//       throw new InvalidCiphertextError(
//         "Invalid base64 encoded value",
//       );
//     }
//   }

//   private validateIv(
//     iv: Buffer,
//   ): void {
//     if (
//       iv.length !==
//       AES_256_GCM_IV_LENGTH
//     ) {
//       throw new InvalidCiphertextError(
//         "Invalid encryption IV",
//       );
//     }
//   }

//   private validateAuthTag(
//     authTag: Buffer,
//   ): void {
//     if (
//       authTag.length !==
//       AES_256_GCM_AUTH_TAG_LENGTH
//     ) {
//       throw new InvalidCiphertextError(
//         "Invalid authentication tag",
//       );
//     }
//   }

//   private validateCiphertext(
//     ciphertext: Buffer,
//   ): void {
//     if (ciphertext.length === 0) {
//       throw new InvalidCiphertextError(
//         "Ciphertext cannot be empty",
//       );
//     }
//   }
// }

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";
interface LocalEncryptRequest {
  plaintext: string;
  algorithm: EncryptionAlgorithm;
  context: SecurityContext;
  keyMaterial: Buffer;
  keyId: string;
  keyVersion: number;
  encoding?: CryptoEncoding;
}

interface LocalDecryptRequest {
  ciphertext: string;
  algorithm: EncryptionAlgorithm;
  encoding: CryptoEncoding;
  iv: string;
  authTag: string;
  keyId: string;
  keyVersion: number;
  context: SecurityContext;
  keyMaterial: Buffer;
}
import {
  AES_256_GCM_AUTH_TAG_LENGTH,
  AES_256_GCM_IV_LENGTH,
  AES_256_GCM_KEY_LENGTH,
} from "../../constants/encryption.constants.js";

import {
  CryptoEncoding,
  EncryptionAlgorithm,
} from "../../domain/enums/index.js";

import type {
  DecryptRequest,
  DecryptResult,
  EncryptRequest,
  EncryptResult,
} from "../../types/encryption.types.js";

import {
  CryptoOperationError,
  InvalidCiphertextError,
} from "../../errors/index.js";

import { canonicalizeSecurityContext } from "../../utils/security-context.util.js";

import type { KeyMaterialProvider } from "../interfaces/key-material.provider.interface.js";
import { SecurityContext } from "../../domain/models/security-context.js";

// export class LocalCryptoProvider implements CryptoProvider {
export class LocalCryptoProvider {
  constructor(private readonly keyMaterialProvider: KeyMaterialProvider) {}

  async encrypt(request: EncryptRequest): Promise<EncryptResult> {
    this.validateEncryptionAlgorithm(request.algorithm);

    try {
      const keyMaterial = await this.keyMaterialProvider.getKeyMaterial(
        request.keyId,
        request.keyVersion,
      );

      this.validateKeyMaterial(keyMaterial);

      const iv = randomBytes(AES_256_GCM_IV_LENGTH);

      const aad = canonicalizeSecurityContext(request.context);

      const cipher = createCipheriv("aes-256-gcm", keyMaterial, iv, {
        authTagLength: AES_256_GCM_AUTH_TAG_LENGTH,
      });

      cipher.setAAD(Buffer.from(aad, "utf8"));

      const plaintext = Buffer.from(request.plaintext, "utf8");

      const encrypted = Buffer.concat([
        cipher.update(plaintext),
        cipher.final(),
      ]);

      const authTag = cipher.getAuthTag();

      return {
        ciphertext: encrypted.toString("base64"),

        algorithm: EncryptionAlgorithm.AES_256_GCM,

        encoding: request.encoding ?? CryptoEncoding.BASE64,

        iv: iv.toString("base64"),

        authTag: authTag.toString("base64"),

        keyId: request.keyId,

        keyVersion: request.keyVersion,
      };
    } catch (error) {
      if (error instanceof CryptoOperationError) {
        throw error;
      }

      throw new CryptoOperationError("Encryption operation failed", error);
    }
  }

  async decrypt(request: DecryptRequest): Promise<DecryptResult> {
    this.validateEncryptionAlgorithm(request.algorithm);

    try {
      const keyMaterial = await this.keyMaterialProvider.getKeyMaterial(
        request.keyId,
        request.keyVersion,
      );

      this.validateKeyMaterial(keyMaterial);

      const iv = this.decodeBase64(request.iv);

      const authTag = this.decodeBase64(request.authTag);

      const ciphertext = this.decodeBase64(request.ciphertext);

      this.validateIv(iv);

      this.validateAuthTag(authTag);

      this.validateCiphertext(ciphertext);

      const aad = canonicalizeSecurityContext(request.context);

      const decipher = createDecipheriv("aes-256-gcm", keyMaterial, iv, {
        authTagLength: AES_256_GCM_AUTH_TAG_LENGTH,
      });

      decipher.setAAD(Buffer.from(aad, "utf8"));

      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);

      return {
        plaintext: decrypted.toString("utf8"),
      };
    } catch (error) {
      if (error instanceof InvalidCiphertextError) {
        throw error;
      }

      if (error instanceof CryptoOperationError) {
        throw error;
      }

      throw new InvalidCiphertextError("Unable to decrypt encrypted data");
    }
  }

  private validateEncryptionAlgorithm(algorithm: EncryptionAlgorithm): void {
    if (algorithm !== EncryptionAlgorithm.AES_256_GCM) {
      throw new CryptoOperationError(
        `Unsupported encryption algorithm: ${algorithm}`,
      );
    }
  }

  private validateKeyMaterial(keyMaterial: Buffer): void {
    if (!Buffer.isBuffer(keyMaterial)) {
      throw new CryptoOperationError("Key material must be a Buffer");
    }

    if (keyMaterial.length !== AES_256_GCM_KEY_LENGTH) {
      throw new CryptoOperationError(
        `Invalid AES-256 key length. Expected ${AES_256_GCM_KEY_LENGTH} bytes.`,
      );
    }
  }

  private decodeBase64(value: string): Buffer {
    if (typeof value !== "string" || value.length === 0) {
      throw new InvalidCiphertextError("Invalid encrypted value");
    }

    try {
      return Buffer.from(value, "base64");
    } catch {
      throw new InvalidCiphertextError("Invalid base64 encoded value");
    }
  }

  private validateIv(iv: Buffer): void {
    if (iv.length !== AES_256_GCM_IV_LENGTH) {
      throw new InvalidCiphertextError("Invalid encryption IV");
    }
  }

  private validateAuthTag(authTag: Buffer): void {
    if (authTag.length !== AES_256_GCM_AUTH_TAG_LENGTH) {
      throw new InvalidCiphertextError("Invalid authentication tag");
    }
  }

  private validateCiphertext(ciphertext: Buffer): void {
    if (ciphertext.length === 0) {
      throw new InvalidCiphertextError("Ciphertext cannot be empty");
    }
  }
}
