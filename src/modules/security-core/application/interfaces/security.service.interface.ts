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
} from "../../types";

import type {
  SignRequest,
  SignResult,
  VerifySignatureRequest,
  VerifySignatureResult,
} from "../../types";

import type {
  CreateHmacRequest,
  CreateHmacResult,
  VerifyHmacRequest,
  VerifyHmacResult,
} from "../../types/hmac.types.js";

export interface SecurityService {
  encrypt(request: EncryptRequest): Promise<EncryptResult>;

  decrypt(request: DecryptRequest): Promise<DecryptResult>;

  hash(request: HashRequest): Promise<HashResult>;

  verifyHash(request: VerifyHashRequest): Promise<VerifyHashResult>;

  sign(request: SignRequest): Promise<SignResult>;

  verifySignature(
    request: VerifySignatureRequest,
  ): Promise<VerifySignatureResult>;

  createHmac(request: CreateHmacRequest): Promise<CreateHmacResult>;

  verifyHmac(request: VerifyHmacRequest): Promise<VerifyHmacResult>;
}
