## 11.1 Existing Architecture & Source Code Review

### 1. Current TraceMind stage

```js

— Plan A Security Core
Phases 1–10 · Reported complete

- Plan B — Security Product
Phase 11 · Security Product Foundation
Current step: 11.1 — Existing Architecture & Source Code Review

- Future IAM SaaS
Deferred. Define integration boundaries only where required by the current plan.js
```

### 2. Archive inspection summary

```js
Files in archive
396

Source files
342

Security Core spec files
67

Security Core manual-test files
60

Counts are from static archive inspection. They do not establish that the tests currently pass.
```

- The archive contains the Security Core implementation and extensive tests, tenant services and MySQL repositories, shared infrastructure, database schemas, and the Plan B documentation.

### 3. Actual folder structure and responsibilities

These are the principal existing areas relevant to Phase 11.1.

```js
`src/ `— Application
Express setup, startup, configuration, database, shared infrastructure and business modules.

`src/common/` — Shared application foundations
Errors, middleware, request context, API response types, validation-related types and utilities.

`src/modules/tenants/` — Tenant hierarchy
Organization, project, application and environment models, validation, services, repositories, controllers and routes.

`src/modules/security-core/` — Reusable security engine
Security contracts, crypto operations, providers, context validation, errors, the public service facade and tests.

`src/database/ and src/config/` — Persistence foundations
MySQL connection pool, environment configuration, tenant SQL schemas and schema runner.

`docs/ and scripts/` — Development records
Security Core and Security Product roadmaps, status records, architecture notes and the manual Security Core test runner.
```

- The `monitoring`, `iam`, `entitlements`, `alerting`, and `aiops` `module` directories are empty in this archive. We should not assume their implementations exist just because their directories or future roadmap entries exist.

### 4. How TraceMind currently covers tenants

The existing hierarchy is:

```js
        Organization
    Top-level customer boundary
              |
        Project
    Belongs to an organization
              |
        Application
    Belongs to a project and organization
              |
        Environment
    Belongs to an application, project and organization
```

**Existing implementation**
The hierarchy is represented in:

- `src/modules/tenants/models/`
- `src/modules/tenants/services/`
- `src/modules/tenants/repositories/interfaces/`
- `src/modules/tenants/repositories/mysql/`
- `src/modules/tenants/controllers/`
- `src/modules/tenants/routes/`
- `src/database/schemas/tenant/`

The SQL schemas contain important relational safeguards:

- Organization identity constraints.
- Project-to-organization foreign keys.
- Composite foreign keys that ensure an application belongs to the same organization as its project.
- Composite foreign keys that ensure an environment belongs to the same application, project and organization.
- Scoped uniqueness constraints and supporting indexes.
- Soft-delete timestamps and audit-oriented actor fields such as created_by, updated_by, and deleted_by.

The tenant services also perform parent lookups, uniqueness checks and lifecycle/business-rule validation. This gives us a useful foundation to reuse instead of creating another tenant hierarchy for Security Product.

Important distinction: hierarchy versus access control
The current tenant implementation helps validate which resources belong together. It does not, by itself, establish that an authenticated user is allowed to access them.

In this archive, I did not find authentication middleware connected to the tenant routes. This is an integration gap to track for the planned security and authorization phases—not a reason to implement the deferred IAM SaaS now.

Also, `src/modules/tenants/types/tenant-context.types.ts` is empty in the archive, so we must not assume a complete tenant request-context abstraction already exists.

### 5. How Security Core is implemented and reused

- The existing Security Core is a separate module with a meaningful application/domain/provider structure.

```js
                                            Security Core public service facade
                                                     `SecurityServiceFacade`
                                                              |
                        Application services                                             Security validation
Encryption, decryption, hashing, signing, HMAC and verification         Context validation, boundary validation and request checks
                                                               |
                                            Provider contracts and local implementation
                            `KeyProvider`, `CryptoProvider`, key-material, signing-key and HMAC-key interfaces
```

Relevant files include:

- `src/modules/security-core/security-core.container.ts`
- `src/modules/security-core/application/interfaces/security.service.interface.ts`
- `src/modules/security-core/application/services/security-service.facade.ts`
- `src/modules/security-core/application/services/security-service-key-management-api.service.ts`
- `src/modules/security-core/application/services/encryption.service.ts`
- `src/modules/security-core/application/services/security-context-validator.service.ts`
- `src/modules/security-core/application/services/security-boundary-validator.service.ts`
- `src/modules/security-core/domain/models/`
- `src/modules/security-core/providers/`
- `src/modules/security-core/**tests**/`

