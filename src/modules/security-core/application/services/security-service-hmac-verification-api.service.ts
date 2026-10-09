import type {
  VerifyHmacRequest,
  VerifyHmacResult,
} from "../../types/hmac.types.js";

import type { CryptoProvider } from "../interfaces/crypto.provider.interface.js";
import { SecurityServiceValidationService } from "./security-service-validation.service.js";

export class SecurityServiceHmacVerificationApi {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly validationService: SecurityServiceValidationService,
  ) {}

  async verifyHmac(request: VerifyHmacRequest): Promise<VerifyHmacResult> {
    // this.validationService.validateVerifyHmacRequest(request);
    // return this.cryptoProvider.verifyHmac(request);
    const context = this.validationService.validateVerifyHmacRequest(request);

    return this.cryptoProvider.verifyHmac({
      ...request,
      context,
    });
  }
}
