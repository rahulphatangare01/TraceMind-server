// import {
//   SecurityCoreError,
//   SecurityCoreErrorOptions,
// } from "./security-core.error.js";

// export class SecurityServiceValidationError extends SecurityCoreError {
//   public readonly code: string;
//   public readonly details?: unknown;
//   constructor(message: string, options: SecurityCoreErrorOptions) {
//     super(message, options);
//     this.name = "SecurityServiceValidationError";
//     this.code = options.code;
//     this.details = options.details;
//     Object.setPrototypeOf(this, new.target.prototype);
//   }
// }
import {
  SecurityCoreError,
  type SecurityCoreErrorOptions,
} from "./security-core.error.js";

export class SecurityServiceValidationError extends SecurityCoreError {
  constructor(message: string, options: SecurityCoreErrorOptions) {
    super(message, options);

    this.name = "SecurityServiceValidationError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
