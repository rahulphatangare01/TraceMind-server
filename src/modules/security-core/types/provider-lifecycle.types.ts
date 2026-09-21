import { SecurityProviderStatus } from "./provider.types.js";

export const SECURITY_PROVIDER_LIFECYCLE_TRANSITIONS = {
  [SecurityProviderStatus.REGISTERED]: [
    SecurityProviderStatus.INITIALIZING,
    SecurityProviderStatus.DISABLED,
  ],

  [SecurityProviderStatus.INITIALIZING]: [
    SecurityProviderStatus.READY,
    SecurityProviderStatus.UNHEALTHY,
    SecurityProviderStatus.DISABLED,
  ],

  [SecurityProviderStatus.READY]: [
    SecurityProviderStatus.UNHEALTHY,
    SecurityProviderStatus.DISABLED,
  ],

  [SecurityProviderStatus.UNHEALTHY]: [
    SecurityProviderStatus.INITIALIZING,
    SecurityProviderStatus.READY,
    SecurityProviderStatus.DISABLED,
  ],

  [SecurityProviderStatus.DISABLED]: [],
} as const;
