# TraceMind — Phase 11.2.2

## Define Security Product Responsibilities

**Plan:** B — Security Product  
**Phase:** 11 — Security Product Foundation  
**Step:** 11.2.2 — Define Security Product Responsibilities  
**Source baseline:** `zip-9.zip`  
**Status:** Implementation artifacts prepared; pending user review and verification

---

## 1. Objective

Define the responsibility of the Security Product layer before implementing product services. Security Product must turn the existing Security Core into a manageable TraceMind product without duplicating cryptographic primitives, the tenant hierarchy, common infrastructure, or future IAM.

This step establishes ownership and boundaries. It does not implement database persistence, customer-facing REST APIs, the dashboard, or IAM.

## 2. Product definition

**Security Product** is the TraceMind product layer that manages security resources and coordinates the existing Security Core to provide customer-facing security capabilities.

It owns product-level workflows and resource lifecycle. It delegates cryptographic operations to Security Core, uses the existing tenant hierarchy, and will use repository interfaces and persistence adapters introduced in the planned persistence phase.

Security Product is not a second cryptography library and is not the IAM product.

## 3. Responsibility matrix

| Capability                                                                 | Owning layer                                                                               | Security Product responsibility                                                                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Encryption, decryption, hashing, signing, HMAC and verification primitives | Security Core                                                                              | Invoke the established public operation contracts; do not reimplement crypto                                                         |
| Crypto provider implementations and key-material operations                | Security Core/provider layer                                                               | Do not import or manipulate concrete provider internals                                                                              |
| Low-level key-provider contract operations                                 | Security Core                                                                              | Integrate through the exposed key-management contract; do not assume it is part of `SecurityService`                                 |
| Product-level key resource lifecycle                                       | Security Product                                                                           | Orchestrate customer-facing key creation, metadata, version lifecycle and status workflows in later phases                           |
| Durable key metadata and version records                                   | Security Product persistence layer                                                         | Define requirements now; schema and repositories belong to Phase 12                                                                  |
| Raw cryptographic key material                                             | Approved security provider/KMS boundary                                                    | Never expose in customer API responses or store in ordinary MySQL metadata tables                                                    |
| Organization/project/application/environment hierarchy                     | Tenants module                                                                             | Reuse existing ownership relationships and tenant services; do not create a parallel hierarchy                                       |
| Tenant authorization and actor permissions                                 | Authentication/authorization integration boundary; future IAM adapter                      | Require trusted authorization results before sensitive operations; do not treat tenant IDs or SecurityContext as proof of permission |
| Shared request context, common errors and validation utilities             | Common infrastructure                                                                      | Reuse existing components where suitable; do not create duplicate shared frameworks                                                  |
| Security configuration lifecycle                                           | Security Product                                                                           | Own product-level configuration resources, validation, versioning and resolution; encrypted values delegate to Security Core         |
| Secrets and credential lifecycle                                           | Security Product                                                                           | Own secret resource metadata, version lifecycle, expiry and access workflows; protect secret values using Security Core              |
| Security audit records and audit queries                                   | Security Product, integrated with TraceMind monitoring/audit infrastructure when available | Define audit requirements; avoid logging plaintext secrets, raw key material or sensitive payloads                                   |
| REST endpoints, request/response DTOs and OpenAPI contracts                | Security Product API layer                                                                 | Expose approved product workflows in Phase 16; do not couple controllers to provider implementations                                 |
| Customer security dashboard                                                | Security Product frontend                                                                  | Consume product APIs; dashboard is Phase 19                                                                                          |
| Subscription, entitlements, quotas and billing                             | TraceMind SaaS platform                                                                    | Integrate through explicit contracts when needed; do not make Security Core responsible for commercial rules                         |
| Production KMS and external provider rollout                               | Security Core/provider integration and Security Product configuration boundary             | Preserve provider abstraction; production rollout and readiness are Phase 20                                                         |

## 4. Responsibilities owned by Security Product

