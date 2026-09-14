import type {
  CreateHmacRequest,
  CreateHmacResult,
  DecryptRequest,
  DecryptResult,
  EncryptRequest,
  EncryptResult,
  HashRequest,
  HashResult,
  SignRequest,
  SignResult,
  VerifyHashRequest,
  VerifyHashResult,
  VerifyHmacRequest,
  VerifyHmacResult,
  VerifySignatureRequest,
  VerifySignatureResult,
} from "../../types/index";

export interface CryptoProvider {
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
