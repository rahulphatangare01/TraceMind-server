import { SecurityScope } from "../../../security-core/public-api.js";

import type { SecurityContext } from "../../../security-core/public-api.js";

import type {
  Organization,
  Project,
  Application,
  Environment,
} from "../../../tenants/models/index.js";

import type { TenantResourceOwnershipPort } from "../interfaces/tenant-resource-ownership.port.js";

import type { SecurityContextValidationPort } from "../interfaces/security-context-validation.port.js";

import { TenantResourceOwnershipError } from "../../errors/tenant-resource-ownership.error.js";

export type TenantResourceOwnershipResult =
  | {
      scope: SecurityScope.ORGANIZATION;
      context: SecurityContext;
      organization: Organization;
    }
  | {
      scope: SecurityScope.PROJECT;
      context: SecurityContext;
      organization: Organization;
      project: Project;
    }
  | {
      scope: SecurityScope.APPLICATION;
      context: SecurityContext;
      organization: Organization;
      project: Project;
      application: Application;
    }
  | {
      scope: SecurityScope.ENVIRONMENT;
      context: SecurityContext;
      organization: Organization;
      project: Project;
      application: Application;
      environment: Environment;
    };

/**
 * Resolves and verifies tenant resource ownership for Security Product.
 *
 * This service checks resource existence and parent-child relationships.
 * It does not authenticate users, evaluate permissions, or enforce tenant
 * lifecycle/status policies.
 */
export class TenantResourceOwnershipService {
  constructor(
    private readonly tenantLookup: TenantResourceOwnershipPort,
    private readonly contextValidation: SecurityContextValidationPort,
  ) {}

  async resolve(input: unknown): Promise<TenantResourceOwnershipResult> {
    // First validate the untrusted input against the Core context schema.
    const parsedContext = this.contextValidation.validateContext(input);

    // Then apply the existing scope rules and use the normalized context.
    const context = this.contextValidation.validateBoundary(parsedContext);

    switch (context.scope) {
      case SecurityScope.ORGANIZATION:
        return this.resolveOrganization(context);

      case SecurityScope.PROJECT:
        return this.resolveProject(context);

      case SecurityScope.APPLICATION:
        return this.resolveApplication(context);

      case SecurityScope.ENVIRONMENT:
        return this.resolveEnvironment(context);

      case SecurityScope.PLATFORM:
      case SecurityScope.FIELD:
        throw new TenantResourceOwnershipError(
          "UNSUPPORTED_SCOPE",
          `Tenant ownership resolution does not support scope: ${context.scope}`,
        );

      default:
        throw new TenantResourceOwnershipError(
          "UNSUPPORTED_SCOPE",
          "The supplied scope cannot be resolved as a tenant resource.",
        );
    }
  }

  private async resolveOrganization(
    context: SecurityContext,
  ): Promise<TenantResourceOwnershipResult> {
    const organizationId = this.requireId(
      context.organizationId,
      "organizationId",
    );

    const organization =
      await this.tenantLookup.findOrganizationById(organizationId);

    if (!organization) {
      throw new TenantResourceOwnershipError(
        "ORGANIZATION_NOT_FOUND",
        "The requested organization could not be resolved.",
      );
    }

    if (organization.id !== organizationId) {
      this.throwOwnershipMismatch();
    }

    return {
      scope: SecurityScope.ORGANIZATION,
      context,
      organization,
    };
  }

  private async resolveProject(
    context: SecurityContext,
  ): Promise<TenantResourceOwnershipResult> {
    const organizationId = this.requireId(
      context.organizationId,
      "organizationId",
    );

    const projectId = this.requireId(context.projectId, "projectId");

    const organization =
      await this.tenantLookup.findOrganizationById(organizationId);

    if (!organization) {
      throw new TenantResourceOwnershipError(
        "ORGANIZATION_NOT_FOUND",
        "The requested organization could not be resolved.",
      );
    }

    const project = await this.tenantLookup.findProjectById(
      organizationId,
      projectId,
    );

    if (!project) {
      throw new TenantResourceOwnershipError(
        "PROJECT_NOT_FOUND",
        "The requested project could not be resolved in the organization.",
      );
    }

    if (
      project.id !== projectId ||
      project.organizationId !== organization.id
    ) {
      this.throwOwnershipMismatch();
    }

    return {
      scope: SecurityScope.PROJECT,
      context,
      organization,
      project,
    };
  }

