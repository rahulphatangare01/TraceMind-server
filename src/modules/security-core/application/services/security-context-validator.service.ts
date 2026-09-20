import type { SecurityContext } from "../../domain/models/security-context.js";

import { securityContextSchema } from "../../schemas/security-context.schema.js";

import { validateSecurityContextFields } from "../../utils/security-context-fields.util.js";

import { validateSecurityContextHierarchy } from "../../utils/security-context-hierarchy.util.js";

import { SecurityContextValidationError } from "../../errors/security-context-validation.error.js";

export class SecurityContextValidator {
  validate(input: unknown): SecurityContext {
    const schemaResult = securityContextSchema.safeParse(input);

    if (!schemaResult.success) {
      const errors = schemaResult.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "context";

        return `${path}: ${issue.message}`;
      });

      throw new SecurityContextValidationError(errors);
    }

    const context = schemaResult.data;

    const fieldValidation = validateSecurityContextFields(context);

    if (!fieldValidation.valid) {
      throw new SecurityContextValidationError(fieldValidation.errors);
    }

    const hierarchyValidation = validateSecurityContextHierarchy(context);

    if (!hierarchyValidation.valid) {
      throw new SecurityContextValidationError(hierarchyValidation.errors);
    }

    return context;
  }
}
