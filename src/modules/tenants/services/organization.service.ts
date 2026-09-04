import type {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "../models/index.js";

import { OrganizationStatus } from "../enums/index.js";

import type { IOrganizationRepository } from "../repositories/interfaces/index.js";

import {
  TenantLifecycleStatus,
  validateTenantStatusTransition,
} from "../lifecycle/index.js";
import { generateId } from "../../../common/utils/id.generrator.js";
export class OrganizationService {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async create(data: CreateOrganizationInput): Promise<Organization> {
    const now = new Date();

    const organization: Organization = {
      id: generateId(),

      name: data.name,
      displayName: data.displayName ?? null,
      code: data.code,
      slug: data.slug,

      type: data.type,

      status: OrganizationStatus.PENDING,

      timezone: data.timezone,
      countryCode: data.countryCode ?? null,

      settings: data.settings ?? null,

      createdBy: null,
      updatedBy: null,
      deletedBy: null,

      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    return this.organizationRepository.create(organization);
  }

  async findById(organizationId: string): Promise<Organization | null> {
    return this.organizationRepository.findById(organizationId);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.findAll();
  }

  async update(
    organizationId: string,
    data: UpdateOrganizationInput,
  ): Promise<Organization | null> {
    return this.organizationRepository.update(organizationId, data);
  }

  async changeStatus(
    organizationId: string,
    nextStatus: OrganizationStatus,
  ): Promise<Organization | null> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw new Error("Organization not found");
    }

    // validateTenantStatusTransition(organization.status, nextStatus);
    validateTenantStatusTransition(
      organization.status as unknown as TenantLifecycleStatus,
      nextStatus as unknown as TenantLifecycleStatus,
    );

    return this.organizationRepository.updateStatus(organizationId, nextStatus);
  }

  async softDelete(
    organizationId: string,
    deletedBy?: string,
  ): Promise<boolean> {
    return this.organizationRepository.softDelete(organizationId, deletedBy);
  }

  async restore(
    organizationId: string,
    restoredBy?: string,
  ): Promise<Organization | null> {
    return this.organizationRepository.restore(organizationId, restoredBy);
  }
}
