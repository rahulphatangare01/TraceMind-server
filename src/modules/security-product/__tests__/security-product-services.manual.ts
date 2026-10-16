import type { SecurityCorePort } from "../application/interfaces/security-core.port.js";

import type { SecurityProductCommonInfrastructurePort } from "../application/interfaces/common-infrastructure.port.js";

import type { TenantResourceOwnershipServicePort } from "../application/interfaces/security-product-services.port.js";

import { createSecurityProductServiceBoundaries } from "../application/services/security-product-services.factory.js";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
};

const securityCore = {
  operations: {},
  keyManagement: {},
} as unknown as SecurityCorePort;

const tenantResourceOwnership = {
  resolve: async () => undefined,
} as unknown as TenantResourceOwnershipServicePort;

const commonInfrastructure: SecurityProductCommonInfrastructurePort = {
  logger: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
  requestContext: {
    getCurrentContext: () => undefined,
  },
  identifiers: {
    generateId: () => "manual-id",
    generateRequestId: () => "manual-request-id",
    generateTraceId: () => "manual-trace-id",
    generateSpanId: () => "manual-span-id",
  },
};

const main = (): void => {
  console.log("\nSecurity Product — Service Boundary Manual Test");
  console.log("================================================");

  const services = createSecurityProductServiceBoundaries({
    securityCore,
    tenantResourceOwnership,
    commonInfrastructure,
  });

  assert(
    services.securityCore === securityCore,
    "Security Core reference was not preserved",
  );
  console.log("PASS: Security Core boundary");

  assert(
    services.tenantResourceOwnership === tenantResourceOwnership,
    "Tenant ownership service reference was not preserved",
  );
  console.log("PASS: tenant ownership boundary");

  assert(
    services.commonInfrastructure === commonInfrastructure,
    "Common infrastructure reference was not preserved",
  );
  console.log("PASS: common infrastructure boundary");

  const actualKeys = Object.keys(services).sort().join(",");

  assert(
    actualKeys === "commonInfrastructure,securityCore,tenantResourceOwnership",
    `Unexpected service boundary members: ${actualKeys}`,
  );
  console.log("PASS: service boundary contains only declared capabilities");

  assert(
    !("cryptoProvider" in services.securityCore),
    "Crypto provider internals are exposed",
  );

  assert(
    !("keyProvider" in services.securityCore),
    "Key provider internals are exposed",
  );
  console.log("PASS: provider internals are not exposed");

  console.log("\nAll service-boundary manual checks passed.");
};

main();
