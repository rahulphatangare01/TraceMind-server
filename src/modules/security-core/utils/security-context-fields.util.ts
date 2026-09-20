import type { SecurityContext } from "../domain/models/security-context.js";
import { getSecurityScopeRule } from "../constants/security-scope.rules.js";

export interface SecurityContextFieldValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateSecurityContextFields = (
  context: SecurityContext,
): SecurityContextFieldValidationResult => {
  const rule = getSecurityScopeRule(context.scope);

  const errors: string[] = [];

  const fields = [
    {
      name: "organizationId",
      value: context.organizationId,
      required: rule.requiresOrganizationId,
      allowed: rule.allowsOrganizationId,
    },
    {
      name: "projectId",
      value: context.projectId,
      required: rule.requiresProjectId,
      allowed: rule.allowsProjectId,
    },
    {
      name: "applicationId",
      value: context.applicationId,
      required: rule.requiresApplicationId,
      allowed: rule.allowsApplicationId,
    },
    {
      name: "environmentId",
      value: context.environmentId,
      required: rule.requiresEnvironmentId,
      allowed: rule.allowsEnvironmentId,
    },
  ];

  for (const field of fields) {
    const hasValue =
      field.value !== undefined && field.value !== null && field.value !== "";

    if (field.required && !hasValue) {
      errors.push(`${field.name} is required for ${context.scope} scope`);
    }

    if (!field.allowed && hasValue) {
      errors.push(`${field.name} is not allowed for ${context.scope} scope`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
