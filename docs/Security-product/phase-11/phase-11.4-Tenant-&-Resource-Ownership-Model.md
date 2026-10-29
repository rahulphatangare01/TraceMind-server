## Phase 11.4 — Tenant & Resource Ownership Model

Project: TraceMind · Security Product · Planning before implementation

### 1. Objective

- Define and verify how security resources belong to tenants and how that ownership is enforced across the organization hierarchy.

The established hierarchy is:

### Tenant Hierarchy

| Level | Entity       |
| ----- | ------------ |
| 1     | Organization |
| 2     | Project      |
| 3     | Application  |
| 4     | Environment  |

Security resources must be associated with the correct hierarchy level. A resource belonging to one tenant must not become accessible simply because another tenant knows its ID.

### 2. Scope of Phase 11.4

- Included

- Tenant hierarchy and resource ownership rules.
- Security resource scope definitions.
- Scope validation and ownership checks.
- Enforcement expectations for repository and service operations.
- Cross-tenant isolation tests.
- Documentation and regression verification.
  Not included
- Implementing the Phase 12 database migration work.
- Building full IAM, RBAC, or UBAC.
- Implementing Security APIs or the customer dashboard.
- Rewriting the Security Core or the completed Phase 11.3 persistence layer.

### 3. Proposed step-by-step plan

#### 11.4.1 Review the existing ownership implementation

- Inspect the current TenantResourceOwnershipService, SecurityResourceScope, resource models, service interfaces, and related tests.

`Deliverable: source-backed inventory of existing behavior and gaps.`

11.4.2 Define the ownership rules

Document which tenant IDs are required or prohibited at each scope.
| Scope | Required Ownership Identifiers |
|---|---|
| Organization | Organization ID |
| Project | Organization ID, Project ID |
| Application | Organization ID, Project ID, Application ID |
| Environment | Organization ID, Project ID, Application ID, Environment ID |

`Deliverable: explicit scope-to-ownership rules, including invalid combinations.`

#### 11.4.3 Define security resource ownership

Establish ownership requirements for:

- Security keys and key versions.
- Future security configurations.
- Future secrets and credentials.
- Security audit records.
  Reuse the current key persistence models and scope contracts. Future resources must follow the same ownership conventions without implementing their services prematurely.

#### 11.4.4 Verify ownership validation

Check that the existing ownership service correctly validates the relationship between organization, project, application, and environment.

Validate missing IDs, mismatched parent IDs, invalid scope combinations, and resources that do not exist.

`Deliverable: verified ownership behavior and only the minimal required code changes.`

#### 11.4.5 Verify ownership enforcement at service and repository boundaries

Ensure callers supply the complete SecurityResourceScope and resource lookups or mutations remain scoped. Confirm that a caller cannot bypass ownership checks by supplying another tenant's resource ID.

Ownership validation and user authorization remain separate responsibilities; this step does not create a parallel IAM system.

#### 11.4.6 Add missing ownership and tenant-isolation tests

Cover:

- Valid ownership at each supported scope.
- Cross-organization and cross-project access attempts.
- Application or environment with mismatched parent IDs.
- Missing or invalid scope identifiers.
- Unauthorized resource reads, updates, and deletion attempts.
- Key-version access through the wrong parent scope.
  Reuse existing tests wherever coverage is already sufficient; add tests only for identified gaps.

#### 11.4.7 Document the ownership model

Create or update the Phase 11.4 documentation with the hierarchy, ownership rules, enforcement responsibilities, test coverage, and any explicitly deferred concerns.

#### 11.4.8 Run regression checks and close Phase 11.4

Run the targeted ownership specs, the Security Product test suite, TypeScript type-check, and production build. Review the final diff and confirm that no existing Security Core integration or persistence behavior regressed.

### 4. Completion criteria

Phase 11.4 is complete only when:

- [ ] Ownership rules are documented for all four supported scopes.
- [ ] The existing ownership service has been reviewed against those rules.
- [ ] Cross-tenant and invalid-hierarchy behavior is covered by tests.
- [ ] Security resource operations enforce complete tenant scope.
- [ ] Existing tests, type-check, and build pass.
- [ ] Changes and any remaining limitations are reviewed and documented.

### 5. Execution Notes

The initial source inspection and ownership verification have been performed. Findings, test evidence, outstanding coverage questions, and remaining closure conditions are recorded in Section 6.

Do not repeat the initial inspection or mark Phase 11.4 complete based only on the targeted test results. Continue with the outstanding checks in Section 6.7 and complete Step 11.4.8 only after reviewing the actual test, type-check, build, and final-diff results.

## Share the output. I will inspect the actual implementation and tests, identify the precise gaps, and then give you the next minimal change for Step 11.4.1.

---

### Phase 11.4.5 — Service and repository enforcement

