import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "../models/index.js";

import {
  ApplicationStatus,
  OrganizationStatus,
  ProjectStatus,
} from "../enums/index.js";

import type {
  IApplicationRepository,
  IOrganizationRepository,
  IProjectRepository,
} from "../repositories/interfaces/index.js";

import {
  TenantLifecycleStatus,
  validateTenantStatusTransition,
} from "../lifecycle/index.js";
import { generateId } from "../../../common/utils/id.generrator.js";
import {
  NotFoundError,
  ConflictError,
  BusinessRuleError,
} from "../../../common/errors/index.js";

export class ApplicationService {
  constructor(
    private readonly applicationRepository: IApplicationRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  // async create(data: CreateApplicationInput): Promise<Application> {
  //   return this.applicationRepository.create(data);
  // }
  // async create(
  //   organizationId: string,
  //   projectId: string,
  //   data: CreateApplicationInput,
  // ): Promise<Application> {
  //   const now = new Date();

  //   const application: Application = {
  //     id: generateId(),
  //     organizationId,
  //     projectId,
  //     name: data.name,
  //     displayName: data.displayName ?? null,
  //     code: data.code,
  //     slug: data.slug,
  //     type: data.type,
  //     description: data.description ?? null,
  //     status: ApplicationStatus.DRAFT,
  //     settings: data.settings ?? null,
  //     createdAt: now,
  //     updatedAt: now,
  //     deletedAt: null,

  //     createdBy: null,
  //     updatedBy: null,
  //     deletedBy: null,
  //   };

  //   return this.applicationRepository.create(application);
  // }
  async create(
    organizationId: string,
    projectId: string,
    data: CreateApplicationInput,
  ): Promise<Application> {
    // 1. Validate organization
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      // throw new Error("Organization not found");
      throw new NotFoundError("Organization", organizationId);
    }

    // 2. Validate project
    const project = await this.projectRepository.findById(
      organizationId,
      projectId,
    );

    if (!project) {
      // throw new Error("Project not found or does not belong to organization");
      throw new NotFoundError("Application", organizationId);
    }

    // 3. Prevent creation under archived entities
    if (organization.status === OrganizationStatus.ARCHIVED) {
      // throw new Error("Cannot create application under archived organization");
      throw new BusinessRuleError(
        "Cannot create application under archived organization",
      );
    }

    if (project.status === ProjectStatus.ARCHIVED) {
      // throw new Error("Cannot create application under archived project");
      throw new BusinessRuleError(
        "Cannot create a application under an archived organization",
      );
    }

    // 4. Uniqueness checks
    const existingByCode = await this.applicationRepository.findByCode(
      organizationId,
      projectId,
      data.code,
    );

    if (existingByCode) {
      // throw new Error(
      //   `Application code "${data.code}" already exists in this project`,
      // );
      throw new ConflictError(
        `Application code "${data.code}" already exists in this project`,
      );
    }

    const existingBySlug = await this.applicationRepository.findBySlug(
      organizationId,
      projectId,
      data.slug,
    );

    if (existingBySlug) {
      // throw new Error(
      //   `Application slug "${data.slug}" already exists in this project`,
      // );
      throw new ConflictError(
        `Application slug "${data.slug}" already exists in this project`,
      );
    }

    // 5. Build entity
    const now = new Date();

    const application: Application = {
      id: generateId(),

      organizationId,
      projectId,

      name: data.name,
      displayName: data.displayName ?? null,

      code: data.code,
      slug: data.slug,

      type: data.type,

      description: data.description ?? null,

      status: ApplicationStatus.DRAFT,

      settings: data.settings ?? null,

      createdAt: now,
      updatedAt: now,
      deletedAt: null,

      createdBy: null,
      updatedBy: null,
      deletedBy: null,
    };

    return this.applicationRepository.create(application);
  }
  async findById(
    organizationId: string,
    projectId: string,
    applicationId: string,
  ): Promise<Application | null> {
    return this.applicationRepository.findById(
      organizationId,
      projectId,
      applicationId,
    );
  }

  async findAllByProject(
    organizationId: string,
    projectId: string,
  ): Promise<Application[]> {
    return this.applicationRepository.findAllByProject(
      organizationId,
      projectId,
    );
  }

  async update(
    organizationId: string,
    projectId: string,
    applicationId: string,
    data: UpdateApplicationInput,
  ): Promise<Application | null> {
    return this.applicationRepository.update(
      organizationId,
      projectId,
      applicationId,
      data,
    );
  }

  async changeStatus(
    organizationId: string,
    projectId: string,
    applicationId: string,
    nextStatus: ApplicationStatus,
  ): Promise<Application | null> {
    const application = await this.findById(
      organizationId,
      projectId,
      applicationId,
    );

    if (!application) {
      // throw new Error("Application not found");
      throw new NotFoundError("Application", organizationId);
    }

    // validateTenantStatusTransition(application.status, nextStatus);
    validateTenantStatusTransition(
      "Application",
      application.status as unknown as TenantLifecycleStatus,
      nextStatus as unknown as TenantLifecycleStatus,
    );
    return this.applicationRepository.updateStatus(
      organizationId,
      projectId,
      applicationId,
      nextStatus,
    );
  }

  async softDelete(
    organizationId: string,
    projectId: string,
    applicationId: string,
    deletedBy?: string,
  ): Promise<boolean> {
    return this.applicationRepository.softDelete(
      organizationId,
      projectId,
      applicationId,
      deletedBy,
    );
  }

  async restore(
    organizationId: string,
    projectId: string,
    applicationId: string,
    restoredBy?: string,
  ): Promise<Application | null> {
    return this.applicationRepository.restore(
      organizationId,
      projectId,
      applicationId,
      restoredBy,
    );
  }
}
