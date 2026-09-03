import type {
  Environment,
  UpdateEnvironmentInput,
} from "../../models/index.js";

import type { EnvironmentStatus } from "../../enums/index.js";

export interface IEnvironmentRepository {
  create(data: Environment): Promise<Environment>;

  findById(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
  ): Promise<Environment | null>;

  findBySlug(
    organizationId: string,
    projectId: string,
    applicationId: string,
    slug: string,
  ): Promise<Environment | null>;

  findAllByApplication(
    organizationId: string,
    projectId: string,
    applicationId: string,
  ): Promise<Environment[]>;

  update(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    data: UpdateEnvironmentInput,
  ): Promise<Environment | null>;

  updateStatus(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    status: EnvironmentStatus,
  ): Promise<Environment | null>;

  softDelete(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    deletedBy?: string,
  ): Promise<boolean>;

  restore(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    restoredBy?: string,
  ): Promise<Environment | null>;
}
