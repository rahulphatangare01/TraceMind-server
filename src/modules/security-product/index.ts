// export type { SecurityCorePort } from "./application/interfaces/security-core.port.js";
// export { securityProduct } from "./security-product.container.js";

export type { SecurityCorePort } from "./application/interfaces/security-core.port.js";

export type { TenantResourceOwnershipPort } from "./application/interfaces/tenant-resource-ownership.port.js";

export type { SecurityContextValidationPort } from "./application/interfaces/security-context-validation.port.js";

export type { TenantResourceOwnershipResult } from "./application/services/tenant-resource-ownership.service.js";

export { TenantResourceOwnershipService } from "./application/services/tenant-resource-ownership.service.js";

export { TenantResourceOwnershipError } from "./errors/tenant-resource-ownership.error.js";

export type { TenantResourceOwnershipErrorCode } from "./errors/tenant-resource-ownership.error.js";

export { securityProduct } from "./security-product.container.js";

export type {
  SecurityProductLogMetadata,
  SecurityProductLoggerPort,
  SecurityProductRequestContext,
  SecurityProductRequestContextPort,
  SecurityProductIdentifierPort,
  SecurityProductCommonInfrastructurePort,
} from "./application/interfaces/common-infrastructure.port.js";

export { createSecurityProductCommonInfrastructurePort } from "./application/services/common-infrastructure.port-factory.js";

export type { SecurityProductCommonInfrastructureDependencies } from "./application/services/common-infrastructure.port-factory.js";
