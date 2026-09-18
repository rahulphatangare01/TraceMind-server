import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createHash, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";
import {
  AES_256_GCM_AUTH_TAG_LENGTH,
  AES_256_GCM_IV_LENGTH,
  AES_256_GCM_KEY_LENGTH,
} from "../../constants/encryption.constants.js";

import {
  CryptoEncoding,
  EncryptionAlgorithm,
  HashAlgorithm,
} from "../../domain/enums/index.js";
import type {
  HashRequest,
  HashResult,
  VerifyHashRequest,
  VerifyHashResult,
} from "../../types/index.js";
import {
  CryptoOperationError,
  InvalidCiphertextError,
} from "../../errors/index.js";

import { canonicalizeSecurityContext } from "../../utils/security-context.util.js";
import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";
import type {
  EncryptResult,
  DecryptResult,
} from "../../types/encryption.types.js";

import type {
  LocalEncryptRequest,
  LocalDecryptRequest,
} from "./local-crypto.types.js";

export class LocalCryptoProvider {
  // private getNodeHashEncoding(
  //   encoding: CryptoEncoding,
  // ): "hex" | "base64" | "base64url" {
  //   switch (encoding) {
  //     case CryptoEncoding.HEX:
  //       return "hex";

  //     case CryptoEncoding.BASE64:
  //       return "base64";

  //     case CryptoEncoding.BASE64URL:
  //       return "base64url";

  //     default:
  //       throw new Error(`Unsupported hash encoding: ${encoding}`);
  //   }
  // }
  private getNodeHashEncoding(
    encoding: CryptoEncoding,
  ): "hex" | "base64" | "base64url" {
    switch (encoding) {
      case CryptoEncoding.HEX:
        return "hex";

      case CryptoEncoding.BASE64:
        return "base64";

      case CryptoEncoding.BASE64URL:
        return "base64url";

      default:
        throw new Error(`Unsupported hash encoding: ${encoding}`);
    }
  }
  async encrypt(request: LocalEncryptRequest): Promise<EncryptResult> {
    this.validateAlgorithm(request.algorithm);

    this.validateKeyMaterial(request.keyMaterial);

    try {
      const iv = randomBytes(AES_256_GCM_IV_LENGTH);

      const aad = canonicalizeSecurityContext(request.context);

      const cipher = createCipheriv("aes-256-gcm", request.keyMaterial, iv, {
        authTagLength: AES_256_GCM_AUTH_TAG_LENGTH,
      });

      cipher.setAAD(Buffer.from(aad, "utf8"));

      const plaintextBuffer = Buffer.from(request.plaintext, "utf8");

      const encrypted = Buffer.concat([
        cipher.update(plaintextBuffer),
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

  async decrypt(request: LocalDecryptRequest): Promise<DecryptResult> {
    this.validateAlgorithm(request.algorithm);

    this.validateKeyMaterial(request.keyMaterial);

    try {
      const iv = this.decodeBase64(request.iv);

      const authTag = this.decodeBase64(request.authTag);

      const ciphertext = this.decodeBase64(request.ciphertext);

      this.validateIv(iv);

      this.validateAuthTag(authTag);

      this.validateCiphertext(ciphertext);

      const aad = canonicalizeSecurityContext(request.context);

      const decipher = createDecipheriv(
        "aes-256-gcm",
        request.keyMaterial,
        iv,
        {
          authTagLength: AES_256_GCM_AUTH_TAG_LENGTH,
        },
      );

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

      throw new InvalidCiphertextError("Unable to decrypt encrypted data");
    }
  }
  // async hash(request: HashRequest): Promise<HashResult> {
  //   switch (request.algorithm) {
  //     case HashAlgorithm.ARGON2ID: {
  //       const hash = await argon2.hash(request.value, {
  //         type: argon2.argon2id,
  //       });

  //       return {
  //         hash,
  //         algorithm: HashAlgorithm.ARGON2ID,
  //         encoding: CryptoEncoding.UTF8,
  //       };
  //     }

  //     case HashAlgorithm.SHA_256: {
  //       const encoding = request.encoding ?? CryptoEncoding.HEX;

  //       const hash = createHash("sha256")
  //         .update(Buffer.from(request.value, "utf8"))
  //         .digest(this.getNodeHashEncoding(encoding));

  //       return {
  //         hash,
  //         algorithm: HashAlgorithm.SHA_256,
  //         encoding,
  //       };
  //     }

  //     default:
  //       throw new Error(`Unsupported hash algorithm: ${request.algorithm}`);
  //   }
  // }
  async hash(request: HashRequest): Promise<HashResult> {
    switch (request.algorithm) {
      case HashAlgorithm.ARGON2ID: {
        const hash = await argon2.hash(request.value, {
          type: argon2.argon2id,
        });

        return {
          hash,
          algorithm: HashAlgorithm.ARGON2ID,
          encoding: CryptoEncoding.UTF8,
        };
      }

      case HashAlgorithm.SHA_256: {
        const encoding = request.encoding ?? CryptoEncoding.HEX;

        const hash = createHash("sha256")
          .update(Buffer.from(request.value, "utf8"))
          .digest(this.getNodeHashEncoding(encoding));

        return {
          hash,
          algorithm: HashAlgorithm.SHA_256,
          encoding,
        };
      }

      default:
        throw new Error(`Unsupported hash algorithm: ${request.algorithm}`);
    }
  }
  private validateAlgorithm(algorithm: EncryptionAlgorithm): void {
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

  // async verifyHash(request: VerifyHashRequest): Promise<VerifyHashResult> {
  //   switch (request.algorithm) {
  //     case HashAlgorithm.ARGON2ID: {
  //       try {
  //         const valid = await argon2.verify(request.hash, request.value);

  //         return { valid };
  //       } catch {
  //         return { valid: false };
  //       }
  //     }

  //     case HashAlgorithm.SHA_256: {
  //       const encoding = request.encoding ?? CryptoEncoding.HEX;

  //       const generatedHash = createHash("sha256")
  //         .update(Buffer.from(request.value, "utf8"))
  //         .digest(this.getNodeHashEncoding(encoding));

  //       const expected = Buffer.from(generatedHash, "utf8");

  //       const actual = Buffer.from(request.hash, "utf8");

  //       if (expected.length !== actual.length) {
  //         return { valid: false };
  //       }

  //       return {
  //         valid: timingSafeEqual(expected, actual),
  //       };
  //     }

  //     default:
  //       throw new Error(`Unsupported hash algorithm: ${request.algorithm}`);
  //   }
  // }

  async verifyHash(request: VerifyHashRequest): Promise<VerifyHashResult> {
    switch (request.algorithm) {
      case HashAlgorithm.ARGON2ID: {
        try {
          const valid = await argon2.verify(request.hash, request.value);

          return { valid };
        } catch {
          return { valid: false };
        }
      }

      case HashAlgorithm.SHA_256: {
        const encoding = request.encoding ?? CryptoEncoding.HEX;

        const generatedHash = createHash("sha256")
          .update(Buffer.from(request.value, "utf8"))
          .digest(this.getNodeHashEncoding(encoding));

        const expected = Buffer.from(generatedHash, "utf8");
        const actual = Buffer.from(request.hash, "utf8");

        if (expected.length !== actual.length) {
          return { valid: false };
        }

        return {
          valid: timingSafeEqual(expected, actual),
        };
      }

      default:
        throw new Error(`Unsupported hash algorithm: ${request.algorithm}`);
    }
  }
}
