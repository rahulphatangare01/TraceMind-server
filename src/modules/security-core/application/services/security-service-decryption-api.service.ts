// import type {
//   DecryptRequest,
//   DecryptResult,
// } from "../../types/encryption.types.js";

// import { ENCRYPTION_ENVELOPE_VERSION } from "../../constants/encryption.constants.js";
// import { EncryptionService } from "./encryption.service.js";
// import { SecurityServiceValidationService } from "./security-service-validation.service.js";
// import { serializeEncryptionEnvelope } from "../../utils/encryption-envelope.util.js";
// // import { SecurityServiceDecryptionApi } from "./application/services/security-service-decryption-api.service.js";

// export class SecurityServiceDecryptionApi {
//   constructor(
//     private readonly encryptionService: EncryptionService,
//     private readonly validationService: SecurityServiceValidationService,
//   ) {}

//   async decrypt(request: DecryptRequest): Promise<DecryptResult> {
//     this.validationService.validateDecryptRequest(request);

//     const encryptedEnvelope = serializeEncryptionEnvelope({
//       version: ENCRYPTION_ENVELOPE_VERSION,
//       ciphertext: request.ciphertext,
//       algorithm: request.algorithm,
//       encoding: request.encoding,
//       iv: request.iv,
//       authTag: request.authTag,
//       keyId: request.keyId,
//       keyVersion: request.keyVersion,
//     });

//     const plaintext = await this.encryptionService.decrypt(
//       encryptedEnvelope,
//       request.context,
//     );

//     return { plaintext };
//   }
// }

import type {
  DecryptRequest,
  DecryptResult,
} from "../../types/encryption.types.js";

import { ENCRYPTION_ENVELOPE_VERSION } from "../../constants/encryption.constants.js";
import { EncryptionService } from "./encryption.service.js";
import { SecurityServiceValidationService } from "./security-service-validation.service.js";
import { serializeEncryptionEnvelope } from "../../utils/encryption-envelope.util.js";

export class SecurityServiceDecryptionApi {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly validationService: SecurityServiceValidationService,
  ) {}

  async decrypt(request: DecryptRequest): Promise<DecryptResult> {
    // this.validationService.validateDecryptRequest(request);
    const context = this.validationService.validateDecryptRequest(request);

    const encryptedEnvelope = serializeEncryptionEnvelope({
      version: ENCRYPTION_ENVELOPE_VERSION,
      ciphertext: request.ciphertext,
      algorithm: request.algorithm,
      encoding: request.encoding,
      iv: request.iv,
      authTag: request.authTag,
      keyId: request.keyId,
      keyVersion: request.keyVersion,
    });

    // const plaintext = await this.encryptionService.decrypt(
    //   encryptedEnvelope,
    //   request.context,
    // );
    const plaintext = await this.encryptionService.decrypt(
      encryptedEnvelope,
      context,
    );
    return { plaintext };
  }
}
