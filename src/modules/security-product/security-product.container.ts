import { securityCore } from "../security-core/security-core.container.js";
import {
  organizationService,
  projectService,
  applicationService,
  environmentService,
} from "../tenants/container/tenant.container.js";
import type { SecurityCorePort } from "./application/interfaces/security-core.port.js";
import type { TenantResourceOwnershipPort } from "./application/interfaces/tenant-resource-ownership.port.js";
import type { SecurityContextValidationPort } from "./application/interfaces/security-context-validation.port.js";
import { TenantResourceOwnershipService } from "./application/services/tenant-resource-ownership.service.js";
import { SecurityKeyPersistenceService } from "./application/services/security-key-persistence.service.js";
import { SecurityKeyMySQLRepository } from "./infrastructure/persistence/mysql/security-key.mysql.repository.js";
import { SecurityKeyVersionMySQLRepository } from "./infrastructure/persistence/mysql/security-key-version.mysql.repository.js";
import { SecurityKeyTransactionMySQLAdapter } from "./infrastructure/persistence/mysql/security-key.transaction.mysql.adapter.js";
/**
 * Security Core integration boundary.
 *
 * The Core container is accessed here, at the composition root.
 * Product application services should receive SecurityCorePort rather than
 * importing security-core.container.js themselves.
 */
const securityCorePort: SecurityCorePort = {
  operations: securityCore.securityService,
  keyManagement: securityCore.securityServiceKeyManagementApi,
};

/**
 * Adapt the existing tenant services to the read-only ownership port.
 *
 * The tenant services retain responsibility for their own lookups and
 * repositories. Security Product does not access MySQL directly.
 */
const tenantResourceOwnershipPort: TenantResourceOwnershipPort = {
  findOrganizationById: (organizationId) =>
    organizationService.findById(organizationId),

  findProjectById: (organizationId, projectId) =>
    projectService.findById(organizationId, projectId),

  findApplicationById: (organizationId, projectId, applicationId) =>
    applicationService.findById(organizationId, projectId, applicationId),

  findEnvironmentById: (
    organizationId,
    projectId,
    applicationId,
    environmentId,
  ) =>
    environmentService.findById(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    ),
};

/**
 * Adapter for the validators already provided by Security Core.
 */
const securityContextValidationPort: SecurityContextValidationPort = {
  validateContext: (input) =>
    securityCore.securityContextValidator.validate(input),

  validateBoundary: (context) =>
    securityCore.securityBoundaryValidator.validate(context).context,
};

const tenantResourceOwnershipService = new TenantResourceOwnershipService(
  tenantResourceOwnershipPort,
  securityContextValidationPort,
);

/**
 * Security key persistence infrastructure.
 *
 * Concrete MySQL adapters are instantiated only at the
 * Security Product composition root.
 */
const securityKeyRepository = new SecurityKeyMySQLRepository();

const securityKeyVersionRepository = new SecurityKeyVersionMySQLRepository();

const securityKeyTransaction = new SecurityKeyTransactionMySQLAdapter();

/**
 * Scoped Security Product persistence service.
 *
 * All operations require an explicit tenant resource scope.
 */
const securityKeyPersistenceService = new SecurityKeyPersistenceService(
  securityKeyRepository,
  securityKeyVersionRepository,
  securityKeyTransaction,
);
export const securityProduct = {
  securityCore: securityCorePort,
  tenantResourceOwnership: tenantResourceOwnershipService,
  securityKeyPersistence: securityKeyPersistenceService,
} as const;
