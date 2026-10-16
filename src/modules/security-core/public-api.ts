/**
 * Curated Security Core contracts for internal module consumers.
 *
 * Intentionally excludes the Security Core container and concrete providers.
 * Keep product modules dependent on these contracts rather than provider
 * implementation details.
 */
export type { SecurityService } from "./application/interfaces/security.service.interface.js";
export type { SecurityKeyManagementService } from "./application/interfaces/security-key-management.service.interface.js";
export type { CreateKeyRequest } from "./application/interfaces/key.provider.interface.js";

export type {
  SecurityContext,
  SecurityKey,
  SecurityKeyVersion,
} from "./domain/models/index.js";

export {
  CryptoEncoding,
  DataClassification,
  EncryptionAlgorithm,
  HashAlgorithm,
  HmacAlgorithm,
  KeyPurpose,
  KeyStatus,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "./domain/enums/index.js";

export type { KeyReference } from "./types/key.types.js";

export type {
  EncryptRequest,
  EncryptResult,
  DecryptRequest,
  DecryptResult,
} from "./types/encryption.types.js";

export type {
  HashRequest,
  HashResult,
  VerifyHashRequest,
  VerifyHashResult,
} from "./types/hashing.types.js";

export type {
  SignRequest,
  SignResult,
  VerifySignatureRequest,
  VerifySignatureResult,
} from "./types/signing.types.js";

export type {
  CreateHmacRequest,
  CreateHmacResult,
  VerifyHmacRequest,
  VerifyHmacResult,
} from "./types/hmac.types.js";
