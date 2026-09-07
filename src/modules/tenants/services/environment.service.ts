import type {
  Environment,
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
} from "../models/index.js";

import {
  ApplicationStatus,
  EnvironmentStatus,
  OrganizationStatus,
  ProjectStatus,
} from "../enums/index.js";

import type {
  IApplicationRepository,
  IEnvironmentRepository,
  IOrganizationRepository,
  IProjectRepository,
} from "../repositories/interfaces/index.js";

import {
  TenantLifecycleStatus,
  validateEnvironmentStatusTransition,
  validateTenantStatusTransition,
} from "../lifecycle/index.js";
import { generateId } from "../../../common/utils/id.generrator.js";
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from "../../../common/errors/index.js";

export class EnvironmentService {
  constructor(
    private readonly environmentRepository: IEnvironmentRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly applicationRepository: IApplicationRepository,
  ) {}

  // async create(data: CreateEnvironmentInput): Promise<Environment> {
  //   return this.environmentRepository.create(data);
  // }
  // async create(
  //   organizationId: string,
  //   projectId: string,
  //   applicationId: string,
  //   data: CreateEnvironmentInput,
  // ): Promise<Environment> {
  //   const now = new Date();

  //   const environment: Environment = {
  //     id: generateId(),

  //     organizationId,
  //     projectId,
  //     applicationId,
  //     name: data.name,
  //     displayName: data.displayName ?? null,
  //     slug: data.slug,
  //     type: data.type,
  //     customType: data.customType ?? null,
  //     description: data.description ?? null,
  //     status: EnvironmentStatus.DRAFT,
  //     settings: data.settings ?? null,
  //     createdAt: now,
  //     updatedAt: now,
  //     deletedAt: null,

  //     createdBy: null,
  //     updatedBy: null,
  //     deletedBy: null,
  //   };

  //   return this.environmentRepository.create(environment);
  // }
  async create(
    organizationId: string,
    projectId: string,
    applicationId: string,
    data: CreateEnvironmentInput,
  ): Promise<Environment> {
    // 1. Organization validation
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      // throw new Error("Organization not found");
      throw new NotFoundError("Organization", organizationId);
    }

    // 2. Project hierarchy validation
    const project = await this.projectRepository.findById(
      organizationId,
      projectId,
    );

    if (!project) {
      // throw new Error("Project not found or does not belong to organization");
      throw new NotFoundError("Project", projectId);
    }

    // 3. Application hierarchy validation
    const application = await this.applicationRepository.findById(
      organizationId,
      projectId,
      applicationId,
    );

    if (!application) {
      // throw new Error("Application not found or does not belong to project");
      throw new NotFoundError("Application", applicationId);
    }

    // 4. Lifecycle restrictions
    if (organization.status === OrganizationStatus.ARCHIVED) {
      // throw new Error("Cannot create environment under archived organization");
      throw new BusinessRuleError(
        "Cannot create environment under archived organization",
      );
    }

    if (project.status === ProjectStatus.ARCHIVED) {
      // throw new Error("Cannot create environment under archived project");
      throw new BusinessRuleError(
        "Cannot create environment under archived project",
      );
    }

    if (application.status === ApplicationStatus.ARCHIVED) {
      // throw new Error("Cannot create environment under archived application");
      throw new BusinessRuleError(
        "Cannot create environment under archived application",
      );
    }

    // 5. Slug uniqueness
    const existingBySlug = await this.environmentRepository.findBySlug(
      organizationId,
      projectId,
      applicationId,
      data.slug,
    );

    if (existingBySlug) {
      // throw new Error(
      //   `Environment slug "${data.slug}" already exists in this application`,
      // );
      throw new ConflictError(
        `Environment slug "${data.slug}" already exists in this application`,
      );
    }

    // 6. Build complete entity
    const now = new Date();

    const environment: Environment = {
      id: generateId(),

      organizationId,
      projectId,
      applicationId,

      name: data.name,
      displayName: data.displayName ?? null,

      slug: data.slug,

      type: data.type,
      customType: data.customType ?? null,

      description: data.description ?? null,

      status: EnvironmentStatus.DRAFT,

      settings: data.settings ?? null,

      createdAt: now,
      updatedAt: now,
      deletedAt: null,

      createdBy: null,
      updatedBy: null,
      deletedBy: null,
    };

    return this.environmentRepository.create(environment);
  }
  async findById(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
  ): Promise<Environment | null> {
    return this.environmentRepository.findById(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    );
  }

  async findAllByApplication(
    organizationId: string,
    projectId: string,
    applicationId: string,
  ): Promise<Environment[]> {
    return this.environmentRepository.findAllByApplication(
      organizationId,
      projectId,
      applicationId,
    );
  }

  async update(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    data: UpdateEnvironmentInput,
  ): Promise<Environment | null> {
    return this.environmentRepository.update(
      organizationId,
      projectId,
      applicationId,
      environmentId,
      data,
    );
  }

  async changeStatus(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    nextStatus: EnvironmentStatus,
    updatedBy: string,
  ): Promise<Environment | null> {
    const environment = await this.findById(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    );

    if (!environment) {
      // throw new Error("Environment not found");
      throw new NotFoundError("Environment", projectId);
    }

    // validateTenantStatusTransition(environment.status, nextStatus);
    // validateTenantStatusTransition(
    //   "Environment",
    //   environment.status as unknown as TenantLifecycleStatus,
    //   nextStatus as unknown as TenantLifecycleStatus,
    // );
    validateEnvironmentStatusTransition(environment.status, nextStatus);
    return this.environmentRepository.updateStatus(
      organizationId,
      projectId,
      applicationId,
      environmentId,
      nextStatus,
      updatedBy,
    );
  }

  async softDelete(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    deletedBy?: string,
  ): Promise<boolean> {
    return this.environmentRepository.softDelete(
      organizationId,
      projectId,
      applicationId,
      environmentId,
      deletedBy,
    );
  }

  async restore(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    restoredBy?: string,
  ): Promise<Environment | null> {
    return this.environmentRepository.restore(
      organizationId,
      projectId,
      applicationId,
      environmentId,
      restoredBy,
    );
  }
}
