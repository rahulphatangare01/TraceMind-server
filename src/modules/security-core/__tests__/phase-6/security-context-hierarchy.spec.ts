import { describe, expect, it } from "vitest";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import { validateSecurityContextHierarchy } from "../../utils/security-context-hierarchy.util.js";

const classification = DataClassification.SENSITIVE;

const purpose = SecurityPurpose.API_KEY;

describe("Security Context Hierarchy Validation", () => {
  it("should accept platform context without hierarchy IDs", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.PLATFORM,
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should accept organization hierarchy", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should accept project hierarchy", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.PROJECT,
      organizationId: "org-1",
      projectId: "project-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should accept application hierarchy", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.APPLICATION,
      organizationId: "org-1",
      projectId: "project-1",
      applicationId: "app-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should accept environment hierarchy", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-1",
      projectId: "project-1",
      applicationId: "app-1",
      environmentId: "production",
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject project without organization", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.PROJECT,
      projectId: "project-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain("projectId requires organizationId");
  });

  it("should reject application without project", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.APPLICATION,
      organizationId: "org-1",
      applicationId: "app-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain("applicationId requires projectId");
  });

  it("should reject application without organization", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.APPLICATION,
      projectId: "project-1",
      applicationId: "app-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain("applicationId requires organizationId");
  });

  it("should reject environment without application", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-1",
      projectId: "project-1",
      environmentId: "production",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain("environmentId requires applicationId");
  });

  it("should reject environment without project", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-1",
      applicationId: "app-1",
      environmentId: "production",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain("environmentId requires projectId");
  });

  it("should reject environment without organization", () => {
    const result = validateSecurityContextHierarchy({
      scope: SecurityScope.ENVIRONMENT,
      projectId: "project-1",
      applicationId: "app-1",
      environmentId: "production",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain("environmentId requires organizationId");
  });
});
