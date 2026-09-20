import { describe, expect, it } from "vitest";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import { normalizeSecurityContext } from "../../utils/security-context-normalization.util.js";

describe("Security Context Normalization", () => {
  it("should trim organizationId", () => {
    const context = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "  org-123  ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.organizationId).toBe("org-123");
  });

  it("should trim projectId", () => {
    const context = {
      scope: SecurityScope.PROJECT,
      organizationId: "org-123",
      projectId: "  project-123  ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.projectId).toBe("project-123");
  });

  it("should trim applicationId", () => {
    const context = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "  app-123  ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.applicationId).toBe("app-123");
  });

  it("should trim environmentId", () => {
    const context = {
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      environmentId: "  production  ",
      classification: DataClassification.SECRET,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.environmentId).toBe("production");
  });

  it("should trim all hierarchy IDs", () => {
    const context = {
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "  org-123  ",
      projectId: "  project-123  ",
      applicationId: "  app-123  ",
      environmentId: "  production  ",
      classification: DataClassification.SECRET,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.organizationId).toBe("org-123");

    expect(normalized.projectId).toBe("project-123");

    expect(normalized.applicationId).toBe("app-123");

    expect(normalized.environmentId).toBe("production");
  });

  it("should preserve undefined optional IDs", () => {
    const context = {
      scope: SecurityScope.PLATFORM,
      classification: DataClassification.SECRET,
      purpose: SecurityPurpose.SIGNING,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.organizationId).toBeUndefined();

    expect(normalized.projectId).toBeUndefined();

    expect(normalized.applicationId).toBeUndefined();

    expect(normalized.environmentId).toBeUndefined();
  });

  it("should preserve ID casing", () => {
    const context = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "  Org-ABC-123  ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.organizationId).toBe("Org-ABC-123");
  });

  it("should preserve internal whitespace", () => {
    const context = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "  org 123  ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.organizationId).toBe("org 123");
  });

  it("should preserve scope", () => {
    const context = {
      scope: SecurityScope.APPLICATION,
      organizationId: " org-123 ",
      projectId: " project-123 ",
      applicationId: " app-123 ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.scope).toBe(SecurityScope.APPLICATION);
  });

  it("should preserve classification", () => {
    const context = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: " org-123 ",
      classification: DataClassification.HIGHLY_SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.classification).toBe(DataClassification.HIGHLY_SENSITIVE);
  });

  it("should preserve purpose", () => {
    const context = {
      scope: SecurityScope.ENVIRONMENT,
      organizationId: " org-123 ",
      projectId: " project-123 ",
      applicationId: " app-123 ",
      environmentId: " production ",
      classification: DataClassification.SECRET,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized.purpose).toBe(SecurityPurpose.DATABASE_CREDENTIAL);
  });

  it("should not mutate the original context", () => {
    const context = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "  org-123  ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    };

    const originalOrganizationId = context.organizationId;

    const normalized = normalizeSecurityContext(context);

    expect(context.organizationId).toBe(originalOrganizationId);

    expect(context.organizationId).toBe("  org-123  ");

    expect(normalized.organizationId).toBe("org-123");
  });

  it("should return a new context object", () => {
    const context = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    };

    const normalized = normalizeSecurityContext(context);

    expect(normalized).not.toBe(context);
  });
});
