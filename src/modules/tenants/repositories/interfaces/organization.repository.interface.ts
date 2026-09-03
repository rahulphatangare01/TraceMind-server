import type {
  Organization,
  UpdateOrganizationInput,
} from "../../models/index.js";

import type { OrganizationStatus } from "../../enums/index.js";

export interface IOrganizationRepository {
  create(data: Organization): Promise<Organization>;

  findById(organizationId: string): Promise<Organization | null>;

  findByCode(code: string): Promise<Organization | null>;

  findBySlug(slug: string): Promise<Organization | null>;

  findAll(): Promise<Organization[]>;

  update(
    organizationId: string,
    data: UpdateOrganizationInput,
  ): Promise<Organization | null>;

  updateStatus(
    organizationId: string,
    status: OrganizationStatus,
  ): Promise<Organization | null>;

  softDelete(organizationId: string, deletedBy?: string): Promise<boolean>;

  restore(
    organizationId: string,
    restoredBy?: string,
  ): Promise<Organization | null>;
}
