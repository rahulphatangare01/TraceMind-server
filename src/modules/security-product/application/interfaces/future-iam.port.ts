/**
 * Stable integration contracts for a future IAM product.
 *
 * This file must remain independent of IAM implementation classes,
 * persistence models, tokens, and provider-specific SDKs.
 */

import type { SecurityResourceScope } from "./security-resource-scope.port.js";

/**
 * Identifies the actor requesting an operation.
 *
 * Authentication is responsible for establishing this identity.
 * This contract does not authenticate actors or validate credentials.
 */
export interface SecurityProductActor {
  readonly actorId: string;
  readonly actorType: "USER" | "SERVICE" | "SYSTEM";
}

/**
 * Describes an authorization request without prescribing how IAM
 * evaluates policies, roles, permissions, or attributes.
 */
export interface SecurityProductAuthorizationRequest {
  readonly actor: SecurityProductActor;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId?: string;
  readonly scope: SecurityResourceScope;
}

/**
 * A decision returned by the future IAM integration.
 *
 * The decision is intentionally minimal. IAM remains responsible
 * for its own policy evaluation and internal authorization details.
 */
export interface SecurityProductAuthorizationDecision {
  readonly allowed: boolean;
  readonly decisionId?: string;
}

/**
 * Port through which Security Product may request an authorization
 * decision from a future IAM adapter.
 *
 * This interface does not implement authorization and does not
 * make IAM a required runtime dependency today.
 */
export interface FutureIamAuthorizationPort {
  authorize(
    request: SecurityProductAuthorizationRequest,
  ): Promise<SecurityProductAuthorizationDecision>;
}
