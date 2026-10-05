import type {
  VerifyHashRequest,
  VerifyHashResult,
} from "../../types/hashing.types.js";

import type { CryptoProvider } from "../interfaces/crypto.provider.interface.js";
import { SecurityServiceValidationService } from "./security-service-validation.service.js";

export class SecurityServiceHashVerificationApi {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly validationService: SecurityServiceValidationService,
  ) {}

  async verifyHash(request: VerifyHashRequest): Promise<VerifyHashResult> {
    this.validationService.validateVerifyHashRequest(request);

    return this.cryptoProvider.verifyHash(request);
  }
}
