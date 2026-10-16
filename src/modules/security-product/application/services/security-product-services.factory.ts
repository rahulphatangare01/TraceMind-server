import type { SecurityProductServiceBoundaries } from "../interfaces/security-product-services.port.js";

/**
 * Dependencies required to compose the Security Product's
 * existing service boundaries.
 */
export type SecurityProductServiceBoundaryDependencies =
  SecurityProductServiceBoundaries;

/**
 * Composes already-created service dependencies.
 *
 * This factory deliberately does not:
 * - initialize the database;
 * - read environment variables;
 * - create Security Core providers;
 * - create a logger or request context;
 * - implement business operations.
 */
export const createSecurityProductServiceBoundaries = (
  dependencies: SecurityProductServiceBoundaryDependencies,
): SecurityProductServiceBoundaries => {
  return {
    securityCore: dependencies.securityCore,
    tenantResourceOwnership: dependencies.tenantResourceOwnership,
    commonInfrastructure: dependencies.commonInfrastructure,
  };
};
