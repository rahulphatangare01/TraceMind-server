import type { SecurityContext } from "../domain/models/security-context.js";

export interface SecurityBoundaryValidationResult {
  valid: boolean;
  errors: string[];
  context: SecurityContext;
}
