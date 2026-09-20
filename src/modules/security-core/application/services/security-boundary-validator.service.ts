import type { SecurityContext } from "../../domain/models/security-context.js";
import { getSecurityScopeRule } from "../../constants/security-scope.rules.js";
import { validateSecurityContextFields } from "../../utils/security-context-fields.util.js";
import { validateSecurityContextHierarchy } from "../../utils/security-context-hierarchy.util.js";
import { normalizeSecurityContext } from "../../utils/security-context-normalization.util.js";
import { SecurityBoundaryValidationError } from "../../errors/security-boundary-validation.error.js";
import type { SecurityBoundaryValidationResult } from "../../types/security-boundary.types.js";

export class SecurityBoundaryValidator {
  validate(context: SecurityContext): SecurityBoundaryValidationResult {
    const normalizedContext = normalizeSecurityContext(context);

    const errors: string[] = [];

    const rule = getSecurityScopeRule(normalizedContext.scope);

    if (!rule) {
      errors.push(`Unsupported security scope: ${normalizedContext.scope}`);

      throw new SecurityBoundaryValidationError(errors);
    }

    const fieldValidation = validateSecurityContextFields(normalizedContext);

    if (!fieldValidation.valid) {
      errors.push(...fieldValidation.errors);
    }

    const hierarchyValidation =
      validateSecurityContextHierarchy(normalizedContext);

    if (!hierarchyValidation.valid) {
      errors.push(...hierarchyValidation.errors);
    }

    if (errors.length > 0) {
      throw new SecurityBoundaryValidationError(errors);
    }

    return {
      valid: true,
      errors: [],
      context: normalizedContext,
    };
  }
}
