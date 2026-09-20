// import { EncryptionService } from "./application/services/encryption.service.js";
// import { LocalKeyProvider } from "./providers/local/local-key.provider.js";
// import { LocalKeyMaterialProvider } from "./providers/local/local-key-material.provider.js";
// import { LocalCryptoProvider } from "./providers/local/local-crypto.provider.js";

// const keyProvider = new LocalKeyProvider();

// const keyMaterialProvider = new LocalKeyMaterialProvider();

// const cryptoProvider = new LocalCryptoProvider();

// export const securityCore = {
//   keyProvider,
//   keyMaterialProvider,
//   cryptoProvider,

//   encryptionService: new EncryptionService(
//     keyProvider,
//     keyMaterialProvider,
//     cryptoProvider,
//   ),
// };

import { EncryptionService } from "./application/services/encryption.service.js";

import { LocalKeyProvider } from "./providers/local/local-key.provider.js";
import { LocalKeyMaterialProvider } from "./providers/local/local-key-material.provider.js";
import { LocalSigningKeyProvider } from "./providers/local/local-signing-key.provider.js";
import { LocalHmacKeyProvider } from "./providers/local/local-hmac-key.provider.js";
import { LocalCryptoProvider } from "./providers/local/local-crypto.provider.js";

import { SecurityContextValidator } from "./application/services/security-context-validator.service.js";
import { SigningService } from "./application/services/signing.service.js";
import { SecurityBoundaryValidator } from "./application/services/security-boundary-validator.service.js";
import { HmacService } from "./application/services/hmac.service.js";
// import { SecurityBoundaryValidator } from "./application/services/security-boundary-validator.service.js";
const keyProvider = new LocalKeyProvider();

const keyMaterialProvider = new LocalKeyMaterialProvider();

const signingKeyProvider = new LocalSigningKeyProvider();

const hmacKeyProvider = new LocalHmacKeyProvider();
const securityBoundaryValidator = new SecurityBoundaryValidator();

const cryptoProvider = new LocalCryptoProvider(
  signingKeyProvider,
  hmacKeyProvider,
);
const signingService = new SigningService(
  cryptoProvider,
  securityBoundaryValidator,
);

const hmacService = new HmacService(cryptoProvider, securityBoundaryValidator);
const securityContextValidator = new SecurityContextValidator();

export const securityCore = {
  keyProvider,
  keyMaterialProvider,
  securityBoundaryValidator,
  signingKeyProvider,
  hmacKeyProvider,
  cryptoProvider,
  securityContextValidator,
  signingService,
  hmacService,
  encryptionService: new EncryptionService(
    keyProvider,
    keyMaterialProvider,
    cryptoProvider,
    securityBoundaryValidator,
  ),
};
