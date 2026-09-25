import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import { ProviderLifecycleService } from "../../../application/services/provider-lifecycle.service.js";

import {
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import { ProviderLifecycleError } from "../../../errors/provider-lifecycle.error.js";

import { HashAlgorithm } from "../../../domain/enums/hash-algorithm.enum.js";

const runManualVerification = async (): Promise<void> => {
  const lifecycleService = new ProviderLifecycleService();

  const provider = new LocalSecurityProvider();

  console.log("\n=== Phase 8.12 Local Provider Runtime Lifecycle ===\n");

  /**
   * ---------------------------------------------------------
   * 1. Provider Creation
   * ---------------------------------------------------------
   */

  console.log("1. Creating Local Security Provider...");

  if (!provider) {
    throw new Error("Local Security Provider could not be created");
  }

  console.log("   ✓ Local provider created");

  /**
   * ---------------------------------------------------------
   * 2. Initial Provider Status
   * ---------------------------------------------------------
   */

  console.log("2. Checking initial provider status...");

  const initialStatus = provider.getStatus();

  console.log(`   Status: ${initialStatus}`);

  if (initialStatus !== SecurityProviderStatus.READY) {
    throw new Error(`Expected READY status but received ${initialStatus}`);
  }

  console.log("   ✓ Initial status is READY");
  /**
   * ---------------------------------------------------------
   * 3. Provider Identity
   * ---------------------------------------------------------
   */

  console.log("3. Checking provider identity...");

  const metadata = provider.getMetadata();

  console.log(`   Provider ID: ${metadata.id}`);
  console.log(`   Provider Name: ${metadata.name}`);
  console.log(`   Provider Type: ${metadata.type}`);
  console.log(`   Provider Version: ${metadata.version}`);

  if (metadata.type !== SecurityProviderType.LOCAL) {
    throw new Error(
      `Expected LOCAL provider type but received ${metadata.type}`,
    );
  }

  console.log("   ✓ Provider identity is LOCAL");

  /**
   * ---------------------------------------------------------
   * 4. REGISTERED → INITIALIZING
   * ---------------------------------------------------------
   */

  console.log("4. Testing REGISTERED → INITIALIZING...");

  const registeredToInitializing = lifecycleService.transition(
    SecurityProviderStatus.REGISTERED,
    SecurityProviderStatus.INITIALIZING,
  );

  if (registeredToInitializing !== SecurityProviderStatus.INITIALIZING) {
    throw new Error("REGISTERED → INITIALIZING transition failed");
  }

  console.log("   ✓ REGISTERED → INITIALIZING");

  /**
   * ---------------------------------------------------------
   * 5. INITIALIZING → READY
   * ---------------------------------------------------------
   */

  console.log("5. Testing INITIALIZING → READY...");

  const initializingToReady = lifecycleService.transition(
    SecurityProviderStatus.INITIALIZING,
    SecurityProviderStatus.READY,
  );

  if (initializingToReady !== SecurityProviderStatus.READY) {
    throw new Error("INITIALIZING → READY transition failed");
  }

  console.log("   ✓ INITIALIZING → READY");

  /**
   * ---------------------------------------------------------
   * 6. READY → UNHEALTHY
   * ---------------------------------------------------------
   */

  console.log("6. Testing READY → UNHEALTHY...");

  const readyToUnhealthy = lifecycleService.transition(
    SecurityProviderStatus.READY,
    SecurityProviderStatus.UNHEALTHY,
  );

  if (readyToUnhealthy !== SecurityProviderStatus.UNHEALTHY) {
    throw new Error("READY → UNHEALTHY transition failed");
  }

  console.log("   ✓ READY → UNHEALTHY");

  /**
   * ---------------------------------------------------------
   * 7. UNHEALTHY → INITIALIZING
   * ---------------------------------------------------------
   */

  console.log("7. Testing UNHEALTHY → INITIALIZING...");

  const unhealthyToInitializing = lifecycleService.transition(
    SecurityProviderStatus.UNHEALTHY,
    SecurityProviderStatus.INITIALIZING,
  );

  if (unhealthyToInitializing !== SecurityProviderStatus.INITIALIZING) {
    throw new Error("UNHEALTHY → INITIALIZING transition failed");
  }

  console.log("   ✓ UNHEALTHY → INITIALIZING");

  /**
   * ---------------------------------------------------------
   * 8. UNHEALTHY → READY
   * ---------------------------------------------------------
   */

  console.log("8. Testing UNHEALTHY → READY...");

  const unhealthyToReady = lifecycleService.transition(
    SecurityProviderStatus.UNHEALTHY,
    SecurityProviderStatus.READY,
  );

  if (unhealthyToReady !== SecurityProviderStatus.READY) {
    throw new Error("UNHEALTHY → READY transition failed");
  }

  console.log("   ✓ UNHEALTHY → READY");

  /**
   * ---------------------------------------------------------
   * 9. READY → DISABLED
   * ---------------------------------------------------------
   */

  console.log("9. Testing READY → DISABLED...");

  const readyToDisabled = lifecycleService.transition(
    SecurityProviderStatus.READY,
    SecurityProviderStatus.DISABLED,
  );

  if (readyToDisabled !== SecurityProviderStatus.DISABLED) {
    throw new Error("READY → DISABLED transition failed");
  }

  console.log("   ✓ READY → DISABLED");

  /**
   * ---------------------------------------------------------
   * 10. DISABLED Must Be Terminal
   * ---------------------------------------------------------
   */

  console.log("10. Verifying DISABLED is terminal...");

  const statuses = Object.values(SecurityProviderStatus).filter(
    (status) => status !== SecurityProviderStatus.DISABLED,
  );

  for (const status of statuses) {
    const canTransition = lifecycleService.canTransition(
      SecurityProviderStatus.DISABLED,
      status,
    );

    if (canTransition) {
      throw new Error(`DISABLED should not transition to ${status}`);
    }
  }

  console.log("   ✓ DISABLED has no outgoing transitions");

  /**
   * ---------------------------------------------------------
   * 11. Invalid Transition Verification
   * ---------------------------------------------------------
   */

  console.log("11. Testing invalid lifecycle transition...");

  try {
    lifecycleService.transition(
      SecurityProviderStatus.DISABLED,
      SecurityProviderStatus.READY,
    );

    throw new Error("Expected ProviderLifecycleError was not thrown");
  } catch (error) {
    if (!(error instanceof ProviderLifecycleError)) {
      throw error;
    }

    console.log("   ✓ Invalid transition correctly rejected");
  }

  /**
   * ---------------------------------------------------------
   * 12. Provider Metadata Stability
   * ---------------------------------------------------------
   */

  console.log("12. Verifying provider metadata stability...");

  const metadataAfterLifecycle = provider.getMetadata();

  if (metadataAfterLifecycle.id !== metadata.id) {
    throw new Error("Provider ID changed during lifecycle validation");
  }

  if (metadataAfterLifecycle.type !== metadata.type) {
    throw new Error("Provider type changed during lifecycle validation");
  }

  if (metadataAfterLifecycle.version !== metadata.version) {
    throw new Error("Provider version changed during lifecycle validation");
  }

  console.log("   ✓ Provider metadata remained unchanged");

  /**
   * ---------------------------------------------------------
   * 13. Provider Dependency Stability
   * ---------------------------------------------------------
   */

  console.log("13. Verifying provider dependency stability...");

  if (!provider.keyProvider) {
    throw new Error("Key provider is unavailable");
  }

  if (!provider.keyMaterialProvider) {
    throw new Error("Key material provider is unavailable");
  }

  if (!provider.signingKeyProvider) {
    throw new Error("Signing key provider is unavailable");
  }

  if (!provider.hmacKeyProvider) {
    throw new Error("HMAC key provider is unavailable");
  }

  if (!provider.cryptoProvider) {
    throw new Error("Crypto provider is unavailable");
  }

  console.log("   ✓ Provider dependencies remain available");

  /**
   * ---------------------------------------------------------
   * 14. Runtime Crypto Verification
   * ---------------------------------------------------------
   */

  console.log("14. Verifying runtime crypto capability...");

  const hashResult = await provider.cryptoProvider.hash({
    value: "phase-8-12-runtime-test",
    algorithm: HashAlgorithm.SHA_256,
  });

  if (!hashResult.hash) {
    throw new Error("SHA-256 hashing failed");
  }

  console.log("   ✓ Local crypto operation succeeded");

  /**
   * ---------------------------------------------------------
   * Final Result
   * ---------------------------------------------------------
   */

  console.log("\n==============================================");

  console.log("Phase 8.12 manual verification PASSED");

  console.log("Local Provider Runtime Lifecycle is valid.");

  console.log("==============================================\n");
};
void runManualVerification();
