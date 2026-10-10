import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/provider.types.js";

import type {
  SecurityProvider,
  SecurityProviderMetadata,
} from "../../types/provider.types.js";

import { ProviderResolverError } from "../../errors/provider-resolver.error.js";

import { securityCore } from "../../security-core.container.js";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
};

const printSection = (title: string): void => {
  console.log("");

  console.log("==================================================");

  console.log(title);

  console.log("==================================================");
};

const createProvider = (id: string): SecurityProvider => {
  const metadata: SecurityProviderMetadata = {
    id,
    name: id,
    type: SecurityProviderType.LOCAL,
    version: "1.0.0",
    capabilities: [
      SecurityProviderCapability.KEY_MANAGEMENT,
      SecurityProviderCapability.KEY_MATERIAL,
      SecurityProviderCapability.ENCRYPTION,
      SecurityProviderCapability.DECRYPTION,
      SecurityProviderCapability.HASHING,
      SecurityProviderCapability.SIGNING,
      SecurityProviderCapability.HMAC,
    ],
  };

  return {
    getMetadata: () => metadata,

    getStatus: () => SecurityProviderStatus.READY,
  };
};

async function runManualTest(): Promise<void> {
  /*
   * ==================================================
   * Phase 9.14
   * Provider Resolution Integration
   * ==================================================
   */

  printSection("Phase 9.14 - Provider Resolution Integration");

  /*
   * ==================================================
   * 1. Security Core Provider Resolution Availability
   * ==================================================
   */

  printSection("1. Security Core Provider Resolution Availability");

  assert(securityCore !== undefined, "Security Core container is unavailable");

  assert(
    securityCore.providerRegistry !== undefined,
    "Provider registry is unavailable",
  );

  assert(
    securityCore.providerResolver !== undefined,
    "Provider resolver is unavailable",
  );

  assert(
    securityCore.securityServiceProviderResolution !== undefined,
    "Security Service provider resolution API is unavailable",
  );

  console.log("✓ Security Core container is available");

  console.log("✓ Provider registry is available");

  console.log("✓ Provider resolver is available");

  console.log("✓ Security Service provider resolution API is available");

  /*
   * ==================================================
   * 2. Provider Registration
   * ==================================================
   */

  printSection("2. Provider Registration");

  const providerA = createProvider("phase-9-14-provider-a");

  const providerB = createProvider("phase-9-14-provider-b");

  securityCore.providerRegistry.register(providerA);

  securityCore.providerRegistry.register(providerB);

  console.log("✓ Provider A registered");

  console.log("✓ Provider B registered");

  /*
   * ==================================================
   * 3. Provider A Resolution
   * ==================================================
   */

  printSection("3. Provider A Resolution");

  const resolvedProviderA =
    securityCore.securityServiceProviderResolution.resolve(
      "phase-9-14-provider-a",
    );

  assert(
    resolvedProviderA === providerA,
    "Provider A resolution returned incorrect provider",
  );

  console.log("✓ Provider A resolved successfully");

  console.log("✓ Resolved provider is the registered provider instance");

  /*
   * ==================================================
   * 4. Provider B Resolution
   * ==================================================
   */

  printSection("4. Provider B Resolution");

  const resolvedProviderB =
    securityCore.securityServiceProviderResolution.resolve(
      "phase-9-14-provider-b",
    );

  assert(
    resolvedProviderB === providerB,
    "Provider B resolution returned incorrect provider",
  );

  console.log("✓ Provider B resolved successfully");

  console.log("✓ Resolved provider is the registered provider instance");

  /*
   * ==================================================
   * 5. Multiple Provider Isolation
   * ==================================================
   */

  printSection("5. Multiple Provider Isolation");

  assert(
    resolvedProviderA !== resolvedProviderB,
    "Provider resolution returned the same instance for different providers",
  );

  assert(
    resolvedProviderA.getMetadata().id === "phase-9-14-provider-a",
    "Provider A metadata ID is incorrect",
  );

  assert(
    resolvedProviderB.getMetadata().id === "phase-9-14-provider-b",
    "Provider B metadata ID is incorrect",
  );

  console.log("✓ Multiple providers remain isolated");

  console.log("✓ Provider A metadata is correct");

  console.log("✓ Provider B metadata is correct");

  /*
   * ==================================================
   * 6. Provider Status Preservation
   * ==================================================
   */

  printSection("6. Provider Status Preservation");

  assert(
    resolvedProviderA.getStatus() === SecurityProviderStatus.READY,
    "Provider A status is incorrect",
  );

  assert(
    resolvedProviderB.getStatus() === SecurityProviderStatus.READY,
    "Provider B status is incorrect",
  );

  console.log("✓ Provider A status is READY");

  console.log("✓ Provider B status is READY");

  /*
   * ==================================================
   * 7. Provider Metadata Preservation
   * ==================================================
   */

  printSection("7. Provider Metadata Preservation");

  const providerAMetadata = resolvedProviderA.getMetadata();

  const providerBMetadata = resolvedProviderB.getMetadata();

  assert(
    providerAMetadata.name === "phase-9-14-provider-a",
    "Provider A name was not preserved",
  );

  assert(
    providerBMetadata.name === "phase-9-14-provider-b",
    "Provider B name was not preserved",
  );

  assert(
    providerAMetadata.type === SecurityProviderType.LOCAL,
    "Provider A type is incorrect",
  );

  assert(
    providerBMetadata.type === SecurityProviderType.LOCAL,
    "Provider B type is incorrect",
  );

  assert(
    providerAMetadata.version === "1.0.0",
    "Provider A version was not preserved",
  );

  assert(
    providerBMetadata.version === "1.0.0",
    "Provider B version was not preserved",
  );

  console.log("✓ Provider A metadata preserved");

  console.log("✓ Provider B metadata preserved");

  /*
   * ==================================================
   * 8. Provider Capability Preservation
   * ==================================================
   */

  printSection("8. Provider Capability Preservation");

  assert(
    providerAMetadata.capabilities.includes(
      SecurityProviderCapability.ENCRYPTION,
    ),
    "Provider A encryption capability is missing",
  );

  assert(
    providerAMetadata.capabilities.includes(
      SecurityProviderCapability.KEY_MANAGEMENT,
    ),
    "Provider A key-management capability is missing",
  );

  assert(
    providerBMetadata.capabilities.includes(
      SecurityProviderCapability.ENCRYPTION,
    ),
    "Provider B encryption capability is missing",
  );

  assert(
    providerBMetadata.capabilities.includes(
      SecurityProviderCapability.KEY_MANAGEMENT,
    ),
    "Provider B key-management capability is missing",
  );

  console.log("✓ Provider A capabilities preserved");

  console.log("✓ Provider B capabilities preserved");

  /*
   * ==================================================
   * 9. Missing Provider Must Fail
   * ==================================================
   */

  printSection("9. Missing Provider Must Fail");

  let missingProviderRejected = false;

  try {
    securityCore.securityServiceProviderResolution.resolve(
      "phase-9-14-missing-provider",
    );
  } catch (error) {
    missingProviderRejected = error instanceof ProviderResolverError;
  }

  assert(
    missingProviderRejected,
    "Missing provider did not throw ProviderResolverError",
  );

  console.log("✓ Missing provider rejected");

  console.log("✓ ProviderResolverError was raised");

  /*
   * ==================================================
   * 10. No Silent Provider Fallback
   * ==================================================
   */

  printSection("10. No Silent Provider Fallback");

  let fallbackDetected = false;

  try {
    const resolved = securityCore.securityServiceProviderResolution.resolve(
      "phase-9-14-unknown-provider",
    );

    if (resolved === providerA || resolved === providerB) {
      fallbackDetected = true;
    }
  } catch {
    /*
     * Expected behavior.
     *
     * An unknown provider must fail instead of
     * silently selecting another provider.
     */
  }

  assert(
    !fallbackDetected,
    "Provider resolution silently fell back to another provider",
  );

  console.log("✓ No silent provider fallback detected");

  /*
   * ==================================================
   * 11. Repeated Resolution Consistency
   * ==================================================
   */

  printSection("11. Repeated Resolution Consistency");

  const firstResolution =
    securityCore.securityServiceProviderResolution.resolve(
      "phase-9-14-provider-a",
    );

  const secondResolution =
    securityCore.securityServiceProviderResolution.resolve(
      "phase-9-14-provider-a",
    );

  assert(
    firstResolution === secondResolution,
    "Repeated provider resolution returned different instances",
  );

  assert(
    secondResolution === providerA,
    "Repeated provider resolution returned an unexpected provider",
  );

  console.log("✓ Repeated resolution is consistent");

  /*
   * ==================================================
   * 12. Direct Resolver and Security Service
   *     Resolution Consistency
   * ==================================================
   */

  printSection(
    "12. Direct Resolver and Security Service Resolution Consistency",
  );

  const directResolverResult = securityCore.providerResolver.resolve(
    "phase-9-14-provider-b",
  );

  const securityServiceResult =
    securityCore.securityServiceProviderResolution.resolve(
      "phase-9-14-provider-b",
    );

  assert(
    directResolverResult === securityServiceResult,
    "Security Service provider resolution does not use the same resolver behavior",
  );

  assert(
    securityServiceResult === providerB,
    "Security Service provider resolution returned incorrect provider",
  );

  console.log(
    "✓ Direct resolver and Security Service resolution are consistent",
  );

  /*
   * ==================================================
   * Final Result
   * ==================================================
   */

  console.log("");

  console.log("==================================================");

  console.log("Phase 9.14 manual verification completed");

  console.log("==================================================");

  console.log("✓ Security Core provider resolution available");

  console.log("✓ Provider registration works");

  console.log("✓ Provider A resolution works");

  console.log("✓ Provider B resolution works");

  console.log("✓ Multiple provider isolation works");

  console.log("✓ Provider metadata preserved");

  console.log("✓ Provider status preserved");

  console.log("✓ Provider capabilities preserved");

  console.log("✓ Missing provider rejected");

  console.log("✓ No silent provider fallback");

  console.log("✓ Repeated resolution is consistent");

  console.log("✓ Security Service resolution matches ProviderResolver");

  console.log("==================================================");

  console.log("PHASE 9.14 MANUAL VERIFICATION PASSED");

  console.log("==================================================");
}

runManualTest().catch((error) => {
  console.error("Phase 9.14 manual test failed:", error);

  process.exitCode = 1;
});
