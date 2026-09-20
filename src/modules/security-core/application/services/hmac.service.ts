import type { CryptoProvider } from "../interfaces/crypto.provider.interface.js";
import { SecurityBoundaryValidator } from "./security-boundary-validator.service.js";

import type {
  CreateHmacRequest,
  CreateHmacResult,
  VerifyHmacRequest,
  VerifyHmacResult,
} from "../../types/hmac.types.js";

export class HmacService {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly securityBoundaryValidator: SecurityBoundaryValidator,
  ) {}

  async createHmac(request: CreateHmacRequest): Promise<CreateHmacResult> {
    const boundaryResult = this.securityBoundaryValidator.validate(
      request.context,
    );

    return this.cryptoProvider.createHmac({
      ...request,
      context: boundaryResult.context,
    });
  }

  async verifyHmac(request: VerifyHmacRequest): Promise<VerifyHmacResult> {
    const boundaryResult = this.securityBoundaryValidator.validate(
      request.context,
    );

    return this.cryptoProvider.verifyHmac({
      ...request,
      context: boundaryResult.context,
    });
  }
}
