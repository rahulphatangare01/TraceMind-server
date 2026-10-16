# TraceMind Security Product — Architecture Specification

**Status:** Proposed architecture baseline for Phase 11.2  
**Module:** `src/modules/security-product/`  
**Related module:** `src/modules/security-core/`  
**Future integration:** IAM  
**Scope:** Architecture and module contracts

---

## 1. Purpose

Security Product is the product-facing security module within TraceMind. It exposes security capabilities through stable application contracts, coordinates tenant-resource ownership checks, integrates with common infrastructure, and defines the boundaries required for persistence and future product APIs.

Security Product uses Security Core for cryptographic and security operations. Security Core remains independently reusable and must not depend on Security Product.

This specification records the agreed boundaries. It does not introduce new runtime behavior or claim that future APIs, database persistence implementations, dashboards, or IAM integrations already exist.

## 2. Architectural Context

TraceMind is the SaaS platform. Security Product is a security module and potential independently offered security product. Security Core is the reusable security engine used by Security Product and other approved consumers.

The future IAM product is planned separately. Its integration is represented by a contract only; a concrete IAM implementation is outside the current scope.

### Logical architecture

```text
TraceMind SaaS Platform
        |
        v
Security Product
  |       |        |
  |       |        +--> Common Infrastructure contracts
  |       |
  |       +-----------> Tenant Resource Ownership boundary
  |
  +-------------------> Security Core public API
  |
  +-------------------> Persistence ports
  |
  +-------------------> Future IAM authorization port
                           (future adapter only)
```

The diagram describes logical relationships and contracts. It does not imply that every adapter or production persistence implementation is already wired.

## 3. Responsibilities

### 3.1 Security Product

Security Product is responsible for:

- Coordinating product-level security use cases.
- Exposing stable application-level service and persistence contracts.
- Using the Security Core public API for security operations.
- Applying the tenant-resource ownership boundary.
- Defining integration contracts for common infrastructure.
- Defining a future IAM authorization integration point.
- Providing the product-level foundation for future persistence, APIs, auditing, and dashboard capabilities.

Security Product must not reimplement cryptographic algorithms, own a competing IAM engine, or bypass tenant ownership checks.

### 3.2 Security Core

Security Core is responsible for reusable security operations, including the cryptographic and key-management capabilities exposed through its curated public API.

Security Product must not depend on Security Core's internal implementation or provider classes when the public API provides the required capability.

Security Core must not import Security Product.

### 3.3 Tenant Resource Ownership

Tenant Resource Ownership validates whether a resource belongs to the requested tenant hierarchy using the established tenant contracts.

The current hierarchy is:

`Organization → Project → Application → Environment`

Ownership verification and lifecycle-state checks are separate concerns. Authorization does not replace ownership verification, and ownership verification does not itself grant permission to perform an action.

### 3.4 Common Infrastructure

Security Product consumes common infrastructure through contracts for facilities such as logging, request context, and identifiers.

Application services should not directly depend on concrete infrastructure implementations when a defined port is available.

### 3.5 Future IAM

The future IAM integration is represented by `FutureIamAuthorizationPort`.

The contract establishes the shape of an authorization request and decision. It does not authenticate actors, implement policies, validate tokens, or introduce an IAM runtime dependency.

A concrete adapter may be added when IAM is implemented and its integration is approved.

## 4. Dependency Rules

1. Security Product consumes Security Core through `security-core/public-api.ts`.
2. Security Core must not depend on Security Product.
3. Security Product must not import concrete IAM implementation classes.
4. Domain and application layers must not depend on MySQL repositories, database connection modules, or concrete infrastructure implementations.
5. Infrastructure adapters implement the appropriate application or domain contracts.
6. Composition code wires concrete implementations to their contracts.
7. Cross-module integration must use explicit contracts rather than undocumented internal imports.
8. No silent fallback to a different security provider is permitted.
9. Authentication, authorization, tenant ownership, and subscription entitlements are separate concerns.

## 5. Security Core Integration Contract

The `SecurityCorePort` groups the supported security operations and key-management contracts.

The public boundary is defined through the existing Security Core public API and the product integration contract.

Rules:

- Do not expose provider internals through Security Product application contracts.
- Do not persist raw cryptographic key material in the application's relational database.
- Key metadata and version metadata may be persisted according to the approved persistence design.
- Encryption and decryption must use the established Security Core contracts and security context requirements.
- Tenant ownership must be evaluated independently from cryptographic operations.

This specification does not define a new cryptographic envelope format or change existing algorithms.

## 6. Tenant Ownership Contract

Security Product uses the established tenant ownership service rather than implementing a second tenant hierarchy resolver.

The ownership boundary must respect the existing tenant hierarchy and repository/service contracts.

The persistence scope contract currently supports tenant-owned resources at these levels:

- Organization
- Project
- Application
- Environment

