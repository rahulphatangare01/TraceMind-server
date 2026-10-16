# TraceMind — Phase 11.2.1

## Review Existing Module Boundaries

**Plan:** B — Security Product  
**Phase:** 11 — Security Product Foundation  
**Step:** 11.2.1 — Review Existing Module Boundaries  
**Source baseline reviewed:** `zip-9.zip`  
**Status:** Documentation draft for review; not yet signed off

---

## 1. Objective

Inspect the existing TraceMind module structure, public exports, dependency wiring, and application composition so that Security Product can be added without duplicating Security Core, tenant ownership logic, common infrastructure, or database foundations.

This step is a source-review and documentation step. It does not introduce Security Product implementation code, persistence schemas, API routes, or IAM.

## 2. Scope

Included in this review:

- `src/modules/security-core/`
- `src/modules/tenants/`
- `src/common/`
- `src/database/`
- `src/app.ts`
- `src/routes/index.ts`
- Existing Security Product roadmap documentation

Excluded from this step:

- Security Product database schemas and MySQL repositories (Phase 12)
- Complete key-management service (Phase 13)
- Configuration service (Phase 14)
- Secrets and credentials service (Phase 15)
- Public Security Product APIs (Phase 16)
- Authentication/authorization implementation and IAM (Phase 17 and deferred IAM product)
- Security audit implementation (Phase 18)
- Security dashboard (Phase 19)
- Production KMS rollout (Phase 20)

## 3. Existing module inventory

### 3.1 Security Core

Root: `src/modules/security-core/`

Relevant source files and directories:

- `index.ts` — root barrel exports
- `security-core.container.ts` — constructs local providers, validators, application services, API services and the `securityCore` object
- `application/interfaces/security.service.interface.ts` — `SecurityService` contract
- `application/services/security-service.facade.ts` — facade implementation
- `application/services/security-service-key-management-api.service.ts` — key-management API service
- `application/services/index.ts` — exports application service implementations
- `providers/` — provider implementations and provider-specific interfaces
- `domain/`, `types/`, `schemas/`, `errors/`, `utils/` — security domain contracts and supporting logic
- `__tests__/` — Security Core automated tests

The `SecurityService` interface currently defines:

- `encrypt`
- `decrypt`
- `hash`
- `verifyHash`
- `sign`
- `verifySignature`
- `createHmac`
- `verifyHmac`

Key-management operations are exposed separately through `SecurityServiceKeyManagementApi` and the container's `securityServiceKeyManagementApi` property. Do not assume key management is part of the `SecurityService` interface.

The root `src/modules/security-core/index.ts` currently exports `security-core.container.js`, `SecurityServiceFacade`, several provider interfaces, context validators/utilities, types, and errors. It does not currently re-export `application/interfaces/security.service.interface.ts`. The root barrel also exposes the container, which exposes local provider instances. This is a boundary concern to evaluate in Phase 11.2; do not change it as part of this review without a separately approved implementation step.

The container currently constructs local implementations, including `LocalKeyProvider`, `LocalKeyMaterialProvider`, `LocalSigningKeyProvider`, `LocalHmacKeyProvider`, and `LocalCryptoProvider`. Local in-memory state is not durable across process restarts. Persistence is explicitly handled later in Phase 12; production KMS readiness is Phase 20.

### 3.2 Tenant module

Root: `src/modules/tenants/`

Existing areas include:

- `models/` — organization, project, application and environment models/types
- `services/` — tenant business services
- `repositories/interfaces/` — tenant repository contracts
- `repositories/mysql/` — MySQL repository implementations
- `controllers/` and `routes/` — HTTP layer
- `container/tenant.container.ts` — tenant dependency construction
- `index.ts` — tenant module barrel exports
- `lifecycle/` — lifecycle-related utilities

The existing tenant hierarchy is:

`Organization → Project → Application → Environment`

The SQL schema files are under `src/database/schemas/tenant/`. The supplied schemas use relational constraints, including composite foreign keys intended to preserve parent/child ownership relationships.

Security Product must reuse this hierarchy. It must not create a second organization/project/application/environment hierarchy or treat caller-supplied tenant identifiers as proof of ownership.

The file `src/modules/tenants/types/tenant-context.types.ts` is empty in this archive. A complete tenant request-context type must not be assumed to exist based on that file path alone.

### 3.3 Common infrastructure

Root: `src/common/`

Relevant components include:

- `errors/` — shared application errors
- `middleware/` — request context and validation middleware
- `types/` — API response types
- `utils/` — response and async-handler utilities

`src/app.ts` registers request-context middleware, JSON parsing, the API router, health endpoint, and error-handler middleware.

The request-context middleware currently places `requestId`, `traceId`, and `spanId` on the Express request. It reads `x-request-id` and `x-trace-id` when supplied and otherwise generates identifiers. The trust and validation policy for externally supplied correlation headers should be reviewed before relying on these values for security decisions. Correlation IDs are diagnostic metadata; they are not authentication or authorization evidence.

The archive contains an inconsistency between `src/common/middleware/error-handler.middleware.ts` and the error-handler implementation present in `src/common/middleware/request-context.middleware.ts`. This should be recorded and addressed in the appropriate scope, not silently refactored during this documentation step.