Existing reusable contracts
The SecurityService interface exposes:

- `encrypt()` and `decrypt()`
- `hash()` and `verifyHash()`
- `sign()` and `verifySignature()`
- `createHmac()` and `verifyHmac()`

Key lifecycle operations are currently exposed separately through `SecurityServiceKeyManagementApi`, including key creation, key metadata lookup, version lookup, rotation and status changes.

That distinction matters: the product layer must not assume key management is already part of the `SecurityService` facade.

Security context and tenant alignment
The existing `SecurityContext` includes:

- `scope`
- `organizationId`
- `projectId`
- `applicationId`
- `environmentId`
- `classification`
- `purpose`

This aligns well with the existing TraceMind tenant hierarchy. Phase 11 should document how Security Product constructs and validates this context using the trusted tenant resource relationships. It must not blindly trust tenant IDs supplied in a request.
**Current provider limitation**

The container constructs `LocalKeyProvider` and `LocalKeyMaterialProvider`. The key provider stores key metadata and versions in `Map` instances; the local key-material provider also holds generated key material in memory.

Consequently, these local maps are not durable persistence. A process restart loses their in-memory state. The product layer must preserve the Core contracts while Phase 12 establishes persistence boundaries and Phase 20 handles production KMS readiness.

I also found that `EncryptionService` currently depends on the concrete `LocalCryptoProvider`, despite the presence of provider abstractions. This is an architectural point to document and evaluate carefully; we should not refactor it casually during Phase 11.1.

**Reuse finding**

I searched the source imports and found no imports of Security Core from outside `src/modules/security-core/` in this archive.
That means the engine exists, but its reuse by the tenant or other business modules is not yet demonstrated in the supplied source. This is expected to be established through the Security Product boundary rather than by letting business modules access provider internals.

The intended rule remains:

- Product and business services use stable Security Core contracts.
- Security Core owns cryptographic operations.
- Security Product owns resource metadata, persistence, product-facing APIs, configuration/secrets services and audit integration.
- Raw key material must not be stored in ordinary MySQL metadata tables.
- Authentication, authorization and product entitlements remain separate concerns.

### 6. Common module and application wiring

The main request flow in the archive is:

```js
            src/index.ts
                |
                | Connect to MySQL
                v
            src/app.ts
                |
                | Request context middleware
                | JSON body parser
                v
            /api/v1
                |
                v
            src/routes/index.ts
                |
                v
            Tenant routes
                |
                v
            Controllers -> Services -> Repositories -> MySQL
```

The common layer provides reusable errors, request-context middleware, error handling, API response types and utility functions.

Several details need to be recorded during the architecture review:

1. **Request context**: The middleware sets requestId, traceId and spanId. I did not find the AsyncLocalStorage request-context implementation described in the earlier project context in this archive. The current source should therefore be treated as the actual baseline.
2. **Correlation headers**: The middleware accepts incoming x-request-id and x-trace-id values directly. Their validation and trust policy should be reviewed before sensitive product APIs rely on them.
3. **Error handling**: errorHandlerMiddleware exists in its dedicated file, but the request-context middleware file also contains an active duplicate implementation. This is a maintenance inconsistency to record, not automatically refactor in Phase 11.1.
4. **Database configuration**: src/config/database.ts is the file imported by the connection module. src/database/config/database.ts is empty in the archive.
5. **Route security**: The application mounts the tenant routes, but the reviewed route wiring does not demonstrate authentication or authorization enforcement.
   These findings help us avoid designing a new shared infrastructure layer when TraceMind already has reusable components—and avoid assuming that a missing capability is implemented.

### 7. Phase 11.1 architecture review — findings and gaps

- The following are findings from static inspection of the supplied archive, not a production security audit.

