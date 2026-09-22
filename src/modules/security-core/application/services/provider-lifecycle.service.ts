// import { SecurityProviderStatus } from "../../types/provider.types.js";
// import { SECURITY_PROVIDER_LIFECYCLE_TRANSITIONS } from "../../types/provider-lifecycle.types.js";

// export class ProviderLifecycleService {
//   canTransition(
//     from: SecurityProviderStatus,
//     to: SecurityProviderStatus,
//   ): boolean {
//     return SECURITY_PROVIDER_LIFECYCLE_TRANSITIONS[from].includes(to);
//   }

//   transition(
//     from: SecurityProviderStatus,
//     to: SecurityProviderStatus,
//   ): SecurityProviderStatus {
//     if (!this.canTransition(from, to)) {
//       throw new Error(
//         `Invalid provider lifecycle transition: ${from} -> ${to}`,
//       );
//     }

//     return to;
//   }
// }
import { SecurityProviderStatus } from "../../types/provider.types.js";
import { SECURITY_PROVIDER_LIFECYCLE_TRANSITIONS } from "../../types/provider-lifecycle.types.js";
import { ProviderLifecycleError } from "../../errors/provider-lifecycle.error.js";

// export class ProviderLifecycleService {
//   canTransition(
//     from: SecurityProviderStatus,
//     to: SecurityProviderStatus,
//   ): boolean {
//     return SECURITY_PROVIDER_LIFECYCLE_TRANSITIONS[from].includes(to);
//   }
export class ProviderLifecycleService {
  canTransition(
    from: SecurityProviderStatus,
    to: SecurityProviderStatus,
  ): boolean {
    const allowedTransitions = SECURITY_PROVIDER_LIFECYCLE_TRANSITIONS[
      from
    ] as readonly SecurityProviderStatus[];

    return allowedTransitions.includes(to);
  }

  transition(
    from: SecurityProviderStatus,
    to: SecurityProviderStatus,
  ): SecurityProviderStatus {
    if (!this.canTransition(from, to)) {
      throw new ProviderLifecycleError(from);
    }

    return to;
  }
}
