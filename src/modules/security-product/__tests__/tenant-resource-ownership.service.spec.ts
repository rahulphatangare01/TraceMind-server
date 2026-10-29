import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../security-core/public-api.js";

import { securityCore } from "../../security-core/security-core.container.js";

import type {
  Organization,
  Project,
  Application,
  Environment,
} from "../../tenants/models/index.js";

import type { TenantResourceOwnershipPort } from "../application/interfaces/tenant-resource-ownership.port.js";

import type { SecurityContextValidationPort } from "../application/interfaces/security-context-validation.port.js";

import { TenantResourceOwnershipService } from "../application/services/tenant-resource-ownership.service.js";

import { TenantResourceOwnershipError } from "../errors/tenant-resource-ownership.error.js";

const organization = {
  id: "org-1",
} as unknown as Organization;

const project = {
  id: "project-1",
  organizationId: "org-1",
} as unknown as Project;

const application = {
  id: "app-1",
  organizationId: "org-1",
  projectId: "project-1",
} as unknown as Application;

const environment = {
  id: "env-1",
  organizationId: "org-1",
  projectId: "project-1",
  applicationId: "app-1",
} as unknown as Environment;

const contextValidation: SecurityContextValidationPort = {
  validateContext: (input) =>
    securityCore.securityContextValidator.validate(input),

  validateBoundary: (context) =>
    securityCore.securityBoundaryValidator.validate(context).context,
};