### 4.1 Security resource orchestration

Security Product coordinates customer-facing workflows for:

- Key resources and key-version lifecycle.
- Security configuration resources and resolution.
- Secrets and credential resources.
- Security audit and activity views.
- Product-level validation, lifecycle rules and safe response shaping.

Detailed service behavior belongs to Phases 13–18. This step defines ownership only.

### 4.2 Product-level validation

Security Product validates product-specific inputs and lifecycle rules, including resource identifiers, supported operations, version/status transitions, and configuration/secret constraints.

It must reuse the Security Core's security-context and boundary validators where those validators are the correct contract. It must not duplicate the tenant hierarchy rules already owned by `src/modules/tenants/`.

### 4.3 Tenant-scoped resource ownership

Every persisted security resource must have a documented tenant/resource scope and ownership relationship. The exact schema and repository enforcement are Phase 12 work.

Security Product must not infer ownership from a request body alone. It must use trusted resource lookups and the existing tenant hierarchy. Authorization is a separate requirement and is not provided merely by validating a `SecurityContext`.

### 4.4 Safe product-facing contracts

Product services must return safe resource metadata and stable application-level errors. They must not expose:

- Raw key material.
- Plaintext secret values except through a specifically designed and authorized retrieval operation in the later secrets phase.
- Provider credentials or private provider configuration.
- Internal provider objects, mutable maps, or implementation-specific class instances.
- Stack traces or sensitive input values in public errors.

### 4.5 Auditability

Security Product defines which business operations need audit events and which actor, tenant, resource, correlation, result, and timestamp fields are required. The implementation must reuse an existing TraceMind audit/monitoring service if one exists at implementation time; the supplied `zip-9.zip` does not contain a populated `src/modules/monitoring/` implementation.

Audit persistence, append-only controls, retrieval and retention are Phase 18. This step does not invent a monitoring API.

## 5. Explicit non-responsibilities

Security Product must not:

1. Implement its own encryption, hashing, signing, HMAC, or crypto algorithms.
2. import concrete local provider classes into product business services.
3. create another Organization/Project/Application/Environment model or duplicate tenant lifecycle logic.
4. store raw key material in ordinary MySQL tables.
5. treat a caller-supplied `organizationId`, `projectId`, `applicationId`, or `environmentId` as proof of ownership or permission.
6. treat `SecurityContext`, request IDs, or trace IDs as an authenticated actor identity.
7. implement a new IAM product in Phase 11.
8. embed subscription, billing, entitlement or quota policy inside Security Core.
9. implement schemas/repositories early as part of this step; those belong to Phase 12.
10. expose public APIs or dashboard pages early; those belong to Phases 16 and 19.
11. silently fall back to a different provider after a provider/security failure.
12. leak secrets, cryptographic material, or sensitive request data through logs, errors, audit events, or API responses.

## 6. Proposed logical module organization

This is the intended logical organization, not a claim that all folders or files already exist.

```text
src/modules/security-product/
  README.md
  domain/                  # Product resource concepts and lifecycle rules
  application/
    interfaces/            # Product-facing ports and repository contracts
    services/              # Product orchestration services (later steps)
    dto/                   # Product request/result contracts (later steps)
  infrastructure/
    repositories/           # Persistence adapters (Phase 12)
  api/                     # Controllers/routes/contracts (Phase 16)
```

Do not create empty TypeScript files solely to match this diagram. Add a file only when its contract or behavior is defined and tested in the relevant substep. The folder structure may be refined after reviewing existing project conventions.

## 7. Dependency rules

The required direction is:

```text
Security Product API (Phase 16)
             |
             v
Security Product application services
       |            |             |
       v            v             v
 Security Core    Tenants       Common
 public contracts contracts    utilities
       |
       v
 Provider abstractions / implementations remain inside Security Core

Security Product application services
             |
             v
 Repository interfaces (Phase 12)
             |
             v
 MySQL persistence adapters (Phase 12)
```

Rules:

- Product services depend on stable contracts, not local provider classes.
- Security Core must not import Security Product.
- Tenant services must not import Security Product as a way to validate their own hierarchy.
- Product domain/application code must not directly open MySQL connections or issue SQL.
- Controllers/routes must not call providers or repositories directly.
- Avoid circular imports and broad imports that expose implementation internals.
- Do not change existing public exports until compatibility impact is reviewed and regression tests are planned.
- The composition root is responsible for wiring concrete implementations.
- Commercial entitlements and actor authorization are distinct: a plan may enable a capability, while authorization determines whether an actor may use it.

## 8. Implementation sequencing

| Later phase | Security Product responsibility implemented there                                                |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Phase 11    | Boundaries, contracts, shared integration rules and threat model                                 |
| Phase 12    | Persistence schema, repository interfaces/adapters, transaction and tenant-isolation enforcement |
| Phase 13    | Product key-management workflows over Security Core contracts and persistent metadata            |
| Phase 14    | Security configuration lifecycle and resolution                                                  |
| Phase 15    | Secrets and credentials lifecycle                                                                |
| Phase 16    | Customer-facing APIs and API contracts                                                           |
| Phase 17    | Authentication, trusted actor context and authorization integration boundary                     |
| Phase 18    | Security audit integration, persistence, retrieval and retention                                 |
| Phase 19    | Security Product dashboard                                                                       |
| Phase 20    | Production KMS/provider readiness and operational hardening                                      |

## 9. Specification checklist

This substep's specification is satisfied when the following rules are explicit and accepted:

- [ ] Security Core owns cryptographic primitives and provider internals.
- [ ] Security Product owns product-level resource workflows and safe product contracts.
- [ ] Tenant hierarchy remains owned by `src/modules/tenants/`.
- [ ] Product services use stable contracts rather than concrete local providers.
- [ ] Persistence implementation remains in Phase 12.
- [ ] Public API implementation remains in Phase 16.
- [ ] Authentication/authorization integration is kept separate from IAM product development.
- [ ] Audit requirements are defined without assuming a monitoring service exists in the current archive.
- [ ] No raw key material is stored in ordinary MySQL metadata tables.
- [ ] Commercial entitlements/billing remain separate from crypto and actor authorization.
- [ ] No implementation is added ahead of the relevant phase.

## 10. Manual verification checklist

Review the proposed responsibilities and answer each item based on the actual repository and agreed roadmap:

1. Does Security Product own orchestration/resource lifecycle rather than cryptographic primitives?
2. Does the design preserve the current `SecurityService` and separate `SecurityServiceKeyManagementApi` contracts?
3. Does it reuse the existing tenant hierarchy rather than adding a duplicate hierarchy?
4. Does it prevent product services from importing concrete local providers?
5. Does it keep schema/repository implementation in Phase 12?
6. Does it keep public API implementation in Phase 16?
7. Does it defer IAM while retaining a future authentication/authorization integration boundary?
8. Does it avoid claiming an implemented monitoring/audit service where the supplied archive has none?
9. Does it keep billing/entitlements outside Security Core?
10. Are the scope and non-responsibilities clear enough to guide 11.2.3 without guessing?

## 11. Automated verification scope

This step changes documentation and the module responsibility README only. It does not change TypeScript runtime code, exports, routes, schemas, or provider behavior. No new automated test is justified solely to assert prose in Markdown.

After manually applying the two documentation artifacts, run the project's normal gates to confirm no accidental source/config changes occurred:

```powershell
npm run test:security
npm run test:security:manual
npm run type-check
npm run build
```

Record actual output. Do not mark this substep complete until the documentation is reviewed and the user confirms the verification results.

## 12. Decision and next step

**Decision requested:** Approve the responsibility matrix, non-responsibilities, and dependency rules above.

**Current status:** Artifacts prepared; awaiting review and working-tree verification.

**Next substep after approval:** 11.2.3 — Define Security Core Integration Boundary.