### 3.4 Database foundation

Root: `src/database/`

The archive includes:

- `src/database/connection.ts`
- `src/database/index.ts`
- `src/database/scripts/run-schemas.ts`
- `src/database/schemas/tenant/`

`src/config/database.ts` is imported by the connection module. `src/database/config/database.ts` is empty in this archive.

Phase 11 defines the persistence integration boundary only. Security Product schema design, repositories, transactions, and restart-persistence tests belong to Phase 12.

### 3.5 Application composition

`src/app.ts` imports `src/routes/index.ts`. The root router mounts the tenant routes. The reviewed route wiring does not demonstrate authentication or authorization middleware. This is a gap to preserve in the Phase 17 integration requirements; it is not permission to build IAM during Phase 11.

## 4. Existing dependency and reuse findings

1. The Security Core has a facade and typed operation contracts, but the root barrel exposes implementation-oriented objects, including the container and local provider instances.
2. `SecurityService` and the key-management API are separate contracts and must remain distinct unless a later reviewed design explicitly changes them.
3. The tenant module already owns the organization/project/application/environment hierarchy and its persistence relationships.
4. Common middleware and errors already exist and should be reused where their contracts fit.
5. No imports of Security Core from outside `src/modules/security-core/` were found in the supplied archive's source import scan. Thus, the archive does not yet demonstrate production reuse of Security Core by other business modules.
6. The supplied archive has no implemented Security Product module. Its structure and contracts must be established without prematurely implementing Phase 12–20.
7. `src/modules/iam/`, `src/modules/monitoring/`, `src/modules/entitlements/`, `src/modules/alerting/`, and `src/modules/aiops/` are empty in the supplied archive. Future roadmap references to these modules must not be treated as implemented capabilities.

## 5. Proposed target boundary (for approval)

This is the proposed dependency direction for the Security Product work. It is a design target, not a claim that the structure already exists.

```text
HTTP/API layer (Phase 16)
          |
          v
Security Product application services
          |
          +------> Security Core public operation contracts
          |
          +------> Tenant module contracts/services
          |
          +------> Common errors, validation and request context
          |
          +------> Persistence repository interfaces (Phase 12)
                         |
                         v
                  MySQL repository adapters
```

Rules:

- Security Product orchestrates security resources and customer-facing product behavior.
- Security Core remains responsible for reusable cryptographic operations and security primitives.
- Security Product must not import concrete local provider classes or manipulate provider internals.
- Tenant ownership must be validated using existing tenant relationships and trusted resource lookups.
- Common infrastructure may be reused; duplicate error, request-context, and response systems should not be introduced.
- Repository interfaces belong at the product/application boundary; MySQL implementations belong in infrastructure/persistence.
- HTTP controllers/routes must not be coupled directly to Security Core providers.
- IAM, subscription entitlements, billing, and usage metering remain separate concerns. Only stable integration boundaries should be defined when required.
- Do not persist raw cryptographic key material in ordinary MySQL tables.
- Encryption and authorization are separate controls. A valid `SecurityContext` does not prove that the requesting actor is authorized.

## 6. Boundary concerns to evaluate during Phase 11.2

These are review items, not automatic refactoring instructions:

1. Decide whether Security Product should consume an explicit stable Security Core facade contract rather than the entire root barrel.
2. Decide how key-management operations should be exposed to product services without leaking concrete provider instances.
3. Establish allowed imports between Security Product, Security Core, tenants, common, and database modules.
4. Keep application composition in a clear composition root; avoid constructing providers in product business services.
5. Prevent circular imports and direct database access from domain/application services.
6. Define the trusted inputs needed to construct `SecurityContext`; do not derive authorization from untrusted request body identifiers.
7. Document how correlation metadata enters product operations without treating it as a security principal.
8. Keep changes to existing Security Core exports backward-compatible and covered by the existing regression suite.

## 7. Acceptance criteria for 11.2.1

- [ ] Existing module structure and relevant public exports are documented.
- [ ] Security Core operation and key-management contracts are distinguished.
- [ ] Tenant hierarchy and ownership boundaries are documented.
- [ ] Common infrastructure and application composition are documented.
- [ ] Current gaps and risks are separated from implemented capabilities.
- [ ] Phase 12–20 exclusions are respected.
- [ ] Proposed dependency direction is reviewed and approved.
- [ ] No production source code was changed by this review step.

## 8. Verification record

The user reported the following checks passed in the actual TraceMind working tree after Phase 11.1:

- `npm run test:security`
- `npm run test:security:manual`
- `npm run type-check`
- `npm run build`

These are the Phase 11.1 baseline results as user-reported. They do not independently prove that future Phase 11.2 changes pass.

For any code changes made in Phase 11.2, run the relevant automated and manual tests, type-check, and build again.

## 9. Decision record

**Decision requested:** Approve or amend the proposed Security Product dependency direction and the boundary concerns in Section 6.

**Current status:** Source review and documentation draft prepared. Awaiting review before treating 11.2.1 as complete or implementing boundary changes.

**Next substep after approval:** 11.2.2 — Define Security Product Responsibilities.
