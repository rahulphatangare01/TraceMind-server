import type { HashRequest, HashResult } from "../../types/hashing.types.js";

import type { CryptoProvider } from "../interfaces/crypto.provider.interface.js";
import { SecurityServiceValidationService } from "./security-service-validation.service.js";

export class SecurityServiceHashingApi {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly validationService: SecurityServiceValidationService,
  ) {}

  async hash(request: HashRequest): Promise<HashResult> {
    this.validationService.validateHashRequest(request);

    return this.cryptoProvider.hash(request);
  }
}
