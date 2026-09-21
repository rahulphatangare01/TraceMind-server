import { SecurityProviderCapability } from "../../types/provider.types.js";
import { ProviderCapabilityError } from "../../errors/provider-capability.error.js";

import type {
  ProviderCapabilityCheck,
  ProviderCapabilitySet,
} from "../../types/provider-capability.types.js";

export class ProviderCapabilityService {
  supports(
    capabilitySet: ProviderCapabilitySet,
    capability: SecurityProviderCapability,
  ): boolean {
    return capabilitySet.capabilities.includes(capability);
  }

  check(
    capabilitySet: ProviderCapabilitySet,
    capability: SecurityProviderCapability,
  ): ProviderCapabilityCheck {
    return {
      capability,
      supported: this.supports(capabilitySet, capability),
    };
  }

  //   require(
  //     capabilitySet: ProviderCapabilitySet,
  //     capability: SecurityProviderCapability,
  //   ): void {
  //     if (!this.supports(capabilitySet, capability)) {
  //       throw new Error(`Provider does not support capability: ${capability}`);
  //     }
  //   }

  require(
    capabilitySet: ProviderCapabilitySet,
    capability: SecurityProviderCapability,
  ): void {
    if (!this.supports(capabilitySet, capability)) {
      throw new ProviderCapabilityError(capability);
    }
  }
}
