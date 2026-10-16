import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../security-core/public-api.js";

import { securityCore } from "../../security-core/security-core.container.js";

import type { TenantResourceOwnershipPort } from "../application/interfaces/tenant-resource-ownership.port.js";

import type { SecurityContextValidationPort } from "../application/interfaces/security-context-validation.port.js";

import { TenantResourceOwnershipService } from "../application/services/tenant-resource-ownership.service.js";

import { TenantResourceOwnershipError } from "../errors/tenant-resource-ownership.error.js";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
};

const tenantLookup: TenantResourceOwnershipPort = {
  findOrganizationById: async () => null,
  findProjectById: async () => null,
  findApplicationById: async () => null,
  findEnvironmentById: async () => null,
};

const contextValidation: SecurityContextValidationPort = {
  validateContext: (input) =>
    securityCore.securityContextValidator.validate(input),

  validateBoundary: (context) =>
    securityCore.securityBoundaryValidator.validate(context).context,
};

const service = new TenantResourceOwnershipService(
  tenantLookup,
  contextValidation,
);

const main = async (): Promise<void> => {
  console.log("\nSecurity Product — Tenant Ownership Manual Test");
  console.log("================================================");

  let caughtError: unknown;

  try {
    await service.resolve({
      scope: SecurityScope.PLATFORM,
      classification: DataClassification.INTERNAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    });
  } catch (error) {
    caughtError = error;
  }

  assert(
    caughtError instanceof TenantResourceOwnershipError,
    "Unsupported scope did not produce TenantResourceOwnershipError",
  );

  assert(
    caughtError instanceof TenantResourceOwnershipError &&
      caughtError.code === "UNSUPPORTED_SCOPE",
    "Unsupported scope returned an unexpected error code",
  );

  console.log("PASS: unsupported PLATFORM scope is rejected");
  console.log("PASS: no tenant database lookup is required");
  console.log("\nAll tenant ownership manual checks passed.");
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
