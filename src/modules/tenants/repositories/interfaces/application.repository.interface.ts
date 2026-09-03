import type {
  Application,
  UpdateApplicationInput,
} from "../../models/index.js";

import type { ApplicationStatus } from "../../enums/index.js";

export interface IApplicationRepository {
  create(data: Application): Promise<Application>;

  findById(
    organizationId: string,
    projectId: string,
    applicationId: string,
  ): Promise<Application | null>;

  findByCode(
    organizationId: string,
    projectId: string,
    code: string,
  ): Promise<Application | null>;

  findBySlug(
    organizationId: string,
    projectId: string,
    slug: string,
  ): Promise<Application | null>;

  findAllByProject(
    organizationId: string,
    projectId: string,
  ): Promise<Application[]>;

  update(
    organizationId: string,
    projectId: string,
    applicationId: string,
    data: UpdateApplicationInput,
  ): Promise<Application | null>;

  updateStatus(
    organizationId: string,
    projectId: string,
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<Application | null>;

  softDelete(
    organizationId: string,
    projectId: string,
    applicationId: string,
    deletedBy?: string,
  ): Promise<boolean>;

  restore(
    organizationId: string,
    projectId: string,
    applicationId: string,
    restoredBy?: string,
  ): Promise<Application | null>;
}
