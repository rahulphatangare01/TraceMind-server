import type { SecurityService } from "../interfaces/security.service.interface.js";

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

import { SecurityServiceEncryptionApi } from "./security-service-encryption-api.service.js";

import { SecurityServiceDecryptionApi } from "./security-service-decryption-api.service.js";

import { SecurityServiceHashingApi } from "./security-service-hashing-api.service.js";

import { SecurityServiceHashVerificationApi } from "./security-service-hash-verification-api.service.js";

import { SecurityServiceSigningApi } from "./security-service-signing-api.service.js";

import { SecurityServiceSignatureVerificationApi } from "./security-service-signature-verification-api.service.js";

import { SecurityServiceHmacApi } from "./security-service-hmac-api.service.js";

import { SecurityServiceHmacVerificationApi } from "./security-service-hmac-verification-api.service.js";

import { SecurityServiceErrorHandlingService } from "./security-service-error-handling.service.js";

export class SecurityServiceFacade implements SecurityService {
  constructor(
    private readonly encryptionApi: SecurityServiceEncryptionApi,

    private readonly decryptionApi: SecurityServiceDecryptionApi,

    private readonly hashingApi: SecurityServiceHashingApi,

    private readonly hashVerificationApi: SecurityServiceHashVerificationApi,

    private readonly signingApi: SecurityServiceSigningApi,

    private readonly signatureVerificationApi: SecurityServiceSignatureVerificationApi,

    private readonly hmacApi: SecurityServiceHmacApi,

    private readonly hmacVerificationApi: SecurityServiceHmacVerificationApi,

    private readonly errorHandling: SecurityServiceErrorHandlingService,
  ) {}

  async encrypt(request: EncryptRequest): Promise<EncryptResult> {
    return this.errorHandling.executeAsync(() =>
      this.encryptionApi.encrypt(request),
    );
  }

  async decrypt(request: DecryptRequest): Promise<DecryptResult> {
    return this.errorHandling.executeAsync(() =>
      this.decryptionApi.decrypt(request),
    );
  }

  async hash(request: HashRequest): Promise<HashResult> {
    return this.errorHandling.executeAsync(() => this.hashingApi.hash(request));
  }

  async verifyHash(request: VerifyHashRequest): Promise<VerifyHashResult> {
    return this.errorHandling.executeAsync(() =>
      this.hashVerificationApi.verifyHash(request),
    );
  }

  async sign(request: SignRequest): Promise<SignResult> {
    return this.errorHandling.executeAsync(() => this.signingApi.sign(request));
  }

  async verifySignature(
    request: VerifySignatureRequest,
  ): Promise<VerifySignatureResult> {
    return this.errorHandling.executeAsync(() =>
      this.signatureVerificationApi.verifySignature(request),
    );
  }

  async createHmac(request: CreateHmacRequest): Promise<CreateHmacResult> {
    return this.errorHandling.executeAsync(() =>
      this.hmacApi.createHmac(request),
    );
  }

  async verifyHmac(request: VerifyHmacRequest): Promise<VerifyHmacResult> {
    return this.errorHandling.executeAsync(() =>
      this.hmacVerificationApi.verifyHmac(request),
    );
  }
}
