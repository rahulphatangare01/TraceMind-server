import type { SecurityContext } from "../domain/models/security-context.js";

export const hasOrganizationHierarchy = (context: SecurityContext): boolean => {
  return Boolean(context.organizationId);
};

export const hasProjectHierarchy = (context: SecurityContext): boolean => {
  return Boolean(context.organizationId && context.projectId);
};

export const hasApplicationHierarchy = (context: SecurityContext): boolean => {
  return Boolean(
    context.organizationId && context.projectId && context.applicationId,
  );
};

export const hasEnvironmentHierarchy = (context: SecurityContext): boolean => {
  return Boolean(
    context.organizationId &&
    context.projectId &&
    context.applicationId &&
    context.environmentId,
  );
};

export interface SecurityContextHierarchyValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateSecurityContextHierarchy = (
  context: SecurityContext,
): SecurityContextHierarchyValidationResult => {
  const errors: string[] = [];

  const hasOrganizationId = Boolean(context.organizationId);

  const hasProjectId = Boolean(context.projectId);

  const hasApplicationId = Boolean(context.applicationId);

  const hasEnvironmentId = Boolean(context.environmentId);

  if (hasProjectId && !hasOrganizationId) {
    errors.push("projectId requires organizationId");
  }

  if (hasApplicationId && !hasProjectId) {
    errors.push("applicationId requires projectId");
  }

  if (hasApplicationId && !hasOrganizationId) {
    errors.push("applicationId requires organizationId");
  }

  if (hasEnvironmentId && !hasApplicationId) {
    errors.push("environmentId requires applicationId");
  }

  if (hasEnvironmentId && !hasProjectId) {
    errors.push("environmentId requires projectId");
  }

  if (hasEnvironmentId && !hasOrganizationId) {
    errors.push("environmentId requires organizationId");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
