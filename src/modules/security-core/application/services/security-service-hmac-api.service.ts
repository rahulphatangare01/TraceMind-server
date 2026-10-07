import type {
  CreateHmacRequest,
  CreateHmacResult,
} from "../../types/hmac.types.js";

import type { CryptoProvider } from "../interfaces/crypto.provider.interface.js";
import { SecurityServiceValidationService } from "./security-service-validation.service.js";

export class SecurityServiceHmacApi {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly validationService: SecurityServiceValidationService,
  ) {}

  async createHmac(request: CreateHmacRequest): Promise<CreateHmacResult> {
    this.validationService.validateCreateHmacRequest(request);

    return this.cryptoProvider.createHmac(request);
  }
}
