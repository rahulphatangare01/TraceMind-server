import type {
  VerifySignatureRequest,
  VerifySignatureResult,
} from "../../types/signing.types.js";

import type { CryptoProvider } from "../interfaces/crypto.provider.interface.js";
import { SecurityServiceValidationService } from "./security-service-validation.service.js";

export class SecurityServiceSignatureVerificationApi {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly validationService: SecurityServiceValidationService,
  ) {}

  async verifySignature(
    request: VerifySignatureRequest,
  ): Promise<VerifySignatureResult> {
    // this.validationService.validateVerifySignatureRequest(request);
    // return this.cryptoProvider.verifySignature(request);
    const context =
      this.validationService.validateVerifySignatureRequest(request);

    return this.cryptoProvider.verifySignature({
      ...request,
      context,
    });
  }
}
