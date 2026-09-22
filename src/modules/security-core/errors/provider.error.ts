// import { SecurityCoreError } from "./security-core.error.js";

// import type {
//   ProviderErrorCode,
//   ProviderErrorContext,
// } from "../types/provider-error.types.js";

// export class ProviderError extends SecurityCoreError {
//   public readonly providerContext?: ProviderErrorContext;

//   constructor(
//     message: string,
//     code: ProviderErrorCode = ProviderErrorCode.PROVIDER_ERROR,
//     context?: ProviderErrorContext,
//     details?: unknown,
//   ) {
// super(message, {
//   code,
//   details,
// });

//     this.name = "ProviderError";
//     this.providerContext = context;

//     Object.setPrototypeOf(this, new.target.prototype);
//   }
// }

import { SecurityCoreError } from "./security-core.error.js";

import { ProviderErrorCode } from "../types/provider-error.types.js";

export class ProviderError extends SecurityCoreError {
  public readonly code: ProviderErrorCode;

  constructor(
    message: string,
    code: ProviderErrorCode = ProviderErrorCode.PROVIDER_ERROR,
  ) {
    // super(message);
    super(message, {
      code,
    });

    this.name = "ProviderError";
    this.code = code;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
