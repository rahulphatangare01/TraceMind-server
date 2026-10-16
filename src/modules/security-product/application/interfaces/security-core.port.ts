import type {
  SecurityKeyManagementService,
  SecurityService,
} from "../../../security-core/public-api.js";

/**
 * The only Security Core dependency required by Security Product application
 * services. It exposes stable contracts and no provider/container internals.
 */
export interface SecurityCorePort {
  readonly operations: SecurityService;
  readonly keyManagement: SecurityKeyManagementService;
}
