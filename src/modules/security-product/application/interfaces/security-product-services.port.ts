import type { SecurityCorePort } from "./security-core.port.js";

import type { SecurityProductCommonInfrastructurePort } from "./common-infrastructure.port.js";

import type { TenantResourceOwnershipService } from "../services/tenant-resource-ownership.service.js";

/**
 * Product-facing tenant ownership contract.
 *
 * The product depends only on the resolve operation, not on the
 * concrete implementation or its internal dependencies.
 */
export type TenantResourceOwnershipServicePort = Pick<
  TenantResourceOwnershipService,
  "resolve"
>;

/**
 * Stable service composition boundary for the Security Product.
 *
 * Each capability remains independently implemented and injected.
 * This interface does not initialize or construct infrastructure.
 */
export interface SecurityProductServiceBoundaries {
  readonly securityCore: SecurityCorePort;

  readonly tenantResourceOwnership: TenantResourceOwnershipServicePort;

  readonly commonInfrastructure: SecurityProductCommonInfrastructurePort;
}