| Area                   | Finding                                                                     | Implication for Plan B                                                                        |
| ---------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Tenant hierarchy       | Models, services, repositories, and relational constraints exist.           | Reuse the current hierarchy.                                                                  |
| Security Core          | Facade and provider contracts exist.                                        | Integrate through stable contracts.                                                           |
| Key management         | Currently backed by an in-memory local provider.                            | Persistence must be designed without storing raw keys in MySQL.                               |
| Security Product       | No dedicated product API/service/repository layer was found.                | Establish the product boundary in Phase 11.                                                   |
| Tenant authorization   | Route-level authentication/access enforcement not demonstrated.             | Keep this explicit for Phase 17.                                                              |
| Request context        | Correlation IDs exist, but no `AsyncLocalStorage` implementation was found. | Confirm the required request-context integration contract.                                    |
| Monitoring/audit       | `src/modules/monitoring/` is empty in this archive.                         | Inspect common utilities and existing logger dependencies before designing audit integration. |
| IAM                    | `src/modules/iam/` is empty.                                                | Keep IAM deferred.                                                                            |
| Tenant automated tests | No tenant-specific test files were found in the supplied archive.           | Determine the required regression coverage before relying on tenant behavior.                 |
| Documentation          | Phase 11 and Phase 12 plans exist.                                          | Keep the agreed step sequence and scope boundaries.                                           |

**Additional verification blockers**

Two practical items must be addressed in the verification process:

- The `package.json` script `"test"` runs `tsx watch src/index.ts`, which starts the application rather than executing tests. Use the explicit test scripts until that script is intentionally corrected.
- I attempted to install dependencies in an isolated review copy to run the checks, but installation could not complete offline: the lockfile references an AWS CodeArtifact registry and the required package was not cached. Therefore, I have not independently verified the test suite, type-check or build against this archive.

The archive also includes `.env.local` and `.env.dev.` I did not disclose their values. Before sharing future archives, exclude environment files containing real credentials; if any shared values are actual non-local secrets, rotate them.

### 8. Phase 11.1 — spec and manual verification plan

Phase 11.1 should be a review-only stage. We should not add product code until we have recorded the current contracts and gaps.

**Automated baseline**
Run these from the actual TraceMind working directory after ensuring dependencies are installed.

```js
npm run test:security
npm run type-check
npm run build
```

These are the required regression and compile checks. Their results are still unverified for zip-9.zip.

**Manual baseline**

```js
npm run test:security:manual
```

The manual runner exists in the archive. Its result must be captured from the actual working tree.

**Architecture review checklist**

- Review checklist

```js
[ ] Confirm tenant hierarchy and SQL ownership constraints.
[ ] Record SecurityService and key-management public contracts.
[ ] Record all local provider dependencies and persistence limitations.
[ ] Confirm common middleware, error and request-context contracts.
[ ] Record which modules currently import Security Core.
[ ] Document missing product APIs, repositories and tenant authorization boundaries.
[ ] Confirm the Phase 11 scope does not implement IAM or Phase 12 persistence.
[ ] Record baseline test, type-check and build results from the working tree.
```

### 9. What I will preserve for the next stages

I will carry forward these working assumptions for the TraceMind project:

- `zip-9.zip` is the latest supplied source baseline.
- Plan A phases 1–10 are user-reported complete; I will not reopen them without evidence of a regression.
- Plan B phases 11–20 is the active development plan.
- The existing Organization → Project → Application → Environment hierarchy must be reused.
- Security Core remains the reusable engine; Security Product must wrap it rather than duplicate crypto operations.
- Phase 12 owns database persistence; later phases own key management, configuration, secrets, APIs, authorization integration, audit, dashboard and production KMS readiness.
- IAM remains deferred, with only necessary integration boundaries defined now.
- Each development step follows the agreed gates: source inspection, acceptance criteria, minimal changes, automated specs, manual verification, type-check, build, review and your confirmation.
- I will not claim checks passed unless they are actually executed successfully or you report the results from your working tree.
  This updates the **working project context for this conversation**; I cannot guarantee a permanent saved-memory write.

**Current conclusion**

The archive confirms a substantial Security Core and tenant foundation, but it does not yet show a complete Security Product layer. The main Phase 11 responsibility is to define that layer around the current implementation without duplicating tenant ownership, cryptographic logic or future IAM functionality.
The architecture review has identified the existing contracts, important limitations and verification blockers. No source files have been changed.
**Next gate**: Verify the automated and manual baseline in your actual TraceMind working tree and confirm the review findings. Once Phase 11.1 is signed off,