  private async resolveApplication(
    context: SecurityContext,
  ): Promise<TenantResourceOwnershipResult> {
    const organizationId = this.requireId(
      context.organizationId,
      "organizationId",
    );

    const projectId = this.requireId(context.projectId, "projectId");

    const applicationId = this.requireId(
      context.applicationId,
      "applicationId",
    );

    const organization =
      await this.tenantLookup.findOrganizationById(organizationId);

    if (!organization) {
      throw new TenantResourceOwnershipError(
        "ORGANIZATION_NOT_FOUND",
        "The requested organization could not be resolved.",
      );
    }

    const project = await this.tenantLookup.findProjectById(
      organizationId,
      projectId,
    );

    if (!project) {
      throw new TenantResourceOwnershipError(
        "PROJECT_NOT_FOUND",
        "The requested project could not be resolved in the organization.",
      );
    }

    if (
      project.id !== projectId ||
      project.organizationId !== organization.id
    ) {
      this.throwOwnershipMismatch();
    }

    const application = await this.tenantLookup.findApplicationById(
      organizationId,
      projectId,
      applicationId,
    );

    if (!application) {
      throw new TenantResourceOwnershipError(
        "APPLICATION_NOT_FOUND",
        "The requested application could not be resolved in the project.",
      );
    }

    if (
      application.id !== applicationId ||
      application.organizationId !== organization.id ||
      application.projectId !== project.id
    ) {
      this.throwOwnershipMismatch();
    }

    return {
      scope: SecurityScope.APPLICATION,
      context,
      organization,
      project,
      application,
    };
  }

  private async resolveEnvironment(
    context: SecurityContext,
  ): Promise<TenantResourceOwnershipResult> {
    const organizationId = this.requireId(
      context.organizationId,
      "organizationId",
    );

    const projectId = this.requireId(context.projectId, "projectId");

    const applicationId = this.requireId(
      context.applicationId,
      "applicationId",
    );

    const environmentId = this.requireId(
      context.environmentId,
      "environmentId",
    );

    const organization =
      await this.tenantLookup.findOrganizationById(organizationId);

    if (!organization) {
      throw new TenantResourceOwnershipError(
        "ORGANIZATION_NOT_FOUND",
        "The requested organization could not be resolved.",
      );
    }

    const project = await this.tenantLookup.findProjectById(
      organizationId,
      projectId,
    );

    if (!project) {
      throw new TenantResourceOwnershipError(
        "PROJECT_NOT_FOUND",
        "The requested project could not be resolved in the organization.",
      );
    }

    if (
      project.id !== projectId ||
      project.organizationId !== organization.id
    ) {
      this.throwOwnershipMismatch();
    }

    const application = await this.tenantLookup.findApplicationById(
      organizationId,
      projectId,
      applicationId,
    );

    if (!application) {
      throw new TenantResourceOwnershipError(
        "APPLICATION_NOT_FOUND",
        "The requested application could not be resolved in the project.",
      );
    }

    if (
      application.id !== applicationId ||
      application.organizationId !== organization.id ||
      application.projectId !== project.id
    ) {
      this.throwOwnershipMismatch();
    }

    const environment = await this.tenantLookup.findEnvironmentById(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    );

    if (!environment) {
      throw new TenantResourceOwnershipError(
        "ENVIRONMENT_NOT_FOUND",
        "The requested environment could not be resolved in the application.",
      );
    }

    if (
      environment.id !== environmentId ||
      environment.organizationId !== organization.id ||
      environment.projectId !== project.id ||
      environment.applicationId !== application.id
    ) {
      this.throwOwnershipMismatch();
    }

    return {
      scope: SecurityScope.ENVIRONMENT,
      context,
      organization,
      project,
      application,
      environment,
    };
  }

  private requireId(value: string | undefined, field: string): string {
    if (!value || value.trim().length === 0) {
      throw new TenantResourceOwnershipError(
        "INVALID_CONTEXT",
        `The validated security context is missing ${field}.`,
      );
    }

    return value;
  }

  private throwOwnershipMismatch(): never {
    throw new TenantResourceOwnershipError(
      "OWNERSHIP_MISMATCH",
      "The requested tenant resources do not match the expected ownership hierarchy.",
    );
  }
}
