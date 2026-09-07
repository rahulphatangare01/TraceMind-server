import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "../models/index.js";

import { OrganizationStatus, ProjectStatus } from "../enums/index.js";

import type {
  IOrganizationRepository,
  IProjectRepository,
} from "../repositories/interfaces/index.js";
import { generateId } from "../../../common/utils/id.generrator.js";

import {
  TenantLifecycleStatus,
  validateTenantStatusTransition,
} from "../lifecycle/index.js";
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from "../../../common/errors/index.js";

export class ProjectService {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  // async create(data: CreateProjectInput): Promise<Project> {
  //   return this.projectRepository.create(data);
  // }

  // async create(
  //   organizationId: string,
  //   data: CreateProjectInput,
  // ): Promise<Project> {
  //   const now = new Date();

  //   const project: Project = {
  //     id: generateId(),
  //     organizationId,
  //     name: data.name,
  //     displayName: data.displayName ?? null,
  //     code: data.code,
  //     slug: data.slug,
  //     description: data.description ?? null,
  //     status: ProjectStatus.DRAFT,
  //     settings: data.settings ?? null,
  //     createdAt: now,
  //     updatedAt: now,
  //     deletedAt: null,
  //     createdBy: null,
  //     updatedBy: null,
  //     deletedBy: null,
  //   };

  //   return this.projectRepository.create(project);
  // }
  async create(
    organizationId: string,
    data: CreateProjectInput,
  ): Promise<Project> {
    // 1. Validate organization exists
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      // throw new Error("Organization not found");
      throw new NotFoundError("Organization", organizationId);
    }

    // 2. Organization business status rule
    if (
      organization.status === OrganizationStatus.ARCHIVED ||
      organization.status === OrganizationStatus.SUSPENDED
    ) {
      // throw new Error("Cannot create project under this organization");
      throw new BusinessRuleError(
        "Cannot create a project under an archived organization",
      );
    }

    // 3. Check project code uniqueness inside organization
    const existingByCode = await this.projectRepository.findByCode(
      organizationId,
      data.code,
    );

    if (existingByCode) {
      // throw new Error(
      //   // `Project code "${data.code}" already exists in this organization`,
      // );
      throw new ConflictError(
        `Project code "${data.code}" already exists in this organization`,
      );
    }

    // 4. Check slug uniqueness inside organization
    const existingBySlug = await this.projectRepository.findBySlug(
      organizationId,
      data.slug,
    );

    if (existingBySlug) {
      // throw new Error(
      //   `Project slug "${data.slug}" already exists in this organization`,
      // );
      throw new ConflictError(
        `Project code "${data.slug}" already exists in this organization`,
      );
    }

    // 5. Build entity
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

    // 6. Persist
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
      // throw new Error("Project not found");
      throw new NotFoundError("Organization", organizationId);
    }

    // validateTenantStatusTransition(project.status, nextStatus);
    validateTenantStatusTransition(
      "Project",
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
