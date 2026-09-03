import type { Project, UpdateProjectInput } from "../../models/index.js";

import type { ProjectStatus } from "../../enums/index.js";

export interface IProjectRepository {
  create(data: Project): Promise<Project>;

  findById(organizationId: string, projectId: string): Promise<Project | null>;

  findByCode(organizationId: string, code: string): Promise<Project | null>;

  findBySlug(organizationId: string, slug: string): Promise<Project | null>;

  findAllByOrganization(organizationId: string): Promise<Project[]>;

  update(
    organizationId: string,
    projectId: string,
    data: UpdateProjectInput,
  ): Promise<Project | null>;

  updateStatus(
    organizationId: string,
    projectId: string,
    status: ProjectStatus,
  ): Promise<Project | null>;

  softDelete(
    organizationId: string,
    projectId: string,
    deletedBy?: string,
  ): Promise<boolean>;

  restore(
    organizationId: string,
    projectId: string,
    restoredBy?: string,
  ): Promise<Project | null>;
}