**1. Confirmed findings**
| Area | Finding | Assessment |
|---|---|---|
| Ownership resolution | `resolve()` validates context and boundary, then verifies the organization/resource hierarchy. | Implemented |
| Persistence service | Every key operation accepts an explicit `SecurityResourceScope`. | Implemented |
| Repository enforcement | Previously inspected MySQL repositories apply scope predicates. | Reviewed |
| Transaction enforcement | Key creation and rotation use scoped transactional operations. | Reviewed |
| Service boundary factory | Passes dependencies through; it does not implement business operations. | By design |
| Container | Exposes ownership resolution and key persistence separately. | Confirmed |
| Ownership-to-persistence orchestration | No direct call sites found in the searches provided. | Not demonstrated |

**2. The key architectural finding**
The current flow is effectively two separate capabilities:

### Current Ownership and Persistence Flow

| Component                        | Responsibility                                                                                             | Current Status   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------- |
| `TenantResourceOwnershipService` | Validates context and resolves the tenant resource hierarchy.                                              | Implemented      |
| Integration boundary             | Connects ownership resolution to key operations. No verified caller currently connects these capabilities. | Not demonstrated |
| `SecurityKeyPersistenceService`  | Accepts a scope and delegates to scoped repositories and transactions.                                     | Implemented      |

This is an unverified integration gap, not a confirmed tenant-isolation bypass.

The persistence layer still has an important defense: it scopes database operations and validates scope/resource relationships in the inspected implementations. However, a caller that supplies a scope directly does not automatically prove that the scope came from successful ownership resolution.

The ownership service also explicitly does not authenticate users, evaluate permissions, or enforce tenant lifecycle/status policies. Those responsibilities must not be assumed to be covered by this phase's ownership checks.

**3. Recommended disposition**
I recommend recording the following as a Phase 11.4.5 finding:
`Finding`: Ownership resolution and security-key persistence are independently exposed through the Security Product container. The inspected service contracts and factory do not demonstrate mandatory orchestration between them. Direct application-level call sites were not found in the searched TypeScript source. End-to-end enforcement remains unverified; no production vulnerability has been established from this evidence.

We should not automatically add ownership resolution inside the persistence service. First, we need to establish whether that is the intended architecture and identify the actual consumer boundary.
**4. Next read-only verification**
Let's check whether there are other module consumers, routes, controllers, or application entry points outside the source search already performed.

```js

printf '\n===== SECURITY PRODUCT IMPORTS ACROSS REPOSITORY =====\n'
grep -RniE \
  'from .*security-product|require\(.*security-product|securityProduct\.' \
  . \
  --include='*.ts' \
  --include='*.tsx' \
  --exclude='*.spec.ts' \
  --exclude='*.manual.ts' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=coverage

printf '\n===== SECURITY PRODUCT ROUTE/CONTROLLER FILES =====\n'
find src/modules/security-product -type f \
  \( -iname '*route*' -o -iname '*controller*' -o -iname '*handler*' \)

```

---

## 6. Ownership Model Verification Record

### 6.1 Tenant hierarchy and required identifiers

The supported tenant hierarchy is:

Organization → Project → Application → Environment.

| Scope        | Required ownership identifiers                                  | Invalid combinations                                                  |
| ------------ | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| Organization | `organizationId`                                                | Project, application, or environment identifiers must not be supplied |
| Project      | `organizationId`, `projectId`                                   | Application or environment identifiers must not be supplied           |
| Application  | `organizationId`, `projectId`, `applicationId`                  | Environment identifier must not be supplied                           |
| Environment  | `organizationId`, `projectId`, `applicationId`, `environmentId` | All four identifiers must describe the same hierarchy                 |

Platform-wide and field-level scopes are not supported by the current tenant-resource scope contract.

### 6.2 Ownership validation responsibilities

`TenantResourceOwnershipService` is responsible for validating the security context and boundary, resolving the requested tenant resources, and checking their identifiers against the expected parent hierarchy.

Expected relationships:

- A project must belong to the requested organization.
- An application must belong to the requested organization and project.
- An environment must belong to the requested organization, project, and application.
- Missing resources and mismatched ownership relationships must be rejected.
- Unsupported scopes must not result in tenant resource lookups.

Ownership resolution does not authenticate users, evaluate permissions, or enforce tenant lifecycle/status policies. These responsibilities remain outside this ownership model.

### 6.3 Security resource ownership

The current persisted security resources are security-key metadata and key-version metadata.

- Security-key records carry an organization identifier and nullable identifiers for lower hierarchy levels.
- Key-version records are associated with a parent key.
- Key and key-version operations must use the applicable complete `SecurityResourceScope`.
- Key-version reads and mutations must be constrained through the scoped parent key.
- Raw cryptographic key material must not be stored in these persistence records. Provider references and lifecycle metadata are permitted by the existing persistence design.

