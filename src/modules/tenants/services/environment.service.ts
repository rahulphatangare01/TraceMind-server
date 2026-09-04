import type {
  Environment,
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
} from "../models/index.js";

import { EnvironmentStatus } from "../enums/index.js";

import type { IEnvironmentRepository } from "../repositories/interfaces/index.js";

import {
  TenantLifecycleStatus,
  validateTenantStatusTransition,
} from "../lifecycle/index.js";
import { generateId } from "../../../common/utils/id.generrator.js";

export class EnvironmentService {
  constructor(private readonly environmentRepository: IEnvironmentRepository) {}

  // async create(data: CreateEnvironmentInput): Promise<Environment> {
  //   return this.environmentRepository.create(data);
  // }
  async create(
    organizationId: string,
    projectId: string,
    applicationId: string,
    data: CreateEnvironmentInput,
  ): Promise<Environment> {
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
  ): Promise<Environment | null> {
    const environment = await this.findById(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    );

    if (!environment) {
      throw new Error("Environment not found");
    }

    // validateTenantStatusTransition(environment.status, nextStatus);
    validateTenantStatusTransition(
      environment.status as unknown as TenantLifecycleStatus,
      nextStatus as unknown as TenantLifecycleStatus,
    );
    return this.environmentRepository.updateStatus(
      organizationId,
      projectId,
      applicationId,
      environmentId,
      nextStatus,
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