Platform-wide resources and field-level operations are not represented by this tenant-resource scope contract. They require explicit contracts if introduced later.

A scoped resource query must apply the tenant scope in the persistence operation. An unscoped lookup followed only by an ownership check is insufficient.

## 7. Persistence Boundary

Security Product defines persistence through `SecurityProductPersistencePort<TEntity, TCreateInput, TUpdateInput>` and `SecurityResourceScope`.

The persistence contract provides:

- `findById(scope, resourceId)`
- `create(scope, input)`
- `update(scope, resourceId, input)`
- `softDelete(scope, resourceId, deletedBy?)`

Contract expectations:

- Reads and mutations must be constrained by the complete supplied tenant scope.
- `findById` and `update` return `null` when no matching non-deleted resource exists.
- `softDelete` returns `false` when no matching resource was changed.
- The generic soft-delete operation must not physically delete the record.
- Implementations must reject scope/entity mismatches and use database constraints where available.
- Database-specific types and SQL must not leak through the generic application contract.

The generic port defines the boundary; it does not assert that all Security Product resource repositories or production persistence adapters have been implemented.

## 8. Future IAM Integration

The current integration contract includes:

- `SecurityProductActor`
- `SecurityProductAuthorizationRequest`
- `SecurityProductAuthorizationDecision`
- `FutureIamAuthorizationPort`

The request describes the actor, action, resource type, optional resource identifier, and tenant scope. The decision represents an allow/deny result and an optional decision identifier.

Rules:

- IAM is responsible for authorization policy evaluation.
- Security Product is responsible for calling the authorization boundary when a protected use case requires it.
- A denied decision must never be treated as an allowed decision.
- A missing IAM implementation must not be hidden behind a fabricated allow decision.
- IAM must not be required to initialize Security Core.
- Tenant ownership and entitlement checks remain independent of IAM authorization.

This contract is a future integration seam, not a claim that authorization enforcement is already integrated into all Security Product operations.

## 9. Common Infrastructure Contract

Security Product consumes the existing common infrastructure port for logging, request context, and identifiers.

Rules:

- Logging must not intentionally expose plaintext secrets, raw key material, credentials, or other sensitive payloads.
- Request context is contextual metadata, not proof of identity or authorization.
- Generated identifiers must be obtained through the defined contract where applicable.
- Infrastructure implementations remain replaceable without changing application-level contracts.

## 10. SaaS Entitlements and Billing

Product entitlements determine whether a module or feature is available under the relevant subscription.

IAM authorization determines whether an actor may perform a specific operation. Authentication establishes actor identity. Tenant ownership validates the resource's relationship to its tenant hierarchy.

Billing converts subscription and usage information into charges.

These responsibilities must not be collapsed into one check. The current specification does not claim that billing, entitlement enforcement, or future IAM integration is fully implemented.

## 11. Persistence and Data Protection Principles

- Enforce tenant isolation in persistence operations and, where available, database constraints.
- Use soft deletion for the generic resource deletion operation.
- Do not store raw cryptographic key material in ordinary application tables.
- Keep security-sensitive configuration and secrets behind approved security contracts.
- Apply telemetry redaction before encryption where required by the existing monitoring/security design.
- Do not silently downgrade security behavior when a provider or dependency fails.

Detailed schema design, key lifecycle persistence, audit retention, and operational recovery remain subject to their respective implementation phases.

## 12. Composition and Lifecycle

Concrete implementations should be assembled at an explicit composition boundary.

Application services should receive their dependencies through defined contracts. Constructing infrastructure, connecting to databases, or starting external services must not be an accidental side effect of importing a contract.

The composition root is responsible for wiring available implementations and surfacing initialization failures.

## 13. Testing and Verification

The architecture is supported by layered verification:

1. Contract tests verify the expected port behavior.
2. Manual checks verify selected boundary behavior.
3. Dependency checks detect selected forbidden imports.
4. Type-checking verifies compile-time compatibility.
5. Build verification checks the production compilation path.
6. Automated architecture-boundary tests are covered by the subsequent Phase 11.2.11.

Passing these checks does not prove that every production security property has been independently audited.

## 14. Out of Scope

This specification does not implement:

- IAM authentication or authorization policies.
- Production Security Product APIs or controllers.
- New database schemas or production persistence adapters.
- Subscription billing or entitlement enforcement.
- Dashboard functionality.
- New cryptographic algorithms or provider implementations.
- Automatic integration with external cloud key-management services.

These capabilities must be introduced only in their planned phases with their own contracts and verification.

## 15. Change Control

Changes to public ports, dependency direction, tenant-scope behavior, or Security Core integration require:

1. A documented reason for the change.
2. Review of affected contracts and consumers.
3. Updated automated and manual tests where appropriate.
4. Type-check and build verification.
5. Confirmation that the change remains within the approved TraceMind roadmap.

**End of specification.**
