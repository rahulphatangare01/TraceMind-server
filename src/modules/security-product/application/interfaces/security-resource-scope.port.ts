import type { SecurityScope } from "../../../security-core/public-api.js";

/**
 * Persistence scope for Security Product resources.
 *
 * These scopes represent tenant-owned resources. PLATFORM and FIELD
 * are intentionally excluded: platform-wide resources and individual
 * field-level operations require separate contracts if introduced.
 */
export type SecurityResourceScope =
  | {
      readonly scope: SecurityScope.ORGANIZATION;
      readonly organizationId: string;
    }
  | {
      readonly scope: SecurityScope.PROJECT;
      readonly organizationId: string;
      readonly projectId: string;
    }
  | {
      readonly scope: SecurityScope.APPLICATION;
      readonly organizationId: string;
      readonly projectId: string;
      readonly applicationId: string;
    }
  | {
      readonly scope: SecurityScope.ENVIRONMENT;
      readonly organizationId: string;
      readonly projectId: string;
      readonly applicationId: string;
      readonly environmentId: string;
    };
