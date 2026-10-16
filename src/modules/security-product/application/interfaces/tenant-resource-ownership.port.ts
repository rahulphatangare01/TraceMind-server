import type {
  Organization,
  Project,
  Application,
  Environment,
} from "../../../tenants/models/index.js";

/**
 * Read-only tenant lookup boundary used by Security Product.
 *
 * All child lookups include their parent identifiers. This preserves the
 * ownership constraints already implemented by the TraceMind tenant module.
 */
export interface TenantResourceOwnershipPort {
  findOrganizationById(organizationId: string): Promise<Organization | null>;

  findProjectById(
    organizationId: string,
    projectId: string,
  ): Promise<Project | null>;

  findApplicationById(
    organizationId: string,
    projectId: string,
    applicationId: string,
  ): Promise<Application | null>;

  findEnvironmentById(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
  ): Promise<Environment | null>;
}
