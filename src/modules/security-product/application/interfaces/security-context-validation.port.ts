import type { SecurityContext } from "../../../security-core/public-api.js";

/**
 * Adapter around the existing Security Core validators.
 *
 * This validates context shape and security-scope boundaries. It does not
 * authenticate an actor or authorize access to a tenant resource.
 */
export interface SecurityContextValidationPort {
  validateContext(input: unknown): SecurityContext;

  validateBoundary(context: SecurityContext): SecurityContext;
}
