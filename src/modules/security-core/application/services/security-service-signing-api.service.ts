import type { SignRequest, SignResult } from "../../types/signing.types.js";

import type { CryptoProvider } from "../interfaces/crypto.provider.interface.js";
import { SecurityServiceValidationService } from "./security-service-validation.service.js";

export class SecurityServiceSigningApi {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly validationService: SecurityServiceValidationService,
  ) {}

  async sign(request: SignRequest): Promise<SignResult> {
    this.validationService.validateSignRequest(request);

    return this.cryptoProvider.sign(request);
  }
}