Future security configurations, secrets, credentials, and security audit records must define and enforce equivalent ownership rules when those resource types are introduced. This phase does not implement those future services.

### 6.4 Service and repository enforcement findings

| Area                            | Verification result                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Ownership service               | Reviewed; validates context, boundary, resource existence, and parent relationships                    |
| Scope validation                | Reviewed; checks scope-specific identifiers and rejects unsupported scope combinations                 |
| Key persistence service         | Reviewed; key operations require an explicit `SecurityResourceScope`                                   |
| Key repository                  | Reviewed; queries and mutations use scope predicates and exclude soft-deleted records where applicable |
| Key-version repository          | Reviewed; version operations are constrained through the scoped parent key                             |
| Transaction adapter             | Reviewed; creation and rotation use scoped transactional operations                                    |
| Container integration           | Ownership resolution and key persistence are exposed as separate capabilities                          |
| Application-level orchestration | Not demonstrated by the repository-wide searches performed                                             |

**Outstanding architectural finding:** The inspected container and service contracts do not demonstrate mandatory orchestration between ownership resolution and key persistence. No application-level consumer was identified in the searches performed. End-to-end enforcement at the consumer boundary therefore remains unverified. This finding does not, by itself, establish an exploitable vulnerability.

Do not add orchestration automatically. First establish the intended consumer boundary and integration design.

### 6.5 Ownership test coverage

The ownership service specification contains **21 passing tests**, covering supported-scope resolution, missing resources, mismatched parent relationships, invalid context, unsupported scopes, and the project-ID mismatch case.

The five targeted Security Product regression specifications passed **61 tests** in total:

- `tenant-resource-ownership.service.spec.ts`: 21 tests
- `security-key.mysql.repository.spec.ts`: 7 tests
- `security-key-version.mysql.repository.spec.ts`: 7 tests
- `security-key.transaction.mysql.adapter.spec.ts`: 16 tests
- `security-resource-persistence-models.spec.ts`: 10 tests

The broader source-directory regression runs reported:

- Security Core: 67 test files passed, 843 tests passed.
- Security Core and Security Product combined: 82 test files passed, 979 tests passed.
- TypeScript type-check: passed, as reported during Phase 11.4.8.
- Production build: completed successfully, as reported during Phase 11.4.8.

The earlier Vitest error occurred when compiled test files under `dist` were loaded in a CommonJS context. The source-directory regression commands passed. The exact original command that triggered the error was not confirmed, so the test-discovery issue should not be considered independently resolved for every possible test invocation.

These results establish passing automated tests, a successful type-check, and a successful build. They do not establish production-database verification or end-to-end application-level ownership enforcement.

### 6.6 Phase status

| Step                                            | Status                                    | Evidence or remaining work                                                   |
| ----------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| 11.4.1 Review existing ownership implementation | Reviewed                                  | Source inventory and gaps identified                                         |
| 11.4.2 Define ownership rules                   | Defined                                   | Four supported scopes and identifier rules documented                        |
| 11.4.3 Define security resource ownership       | Reviewed                                  | Key and key-version persistence; future resources deferred                   |
| 11.4.4 Verify ownership validation              | Verified                                  | Ownership tests pass, including project-ID mismatch                          |
| 11.4.5 Verify service/repository enforcement    | Reviewed with limitation                  | Scoped persistence reviewed; consumer-level orchestration remains unverified |
| 11.4.6 Add missing ownership/isolation tests    | Verified                                  | 21 ownership tests; 61 tests across five targeted regression specifications  |
| 11.4.7 Document the ownership model             | Updated; final review pending             | Review final diff and confirm the documentation is consistent                |
| 11.4.8 Regression and close                     | Regression checks passed; closure pending | Final diff review and explicit disposition of the integration finding        |

### 6.7 Deferred work and closure conditions

Phase 11.4 does not implement Phase 12 database migrations, full IAM/RBAC/UBAC, Security APIs, the customer dashboard, or a replacement ownership resolver.

Before closing Phase 11.4:

- [x] Confirm the project-ID mismatch test coverage.
- [x] Run the source-directory Security Core regression suite.
- [x] Run the combined Security Core and Security Product regression suite.
- [x] Run the TypeScript type-check.
- [x] Run the production build.
- [ ] Review the final diff for unrelated changes and regressions.
- [ ] Decide and document how the intended consumer boundary connects ownership resolution to key persistence.
- [ ] Record the accepted limitations and final closure decision.

**Phase 11.4 remains open** until the final diff is reviewed and the outstanding ownership-to-persistence integration finding is explicitly addressed or formally deferred with a clear follow-up.

Phase 11.4 remains open until these closure checks are completed and reviewed.
