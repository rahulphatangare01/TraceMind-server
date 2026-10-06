import { EncryptionService } from "./application/services/encryption.service.js";
import { SigningService } from "./application/services/signing.service.js";
import { HmacService } from "./application/services/hmac.service.js";

import { SecurityContextValidator } from "./application/services/security-context-validator.service.js";
import { SecurityBoundaryValidator } from "./application/services/security-boundary-validator.service.js";
import { SecurityServiceValidationService } from "./application/services/security-service-validation.service.js";
import { SecurityServiceEncryptionApi } from "./application/services/security-service-encryption-api.service.js";

import { LocalKeyProvider } from "./providers/local/local-key.provider.js";
import { LocalKeyMaterialProvider } from "./providers/local/local-key-material.provider.js";
import { LocalSigningKeyProvider } from "./providers/local/local-signing-key.provider.js";
import { LocalHmacKeyProvider } from "./providers/local/local-hmac-key.provider.js";
import { LocalCryptoProvider } from "./providers/local/local-crypto.provider.js";
// import { SecurityServiceDecryptionApi } from "./application/services/security-service-decryption-api.service.js";
// import { SecurityServiceHashingApi } from "./application/services/security-service-hashing-api.service.js";
// import { SecurityServiceHashVerificationApi } from "./application/services/security-service-hash-verification-api.service.js";
// import { SecurityServiceSigningApi } from "./application/services/security-service-signing-api.service.js";
import {
  SecurityServiceSignatureVerificationApi,
  SecurityServiceSigningApi,
  SecurityServiceDecryptionApi,
  SecurityServiceHashingApi,
  SecurityServiceHashVerificationApi,
} from "./application/services";
// --------------------------------------------------
// 1. Local providers
// --------------------------------------------------

const keyProvider = new LocalKeyProvider();

const keyMaterialProvider = new LocalKeyMaterialProvider();

const signingKeyProvider = new LocalSigningKeyProvider();

const hmacKeyProvider = new LocalHmacKeyProvider();

// --------------------------------------------------
// 2. Validators
// --------------------------------------------------

const securityContextValidator = new SecurityContextValidator();

const securityBoundaryValidator = new SecurityBoundaryValidator();

// --------------------------------------------------
// 3. Crypto provider
// --------------------------------------------------

const cryptoProvider = new LocalCryptoProvider(
  signingKeyProvider,
  hmacKeyProvider,
);

// --------------------------------------------------
// 4. Application services
// --------------------------------------------------

const encryptionService = new EncryptionService(
  keyProvider,
  keyMaterialProvider,
  cryptoProvider,
  securityBoundaryValidator,
);

const signingService = new SigningService(
  cryptoProvider,
  securityBoundaryValidator,
);

const hmacService = new HmacService(cryptoProvider, securityBoundaryValidator);

// --------------------------------------------------
// 5. Security Service validation
// --------------------------------------------------

const securityServiceValidation = new SecurityServiceValidationService(
  securityContextValidator,
  securityBoundaryValidator,
);

// --------------------------------------------------
// 6. Security Service public API
// --------------------------------------------------

const securityServiceEncryptionApi = new SecurityServiceEncryptionApi(
  encryptionService,
  securityServiceValidation,
);

const securityServiceDecryptionApi = new SecurityServiceDecryptionApi(
  encryptionService,
  securityServiceValidation,
);

const securityServiceHashingApi = new SecurityServiceHashingApi(
  cryptoProvider,
  securityServiceValidation,
);
const securityServiceHashVerificationApi =
  new SecurityServiceHashVerificationApi(
    cryptoProvider,
    securityServiceValidation,
  );

const securityServiceSigningApi = new SecurityServiceSigningApi(
  cryptoProvider,
  securityServiceValidation,
);

const securityServiceSignatureVerificationApi =
  new SecurityServiceSignatureVerificationApi(
    cryptoProvider,
    securityServiceValidation,
  );

// --------------------------------------------------
// 7. Security Core container
// --------------------------------------------------

export const securityCore = {
  // Providers
  keyProvider,
  keyMaterialProvider,
  signingKeyProvider,
  hmacKeyProvider,
  cryptoProvider,
  // SecurityServiceDecryptionApi,
  // Validators
  securityContextValidator,
  securityBoundaryValidator,

  // Application services
  encryptionService,
  signingService,
  hmacService,

  // Security Service API
  securityServiceValidation,
  securityServiceEncryptionApi,
  securityServiceDecryptionApi,
  securityServiceHashingApi,
  securityServiceHashVerificationApi,
  securityServiceSigningApi,
  securityServiceSignatureVerificationApi,
};
