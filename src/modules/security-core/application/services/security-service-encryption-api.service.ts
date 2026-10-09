import type { SecurityService } from "../interfaces/security.service.interface.js";
import type {
  EncryptRequest,
  EncryptResult,
} from "../../types/encryption.types.js";

import { EncryptionService } from "./encryption.service.js";
import { SecurityServiceValidationService } from "./security-service-validation.service.js";
import { parseEncryptionEnvelope } from "../../utils/encryption-envelope.util.js";

export class SecurityServiceEncryptionApi {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly validationService: SecurityServiceValidationService,
  ) {}

  async encrypt(request: EncryptRequest): Promise<EncryptResult> {
    // this.validationService.validateEncryptRequest(request);

    // const encryptedEnvelope = await this.encryptionService.encrypt(
    //   request.plaintext,
    //   request.context,
    //   request.keyId,
    // );
    const context = this.validationService.validateEncryptRequest(request);

    const encryptedEnvelope = await this.encryptionService.encrypt(
      request.plaintext,
      context,
      request.keyId,
    );
    const envelope = parseEncryptionEnvelope(encryptedEnvelope);

    return {
      ciphertext: envelope.ciphertext,
      algorithm: envelope.algorithm,
      encoding: envelope.encoding,
      iv: envelope.iv,
      authTag: envelope.authTag,
      keyId: envelope.keyId,
      keyVersion: envelope.keyVersion,
    };
  }
}
