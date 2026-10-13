import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SecurityService } from "../../application/interfaces/security.service.interface.js";

import { SecurityServiceFacade } from "../../application/services/security-service.facade.js";
import { SecurityServiceErrorHandlingService } from "../../application/services/security-service-error-handling.service.js";

import type { SecurityServiceEncryptionApi } from "../../application/services/security-service-encryption-api.service.js";
import type { SecurityServiceDecryptionApi } from "../../application/services/security-service-decryption-api.service.js";
import type { SecurityServiceHashingApi } from "../../application/services/security-service-hashing-api.service.js";
import type { SecurityServiceHashVerificationApi } from "../../application/services/security-service-hash-verification-api.service.js";
import type { SecurityServiceSigningApi } from "../../application/services/security-service-signing-api.service.js";
import type { SecurityServiceSignatureVerificationApi } from "../../application/services/security-service-signature-verification-api.service.js";
import type { SecurityServiceHmacApi } from "../../application/services/security-service-hmac-api.service.js";
import type { SecurityServiceHmacVerificationApi } from "../../application/services/security-service-hmac-verification-api.service.js";

import {
  CryptoEncoding,
  DataClassification,
  EncryptionAlgorithm,
  HashAlgorithm,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../domain/enums/index.js";

import type {
  EncryptRequest,
  EncryptResult,
  DecryptRequest,
  DecryptResult,
} from "../../types/encryption.types.js";

import type {
  HashRequest,
  HashResult,
  VerifyHashRequest,
  VerifyHashResult,
} from "../../types/hashing.types.js";

import type {
  SignRequest,
  SignResult,
  VerifySignatureRequest,
  VerifySignatureResult,
} from "../../types/signing.types.js";

import type {
  CreateHmacRequest,
  CreateHmacResult,
  VerifyHmacRequest,
  VerifyHmacResult,
} from "../../types/hmac.types.js";

import { securityCore } from "../../security-core.container.js";

describe("SecurityService API Contract and Regression", () => {
  const context = {
    scope: SecurityScope.APPLICATION,
    organizationId: "org-test",
    projectId: "project-test",
    applicationId: "application-test",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.SIGNING,
  };

  const encryptRequest: EncryptRequest = {
    plaintext: "TraceMind regression test",
    context,
    encoding: CryptoEncoding.BASE64,
    keyId: "key-test",
  };

  const encryptResult: EncryptResult = {
    ciphertext: "mock-ciphertext",
    algorithm: EncryptionAlgorithm.AES_256_GCM,
    encoding: CryptoEncoding.BASE64,
    iv: "mock-iv",
    authTag: "mock-auth-tag",
    keyId: "key-test",
    keyVersion: 1,
  };

  const decryptRequest: DecryptRequest = {
    ciphertext: encryptResult.ciphertext,
    algorithm: encryptResult.algorithm,
    encoding: encryptResult.encoding,
    iv: encryptResult.iv,
    authTag: encryptResult.authTag,
    keyId: encryptResult.keyId,
    keyVersion: encryptResult.keyVersion,
    context,
  };

  const decryptResult: DecryptResult = {
    plaintext: "TraceMind regression test",
  };

  const hashRequest: HashRequest = {
    value: "TraceMind regression test",
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.HEX,
  };

  const hashResult: HashResult = {
    hash: "mock-hash",
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.HEX,
  };

  const verifyHashRequest: VerifyHashRequest = {
    value: hashRequest.value,
    hash: hashResult.hash,
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.HEX,
  };

  const verifyHashResult: VerifyHashResult = {
    valid: true,
  };

  const signRequest: SignRequest = {
    payload: "TraceMind regression payload",
    algorithm: SignatureAlgorithm.ED25519,
    context,
    encoding: CryptoEncoding.BASE64,
  };

  const signResult: SignResult = {
    signature: "mock-signature",
    algorithm: SignatureAlgorithm.ED25519,
    encoding: CryptoEncoding.BASE64,
    keyId: "signing-key-test",
    keyVersion: 1,
  };

  const verifySignatureRequest: VerifySignatureRequest = {
    payload: signRequest.payload,
    signature: signResult.signature,
    algorithm: signResult.algorithm,
    keyId: signResult.keyId,
    keyVersion: signResult.keyVersion,
    context,
    encoding: signResult.encoding,
  };

  const verifySignatureResult: VerifySignatureResult = {
    valid: true,
  };

  const createHmacRequest: CreateHmacRequest = {
    payload: "TraceMind regression HMAC payload",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
    encoding: CryptoEncoding.BASE64,
  };

  const createHmacResult: CreateHmacResult = {
    signature: "mock-hmac",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    keyId: "hmac-key-test",
    keyVersion: 1,
  };

  const verifyHmacRequest: VerifyHmacRequest = {
    payload: createHmacRequest.payload,
    signature: createHmacResult.signature,
    algorithm: createHmacResult.algorithm,
    keyId: createHmacResult.keyId,
    keyVersion: createHmacResult.keyVersion,
    context,
    encoding: createHmacResult.encoding,
  };

  const verifyHmacResult: VerifyHmacResult = {
    valid: true,
  };

  const encryptionApiMock = {
    encrypt: vi.fn(),
  };

  const decryptionApiMock = {
    decrypt: vi.fn(),
  };

  const hashingApiMock = {
    hash: vi.fn(),
  };

  const hashVerificationApiMock = {
    verifyHash: vi.fn(),
  };

  const signingApiMock = {
    sign: vi.fn(),
  };

  const signatureVerificationApiMock = {
    verifySignature: vi.fn(),
  };

  const hmacApiMock = {
    createHmac: vi.fn(),
  };

  const hmacVerificationApiMock = {
    verifyHmac: vi.fn(),
  };

  const errorHandling = new SecurityServiceErrorHandlingService();

  let service: SecurityService;

  beforeEach(() => {
    vi.resetAllMocks();

    encryptionApiMock.encrypt.mockResolvedValue(encryptResult);
    decryptionApiMock.decrypt.mockResolvedValue(decryptResult);
    hashingApiMock.hash.mockResolvedValue(hashResult);
    hashVerificationApiMock.verifyHash.mockResolvedValue(verifyHashResult);
    signingApiMock.sign.mockResolvedValue(signResult);
    signatureVerificationApiMock.verifySignature.mockResolvedValue(
      verifySignatureResult,
    );
    hmacApiMock.createHmac.mockResolvedValue(createHmacResult);
    hmacVerificationApiMock.verifyHmac.mockResolvedValue(verifyHmacResult);

    service = new SecurityServiceFacade(
      encryptionApiMock as unknown as SecurityServiceEncryptionApi,
      decryptionApiMock as unknown as SecurityServiceDecryptionApi,
      hashingApiMock as unknown as SecurityServiceHashingApi,
      hashVerificationApiMock as unknown as SecurityServiceHashVerificationApi,
      signingApiMock as unknown as SecurityServiceSigningApi,
      signatureVerificationApiMock as unknown as SecurityServiceSignatureVerificationApi,
      hmacApiMock as unknown as SecurityServiceHmacApi,
      hmacVerificationApiMock as unknown as SecurityServiceHmacVerificationApi,
      errorHandling,
    );
  });

  describe("Public contract", () => {
    it("exposes all eight required public operations", () => {
      const operationNames = [
        "encrypt",
        "decrypt",
        "hash",
        "verifyHash",
        "sign",
        "verifySignature",
        "createHmac",
        "verifyHmac",
      ] as const;

      for (const operationName of operationNames) {
        expect(typeof service[operationName]).toBe("function");
      }
    });
  });

  describe("Encryption and decryption regression", () => {
    it("delegates encryption and preserves the result", async () => {
      await expect(service.encrypt(encryptRequest)).resolves.toEqual(
        encryptResult,
      );

      expect(encryptionApiMock.encrypt).toHaveBeenCalledWith(encryptRequest);
    });

    it("delegates decryption and preserves the result", async () => {
      await expect(service.decrypt(decryptRequest)).resolves.toEqual(
        decryptResult,
      );

      expect(decryptionApiMock.decrypt).toHaveBeenCalledWith(decryptRequest);
    });
  });

  describe("Hashing regression", () => {
    it("delegates hashing and preserves the result", async () => {
      await expect(service.hash(hashRequest)).resolves.toEqual(hashResult);

      expect(hashingApiMock.hash).toHaveBeenCalledWith(hashRequest);
    });

    it("delegates hash verification and preserves the result", async () => {
      await expect(service.verifyHash(verifyHashRequest)).resolves.toEqual(
        verifyHashResult,
      );

      expect(hashVerificationApiMock.verifyHash).toHaveBeenCalledWith(
        verifyHashRequest,
      );
    });
  });

  describe("Signing regression", () => {
    it("delegates signing and preserves the result", async () => {
      await expect(service.sign(signRequest)).resolves.toEqual(signResult);

      expect(signingApiMock.sign).toHaveBeenCalledWith(signRequest);
    });

    it("delegates signature verification and preserves the result", async () => {
      await expect(
        service.verifySignature(verifySignatureRequest),
      ).resolves.toEqual(verifySignatureResult);

      expect(signatureVerificationApiMock.verifySignature).toHaveBeenCalledWith(
        verifySignatureRequest,
      );
    });
  });

  describe("HMAC regression", () => {
    it("delegates HMAC creation and preserves the result", async () => {
      await expect(service.createHmac(createHmacRequest)).resolves.toEqual(
        createHmacResult,
      );

      expect(hmacApiMock.createHmac).toHaveBeenCalledWith(createHmacRequest);
    });

    it("delegates HMAC verification and preserves the result", async () => {
      await expect(service.verifyHmac(verifyHmacRequest)).resolves.toEqual(
        verifyHmacResult,
      );

      expect(hmacVerificationApiMock.verifyHmac).toHaveBeenCalledWith(
        verifyHmacRequest,
      );
    });
  });

  describe("Container compatibility regression", () => {
    it("exposes the public facade", () => {
      expect(securityCore.securityService).toBeInstanceOf(
        SecurityServiceFacade,
      );
    });

    it("preserves existing API instances", () => {
      expect(securityCore.securityServiceEncryptionApi).toBeDefined();
      expect(securityCore.securityServiceDecryptionApi).toBeDefined();
      expect(securityCore.securityServiceHashingApi).toBeDefined();
      expect(securityCore.securityServiceHashVerificationApi).toBeDefined();
      expect(securityCore.securityServiceSigningApi).toBeDefined();
      expect(
        securityCore.securityServiceSignatureVerificationApi,
      ).toBeDefined();
      expect(securityCore.securityServiceHmacApi).toBeDefined();
      expect(securityCore.securityServiceHmacVerificationApi).toBeDefined();
    });
  });
});
