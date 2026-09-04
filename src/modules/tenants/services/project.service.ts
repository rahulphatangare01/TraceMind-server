import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "../models/index.js";

import { ProjectStatus } from "../enums/index.js";

import type { IProjectRepository } from "../repositories/interfaces/index.js";
import { generateId } from "../../../common/utils/id.generrator.js";

import {
  TenantLifecycleStatus,
  validateTenantStatusTransition,
} from "../lifecycle/index.js";

export class ProjectService {
  constructor(private readonly projectRepository: IProjectRepository) {}

  // async create(data: CreateProjectInput): Promise<Project> {
  //   return this.projectRepository.create(data);
  // }

  async create(
    organizationId: string,
    data: CreateProjectInput,
  ): Promise<Project> {
    const now = new Date();

    const project: Project = {
      id: generateId(),
      organizationId,
      name: data.name,
      displayName: data.displayName ?? null,
      code: data.code,
      slug: data.slug,
      description: data.description ?? null,
      status: ProjectStatus.DRAFT,
      settings: data.settings ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      createdBy: null,
      updatedBy: null,
      deletedBy: null,
    };

    return this.projectRepository.create(project);
  }
  async findById(
    organizationId: string,
    projectId: string,
  ): Promise<Project | null> {
    return this.projectRepository.findById(organizationId, projectId);
  }

  async findAllByOrganization(organizationId: string): Promise<Project[]> {
    return this.projectRepository.findAllByOrganization(organizationId);
  }

  async update(
    organizationId: string,
    projectId: string,
    data: UpdateProjectInput,
  ): Promise<Project | null> {
    return this.projectRepository.update(organizationId, projectId, data);
  }

  async changeStatus(
    organizationId: string,
    projectId: string,
    nextStatus: ProjectStatus,
  ): Promise<Project | null> {
    const project = await this.findById(organizationId, projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    // validateTenantStatusTransition(project.status, nextStatus);
    validateTenantStatusTransition(
      project.status as unknown as TenantLifecycleStatus,
      nextStatus as unknown as TenantLifecycleStatus,
    );

    return this.projectRepository.updateStatus(
      organizationId,
      projectId,
      nextStatus,
    );
  }

  async softDelete(
    organizationId: string,
    projectId: string,
    deletedBy?: string,
  ): Promise<boolean> {
    return this.projectRepository.softDelete(
      organizationId,
      projectId,
      deletedBy,
    );
  }

  async restore(
    organizationId: string,
    projectId: string,
    restoredBy?: string,
  ): Promise<Project | null> {
    return this.projectRepository.restore(
      organizationId,
      projectId,
      restoredBy,
    );
  }
}
