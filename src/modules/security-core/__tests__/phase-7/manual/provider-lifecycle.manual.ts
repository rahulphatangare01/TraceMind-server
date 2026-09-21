import { SecurityProviderStatus } from "../../../types/provider.types.js";

import { ProviderLifecycleService } from "../../../application/services/provider-lifecycle.service.js";

const service = new ProviderLifecycleService();

console.log("\n=== Provider Lifecycle Manual Verification ===\n");

const validTransitions = [
  [SecurityProviderStatus.REGISTERED, SecurityProviderStatus.INITIALIZING],
  [SecurityProviderStatus.INITIALIZING, SecurityProviderStatus.READY],
  [SecurityProviderStatus.READY, SecurityProviderStatus.UNHEALTHY],
  [SecurityProviderStatus.UNHEALTHY, SecurityProviderStatus.READY],
  [SecurityProviderStatus.READY, SecurityProviderStatus.DISABLED],
] as const;

for (const [from, to] of validTransitions) {
  const allowed = service.canTransition(from, to);

  console.log(`${from} -> ${to}: ${allowed ? "PASS" : "FAIL"}`);
}

const invalidTransitions = [
  [SecurityProviderStatus.REGISTERED, SecurityProviderStatus.READY],
  [SecurityProviderStatus.DISABLED, SecurityProviderStatus.READY],
] as const;

for (const [from, to] of invalidTransitions) {
  const allowed = service.canTransition(from, to);

  console.log(`${from} -> ${to}: ${!allowed ? "PASS (rejected)" : "FAIL"}`);
}

try {
  service.transition(
    SecurityProviderStatus.REGISTERED,
    SecurityProviderStatus.READY,
  );

  console.log("Invalid transition exception: FAIL");
} catch (error) {
  console.log(
    `Invalid transition exception: ${error instanceof Error ? "PASS" : "FAIL"}`,
  );
}

console.log("\n=== Manual Verification Complete ===\n");
