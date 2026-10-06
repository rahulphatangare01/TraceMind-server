import type { SecurityContextValidator } from "./security-context-validator.service.js";

import type { SecurityBoundaryValidator } from "./security-boundary-validator.service.js";
("");

import { SecurityServiceValidationError } from "../../errors/security-service-validation.error.js";
import {
  CryptoEncoding,
  EncryptionAlgorithm,
  HashAlgorithm,
  SignatureAlgorithm,
} from "../../domain/enums/index.js";

type Validator = {
  validate(context: unknown): unknown;
};

export class SecurityServiceValidationService {
  private readonly contextValidator: Validator;
  private readonly boundaryValidator: Validator;

  constructor(
    contextValidator: SecurityContextValidator,
    boundaryValidator: SecurityBoundaryValidator,
  ) {
    this.contextValidator = contextValidator as unknown as Validator;
    this.boundaryValidator = boundaryValidator as unknown as Validator;
  }
  private validateSignatureAlgorithm(value: unknown): void {
    if (
      typeof value !== "string" ||
      !Object.values(SignatureAlgorithm).includes(value as SignatureAlgorithm)
    ) {
      throw new SecurityServiceValidationError(
        "Unsupported signature algorithm",
        {
          code: "SECURITY_SERVICE_VALIDATION_ERROR",
        },
      );
    }
  }

  private validateCryptoEncoding(value: unknown): void {
    if (
      typeof value !== "string" ||
      !Object.values(CryptoEncoding).includes(value as CryptoEncoding)
    ) {
      throw new SecurityServiceValidationError("Unsupported crypto encoding", {
        code: "SECURITY_SERVICE_VALIDATION_ERROR",
      });
    }
  }
  validateEncryptRequest(request: unknown): void {
    const data = this.requireObject(request, "Encryption request");

    this.requireString(data, "plaintext", "Encryption plaintext");
    this.requireString(data, "keyId", "Encryption key ID");
    this.validateContext(data.context);
  }

  // validateDecryptRequest(request: unknown): void {
  //   const data = this.requireObject(request, "Decryption request");

  //   this.requireString(data, "encrypted", "Encrypted value");
  //   this.requireString(data, "keyId", "Decryption key ID");
  //   this.validateContext(data.context);
  // }
  validateDecryptRequest(request: unknown): void {
    const data = this.requireObject(request, "Decryption request");

    this.requireString(data, "ciphertext", "Ciphertext");
    this.requireString(data, "iv", "Initialization vector");
    this.requireString(data, "authTag", "Authentication tag");
    this.requireString(data, "keyId", "Decryption key ID");

    if (
      !Object.values(EncryptionAlgorithm).includes(
        data.algorithm as EncryptionAlgorithm,
      )
    ) {
      this.fail("Unsupported encryption algorithm.");
    }

    if (
      !Object.values(CryptoEncoding).includes(data.encoding as CryptoEncoding)
    ) {
      this.fail("Unsupported encryption encoding.");
    }

    this.requirePositiveInteger(data, "keyVersion", "Key version");
    this.validateContext(data.context);
  }
  // validateHashRequest(request: unknown): void {
  //   const data = this.requireObject(request, "Hash request");

  //   this.requireString(data, "value", "Hash value");
  //   this.requireString(data, "algorithm", "Hash algorithm");
  // }
  validateHashRequest(request: unknown): void {
    const data = this.requireObject(request, "Hash request");

    this.requireString(data, "value", "Hash value");

    if (
      !Object.values(HashAlgorithm).includes(data.algorithm as HashAlgorithm)
    ) {
      this.fail("Unsupported hash algorithm.");
    }

    if (
      data.encoding !== undefined &&
      !Object.values(CryptoEncoding).includes(data.encoding as CryptoEncoding)
    ) {
      this.fail("Unsupported hash encoding.");
    }
  }
  // validateVerifyHashRequest(request: unknown): void {
  //   const data = this.requireObject(request, "Hash verification request");

