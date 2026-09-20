import type { CryptoProvider } from "../interfaces/crypto.provider.interface.js";
import { SecurityBoundaryValidator } from "./security-boundary-validator.service.js";

import type {
  SignRequest,
  SignResult,
  VerifySignatureRequest,
  VerifySignatureResult,
} from "../../types/signing.types.js";

export class SigningService {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly securityBoundaryValidator: SecurityBoundaryValidator,
  ) {}

  async sign(request: SignRequest): Promise<SignResult> {
    const boundaryResult = this.securityBoundaryValidator.validate(
      request.context,
    );

    return this.cryptoProvider.sign({
      ...request,
      context: boundaryResult.context,
    });
  }

  async verifySignature(
    request: VerifySignatureRequest,
  ): Promise<VerifySignatureResult> {
    const boundaryResult = this.securityBoundaryValidator.validate(
      request.context,
    );

    return this.cryptoProvider.verifySignature({
      ...request,
      context: boundaryResult.context,
    });
  }
}
