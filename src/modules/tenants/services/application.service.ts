import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "../models/index.js";

import { ApplicationStatus } from "../enums/index.js";

import type { IApplicationRepository } from "../repositories/interfaces/index.js";

import {
  TenantLifecycleStatus,
  validateTenantStatusTransition,
} from "../lifecycle/index.js";
import { generateId } from "../../../common/utils/id.generrator.js";

export class ApplicationService {
  constructor(private readonly applicationRepository: IApplicationRepository) {}

  // async create(data: CreateApplicationInput): Promise<Application> {
  //   return this.applicationRepository.create(data);
  // }
  async create(
    organizationId: string,
    projectId: string,
    data: CreateApplicationInput,
  ): Promise<Application> {
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
      throw new Error("Application not found");
    }

    // validateTenantStatusTransition(application.status, nextStatus);
    validateTenantStatusTransition(
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