  //   this.requireString(data, "value", "Value to verify");
  //   this.requireString(data, "hash", "Hash");
  //   this.requireString(data, "algorithm", "Hash algorithm");
  // }
  validateVerifyHashRequest(request: unknown): void {
    const data = this.requireObject(request, "Hash verification request");

    this.requireString(data, "value", "Value to verify");
    this.requireString(data, "hash", "Hash");

    if (
      !Object.values(HashAlgorithm).includes(data.algorithm as HashAlgorithm)
    ) {
      this.fail("Unsupported hash algorithm.");
    }

    if (
      data.encoding !== undefined &&
      !Object.values(CryptoEncoding).includes(data.encoding as CryptoEncoding)
    ) {
      this.fail("Unsupported hash encoding.");
    }
  }

  // validateSignRequest(request: unknown): void {
  //   const data = this.requireObject(request, "Signing request");

  //   this.requireString(data, "payload", "Signing payload");
  //   this.requireString(data, "algorithm", "Signature algorithm");
  //   this.validateContext(data.context);
  // }

  validateSignRequest(request: unknown): void {
    const data = this.requireObject(request, "Signing request");

    this.requireString(data, "payload", "Signing payload");
    this.requireString(data, "algorithm", "Signature algorithm");

    this.validateSignatureAlgorithm(data.algorithm);

    if (data.encoding !== undefined) {
      this.validateCryptoEncoding(data.encoding);
    }

    this.validateContext(data.context);
  }
  validateVerifySignatureRequest(request: unknown): void {
    const data = this.requireObject(request, "Signature verification request");

    this.requireString(data, "payload", "Verification payload");
    this.requireString(data, "signature", "Signature");
    this.requireString(data, "algorithm", "Signature algorithm");
    this.requireString(data, "keyId", "Signing key ID");
    this.requirePositiveInteger(data, "keyVersion", "Key version");
    this.validateContext(data.context);
  }

  validateCreateHmacRequest(request: unknown): void {
    const data = this.requireObject(request, "HMAC creation request");

    this.requireString(data, "payload", "HMAC payload");
    this.requireString(data, "algorithm", "HMAC algorithm");
    this.validateContext(data.context);
  }

  validateVerifyHmacRequest(request: unknown): void {
    const data = this.requireObject(request, "HMAC verification request");

    this.requireString(data, "payload", "HMAC verification payload");
    this.requireString(data, "signature", "HMAC signature");
    this.requireString(data, "algorithm", "HMAC algorithm");
    this.requireString(data, "keyId", "HMAC key ID");
    this.requirePositiveInteger(data, "keyVersion", "Key version");
    this.validateContext(data.context);
  }

  private validateContext(context: unknown): void {
    if (
      context === null ||
      typeof context !== "object" ||
      Array.isArray(context)
    ) {
      this.fail("Security context is required.");
    }

    this.contextValidator.validate(context);
    this.boundaryValidator.validate(context);
  }

  private requireObject(
    request: unknown,
    label: string,
  ): Record<string, unknown> {
    if (
      request === null ||
      typeof request !== "object" ||
      Array.isArray(request)
    ) {
      this.fail(`${label} must be an object.`);
    }

    return request as Record<string, unknown>;
  }

  private requireString(
    data: Record<string, unknown>,
    field: string,
    label: string,
  ): string {
    const value = data[field];

    if (typeof value !== "string" || value.trim().length === 0) {
      this.fail(`${label} is required and must be a non-empty string.`);
    }

    return value;
  }

  private requirePositiveInteger(
    data: Record<string, unknown>,
    field: string,
    label: string,
  ): number {
    const value = data[field];

    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
      this.fail(`${label} must be a positive integer.`);
    }

    return value;
  }

  private fail(message: string): never {
    throw new SecurityServiceValidationError(message, {
      code: "SECURITY_SERVICE_VALIDATION_ERROR",
      details: { layer: "SecurityServiceValidationService" },
    });
  }
}