describe("TenantResourceOwnershipService", () => {
  let tenantLookup: TenantResourceOwnershipPort;
  let service: TenantResourceOwnershipService;

  beforeEach(() => {
    tenantLookup = {
      findOrganizationById: vi.fn(async () => organization),

      findProjectById: vi.fn(async () => project),

      findApplicationById: vi.fn(async () => application),

      findEnvironmentById: vi.fn(async () => environment),
    };

    service = new TenantResourceOwnershipService(
      tenantLookup,
      contextValidation,
    );
  });

  it("resolves an organization-scoped context", async () => {
    const result = await service.resolve({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-1",
      classification: DataClassification.INTERNAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    });

    expect(result.scope).toBe(SecurityScope.ORGANIZATION);

    if (result.scope !== SecurityScope.ORGANIZATION) {
      throw new Error("Expected organization-scoped result");
    }

    expect(result.organization.id).toBe("org-1");

    expect(tenantLookup.findOrganizationById).toHaveBeenCalledWith("org-1");

    expect(tenantLookup.findProjectById).not.toHaveBeenCalled();
  });

  it("resolves an environment through the complete parent hierarchy", async () => {
    const result = await service.resolve({
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-1",
      projectId: "project-1",
      applicationId: "app-1",
      environmentId: "env-1",
      classification: DataClassification.INTERNAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    });

    expect(result.scope).toBe(SecurityScope.ENVIRONMENT);

    if (result.scope !== SecurityScope.ENVIRONMENT) {
      throw new Error("Expected environment-scoped result");
    }

    expect(result.organization.id).toBe("org-1");
    expect(result.project.id).toBe("project-1");
    expect(result.application.id).toBe("app-1");
    expect(result.environment.id).toBe("env-1");

    expect(tenantLookup.findProjectById).toHaveBeenCalledWith(
      "org-1",
      "project-1",
    );

    expect(tenantLookup.findApplicationById).toHaveBeenCalledWith(
      "org-1",
      "project-1",
      "app-1",
    );

    expect(tenantLookup.findEnvironmentById).toHaveBeenCalledWith(
      "org-1",
      "project-1",
      "app-1",
      "env-1",
    );
  });

  it("rejects a project that cannot be found in the requested organization", async () => {
    vi.mocked(tenantLookup.findProjectById).mockResolvedValueOnce(null);

    await expect(
      service.resolve({
        scope: SecurityScope.PROJECT,
        organizationId: "org-1",
        projectId: "project-404",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      name: "TenantResourceOwnershipError",
      code: "PROJECT_NOT_FOUND",
    });
  });

  //   it("rejects a project returned with a mismatched organization", async () => {
  //     vi.mocked(tenantLookup.findProjectById).mockResolvedValueOnce({
  //       ...project,
  //       organizationId: "org-other",
  //     } as Project);

  //     await expect(
  //       service.resolve({
  //         scope: SecurityScope.PROJECT,
  //         organizationId: "org-1",
  //         projectId: "project-1",
  //         classification: DataClassification.INTERNAL,
  //         purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  //       }),
  //     ).rejects.toBeInstanceOf(TenantResourceOwnershipError);

  //     await expect(
  //       service.resolve({
  //         scope: SecurityScope.PROJECT,
  //         organizationId: "org-1",
  //         projectId: "project-1",
  //         classification: DataClassification.INTERNAL,
  //         purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  //       }),
  //     ).rejects.toMatchObject({
  //       code: "OWNERSHIP_MISMATCH",
  //     });
  //   });

  it("resolves a project-scoped context", async () => {
    const result = await service.resolve({
      scope: SecurityScope.PROJECT,
      organizationId: "org-1",
      projectId: "project-1",
      classification: DataClassification.INTERNAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    });

    expect(result.scope).toBe(SecurityScope.PROJECT);

    if (result.scope !== SecurityScope.PROJECT) {
      throw new Error("Expected project-scoped result");
    }

    expect(result.organization.id).toBe("org-1");
    expect(result.project.id).toBe("project-1");
  });

  it("resolves an application-scoped context", async () => {
    const result = await service.resolve({
      scope: SecurityScope.APPLICATION,
      organizationId: "org-1",
      projectId: "project-1",
      applicationId: "app-1",
      classification: DataClassification.INTERNAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    });

    expect(result.scope).toBe(SecurityScope.APPLICATION);

    if (result.scope !== SecurityScope.APPLICATION) {
      throw new Error("Expected application-scoped result");
    }

    expect(result.organization.id).toBe("org-1");
    expect(result.project.id).toBe("project-1");
    expect(result.application.id).toBe("app-1");
  });

  it("rejects an organization that cannot be found", async () => {
    vi.mocked(tenantLookup.findOrganizationById).mockResolvedValueOnce(null);

    await expect(
      service.resolve({
        scope: SecurityScope.ORGANIZATION,
        organizationId: "org-404",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "ORGANIZATION_NOT_FOUND",
    });

    expect(tenantLookup.findProjectById).not.toHaveBeenCalled();
  });

  it("rejects an application that cannot be found", async () => {
    vi.mocked(tenantLookup.findApplicationById).mockResolvedValueOnce(null);

    await expect(
      service.resolve({
        scope: SecurityScope.APPLICATION,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-404",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "APPLICATION_NOT_FOUND",
    });
  });

  it("rejects an environment that cannot be found", async () => {
    vi.mocked(tenantLookup.findEnvironmentById).mockResolvedValueOnce(null);

    await expect(
      service.resolve({
        scope: SecurityScope.ENVIRONMENT,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        environmentId: "env-404",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "ENVIRONMENT_NOT_FOUND",
    });
  });

  it("rejects an application returned with a mismatched organization", async () => {
    vi.mocked(tenantLookup.findApplicationById).mockResolvedValueOnce({
      ...application,
      organizationId: "org-other",
    } as Application);

    await expect(
      service.resolve({
        scope: SecurityScope.APPLICATION,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "OWNERSHIP_MISMATCH",
    });
  });

  it("rejects an application returned with a mismatched project", async () => {
    vi.mocked(tenantLookup.findApplicationById).mockResolvedValueOnce({
      ...application,
      projectId: "project-other",
    } as Application);

    await expect(
      service.resolve({
        scope: SecurityScope.APPLICATION,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "OWNERSHIP_MISMATCH",
    });
  });

  it("rejects an environment returned with a mismatched organization", async () => {
    vi.mocked(tenantLookup.findEnvironmentById).mockResolvedValueOnce({
      ...environment,
      organizationId: "org-other",
    } as Environment);

    await expect(
      service.resolve({
        scope: SecurityScope.ENVIRONMENT,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        environmentId: "env-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "OWNERSHIP_MISMATCH",
    });
  });

  it("rejects an environment returned with a mismatched project", async () => {
    vi.mocked(tenantLookup.findEnvironmentById).mockResolvedValueOnce({
      ...environment,
      projectId: "project-other",
    } as Environment);

    await expect(
      service.resolve({
        scope: SecurityScope.ENVIRONMENT,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        environmentId: "env-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "OWNERSHIP_MISMATCH",
    });
  });

  it("rejects an environment returned with a mismatched application", async () => {
    vi.mocked(tenantLookup.findEnvironmentById).mockResolvedValueOnce({
      ...environment,
      applicationId: "app-other",
    } as Environment);

    await expect(
      service.resolve({
        scope: SecurityScope.ENVIRONMENT,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        environmentId: "env-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "OWNERSHIP_MISMATCH",
    });
  });

  it("rejects an organization lookup returning a different ID", async () => {
    vi.mocked(tenantLookup.findOrganizationById).mockResolvedValueOnce({
      ...organization,
      id: "org-other",
    } as Organization);

    await expect(
      service.resolve({
        scope: SecurityScope.ORGANIZATION,
        organizationId: "org-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "OWNERSHIP_MISMATCH",
    });
  });

  it("rejects an application lookup returning a different ID", async () => {
    vi.mocked(tenantLookup.findApplicationById).mockResolvedValueOnce({
      ...application,
      id: "app-other",
    } as Application);

    await expect(
      service.resolve({
        scope: SecurityScope.APPLICATION,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "OWNERSHIP_MISMATCH",
    });
  });

  it("rejects an environment lookup returning a different ID", async () => {
    vi.mocked(tenantLookup.findEnvironmentById).mockResolvedValueOnce({
      ...environment,
      id: "env-other",
    } as Environment);

    await expect(
      service.resolve({
        scope: SecurityScope.ENVIRONMENT,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        environmentId: "env-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      code: "OWNERSHIP_MISMATCH",
    });
  });

  // it("rejects field scope for tenant ownership resolution", async () => {
  //   await expect(
  //     service.resolve({
  //       scope: SecurityScope.FIELD,
  //       organizationId: "org-1",
  //       classification: DataClassification.INTERNAL,
  //       purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  //     }),
  //   ).rejects.toMatchObject({
  //     name: "TenantResourceOwnershipError",
  //     code: "UNSUPPORTED_SCOPE",
  //   });

  //   expect(tenantLookup.findOrganizationById).not.toHaveBeenCalled();
  // });

  it("rejects field scope for tenant ownership resolution", async () => {
    await expect(
      service.resolve({
        scope: SecurityScope.FIELD,
        organizationId: "org-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      name: "SecurityContextValidationError",
      code: "SECURITY_CONTEXT_VALIDATION_ERROR",
    });

    expect(tenantLookup.findOrganizationById).not.toHaveBeenCalled();
    expect(tenantLookup.findProjectById).not.toHaveBeenCalled();
    expect(tenantLookup.findApplicationById).not.toHaveBeenCalled();
    expect(tenantLookup.findEnvironmentById).not.toHaveBeenCalled();
  });
  it("rejects a project lookup returning a different project ID", async () => {
    vi.mocked(tenantLookup.findProjectById).mockResolvedValueOnce({
      ...project,
      id: "project-2",
    } as Project);

    await expect(
      service.resolve({
        scope: SecurityScope.PROJECT,
        organizationId: "org-1",
        projectId: "project-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      name: "TenantResourceOwnershipError",
      code: "OWNERSHIP_MISMATCH",
    });
  });
  it("rejects a project returned with a mismatched organization", async () => {
    vi.mocked(tenantLookup.findProjectById).mockResolvedValueOnce({
      ...project,
      organizationId: "org-other",
    } as Project);

    await expect(
      service.resolve({
        scope: SecurityScope.PROJECT,
        organizationId: "org-1",
        projectId: "project-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      name: "TenantResourceOwnershipError",
      code: "OWNERSHIP_MISMATCH",
    });
  });
  it("rejects a malformed context before looking up tenant resources", async () => {
    await expect(
      service.resolve({
        scope: SecurityScope.PROJECT,
        organizationId: "org-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toThrow();

    expect(tenantLookup.findOrganizationById).not.toHaveBeenCalled();
  });

  it("rejects platform scope for tenant ownership resolution", async () => {
    await expect(
      service.resolve({
        scope: SecurityScope.PLATFORM,
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      }),
    ).rejects.toMatchObject({
      name: "TenantResourceOwnershipError",
      code: "UNSUPPORTED_SCOPE",
    });
  });
});
