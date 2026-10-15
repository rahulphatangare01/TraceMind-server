## Phase 11 — Security Product Foundation

```js
11.1 Existing Architecture & Source Code Review

- Inspect the current Security Core, providers, public contracts, tenant module, database, repositories, tests and scripts.

11.2 Security Product Module Boundaries

- Define the product-layer structure, responsibilities, dependencies and separation from Security Core.

11.3 Product Contracts, DTOs & Error Conventions

- Define product-facing interfaces, request/response DTOs, validation conventions and consistent error handling.

11.4 Tenant & Resource Ownership Model

- Establish how organizations, projects, applications and environments own Security Product resources using the existing tenant hierarchy.

11.5 Security Resource Model & Lifecycle

- Define ownership and lifecycle requirements for key metadata, key versions, security configurations, secrets and audit records.

11.6 Request Context & Correlation Integration

- Integrate the existing request context and correlation identifiers into Security Product operations.

11.7 Validation & Secure Defaults

- Define product-level validation, safe defaults, fail-closed behavior and protections against invalid or unsafe requests.

11.8 Provider & Persistence Integration Boundaries

- Define how the product layer will integrate with existing Security Core providers and future persistent repositories without bypassing existing contracts.

11.9 Future IAM & SaaS Integration Contracts

- Define integration boundaries for future IAM authorization, product entitlements and usage metering without implementing those products now.

11.10 Threat Model & Security Boundaries

- Document trust boundaries, tenant isolation risks, sensitive-data handling, abuse scenarios and required mitigations.

11.11 Phase 11 Testing & Acceptance

- Define and execute applicable foundation tests, type-check, build and regression checks; resolve failures before sign-off.

11.12 Phase 11 Documentation & Sign-off

- Document final architecture decisions, confirmed contracts, dependencies, known limitations and the handoff to Phase 12.
```

---

### Phase 11 completion criteria

Phase 11 is complete when:

- The actual implementation and existing contracts have been reviewed.
- Product boundaries and resource ownership are documented.
- Integration points with Security Core, tenant infrastructure and persistence are established.
- Future IAM and SaaS integration requirements are defined without expanding the current scope.
- Security boundaries, acceptance criteria and tests are documented.
- Type-check, build and relevant regression checks pass.
- The Phase 11 documentation and sign-off are complete.

**Scope boundary:** Phase 11 establishes the foundation. Actual database persistence is implemented in Phase 12; the full key management, configuration, secrets, APIs and dashboard are handled in their respective phases.

---

## Phase 12: Security Database & Persistence

```js
12.1 Existing Database & Repository Review

- Inspect the current MySQL connection, schema runner, tenant schemas, repository interfaces, transaction conventions and existing tests.

12.2 Security Product Persistence Design

- Define the persistence boundaries, entity relationships, ownership rules and data lifecycle for Security Product resources.

12.3 Database Schema & Migration Design

- Design versioned SQL schemas and migration conventions that fit the existing TraceMind database architecture.

12.4 Key Metadata & Key Version Tables

- Define persistence for key metadata, versions, purpose, scope, provider references and lifecycle status—without storing raw key material.

12.5 Security Configuration Persistence

- Design tables and constraints for scoped configurations, versions, sensitive-value ciphertext references and configuration metadata.

12.6 Secret Metadata & Version Persistence

- Design persistence for secret metadata, versions, ownership, expiry, revocation and encrypted-value storage references.

12.7 Security Audit Persistence

- Define the audit event schema, resource references, actor and tenant context, outcomes, timestamps and correlation identifiers.

12.8 Tenant Isolation & Relational Integrity

- Implement appropriate foreign keys, composite constraints, tenant ownership rules, uniqueness constraints and indexes.

12.9 Repository Interfaces & MySQL Implementations

- Implement typed repository contracts and MySQL adapters following existing project conventions.

12.10 Transactions & Concurrency Safety

- Establish transaction boundaries, atomic updates, concurrent-write protection and idempotent persistence operations where required.

12.11 Soft Delete, Retention & Data Lifecycle

- Define deletion, archival and retention behavior for each resource type, respecting audit and key-recovery requirements.

12.12 Migration, Restart & Persistence Tests

- Verify schema creation, migration behavior, stored-data retrieval and persistence across application restarts.

12.13 Tenant Isolation & Failure Tests

- Test cross-tenant access prevention at the repository boundary, constraint violations, transaction failures and database errors.

12.14 Phase 12 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and persistence-design review.

```

### Important design rules

- Reuse existing infrastructure: Follow TraceMind's current MySQL connection, schema runner, tenant schemas and repository conventions instead of introducing a competing persistence framework.
- Never persist raw cryptographic keys in ordinary database tables: Store metadata and provider references; use appropriate key-management infrastructure for key material.
- Never store plaintext secrets as ordinary configuration or secret records: Use the Security Core encryption contracts and define how ciphertext is persisted.
- Enforce tenant isolation in persistence: Do not rely solely on API or frontend filtering.
- Keep Phase 12 focused: Implement storage contracts and infrastructure, not the complete key-management service, public APIs, IAM product or billing system.
- Preserve audit integrity: Audit records need an explicit retention and deletion policy rather than automatically following ordinary resource deletion.

### Phase 12 completion criteria

Phase 12 is complete when the required schemas and migrations work, repository implementations satisfy their contracts, tenant and relational constraints are enforced, persistence survives restarts, and the relevant tests, type-check and build pass.

**Next step:** Begin with `12.1 — Existing Database & Repository Review` when Phase 11 is complete and signed off. We'll inspect the actual working implementation before deciding which files need changes, and proceed one subphase at a time.

---

## Phase 13: Key Management Service

```js
13.1 Existing Key Management Architecture Review

- Inspect existing key providers, key-material providers, crypto services, envelope formats, key metadata contracts and Phase 12 repository interfaces.

13.2 Key Management Domain Model

- Define key entities, metadata, ownership, scope, purpose, provider reference, lifecycle status and version relationships.

13.3 Persistent Key Repository Integration

- Connect the existing key-management contracts to persistent repositories while preserving provider boundaries.

13.4 Key Creation & Registration

- Implement key creation and registration workflows with validated metadata, unique identifiers and appropriate provider selection.

13.5 Key Version Management

- Implement version creation, version lookup, active-version resolution and historical-version metadata.

13.6 Active Key Resolution

- Resolve the correct active key version for encryption while ensuring decryption can resolve the exact version referenced by an existing envelope.

13.7 Key Rotation

- Implement rotation workflows that activate a new version while preserving the ability to decrypt data encrypted with older permitted versions.

13.8 Key Disable & Re-enable Policies

- Define and implement allowed state transitions, including when a disabled key may or may not be re-enabled.

13.9 Key Revocation & Retirement

- Define revocation, retirement and archival behavior, including the consequences for encryption, decryption and recovery.

13.10 Key Deletion & Retention Policies

- Implement controlled deletion or destruction workflows, subject to retention, dependency and recovery requirements.

13.11 Scope, Ownership & Provider Validation

- Validate tenant ownership, scope, purpose and provider compatibility before key operations are permitted.

13.12 Concurrency & Lifecycle Consistency

- Handle concurrent creation, rotation and state transitions using transactions, constraints and concurrency safeguards.

13.13 Key Recovery & Failure Handling

- Define behavior for unavailable providers, missing key versions, incomplete operations and recovery after failures.

13.14 Key Management Security Tests

- Test tenant isolation, invalid state transitions, unauthorized operations, version integrity and sensitive-data exposure.

13.15 Rotation & Backward-Compatibility Tests

- Verify that rotation does not break permitted decryption of existing ciphertext and that version resolution survives restarts.

13.16 Phase 13 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and a review of the key lifecycle design.

```

### Important design rules

- Reuse Security Core: Continue using the existing SecurityService, crypto providers, key providers and key-material provider contracts wherever appropriate.
- Separate metadata from key material: Persist key metadata and provider references, not raw cryptographic key material in ordinary MySQL tables.
- Preserve version compatibility: Every encrypted envelope must continue to resolve the exact key version required for decryption.
- Make rotation safe: Rotation should change the active encryption version without automatically making older ciphertext undecryptable.
- Enforce tenant boundaries: A key belonging to one organization, project, application or environment must not be available to an unrelated tenant.
- Define destructive operations carefully: Disabling, revoking, retiring and destroying a key are different operations. Their consequences must be explicit before implementation.
- Do not expand scope: Public APIs, secrets management, configuration management, IAM and billing remain in their respective phases.

### Phase 13 completion criteria

Phase 13 is complete when key metadata and version information are persisted, lifecycle operations are consistent and concurrency-safe, rotation preserves permitted historical decryption, tenant isolation is enforced, and all applicable tests, type-check and build checks pass.
**Next step:** After Phase 12 is signed off, begin `13.1 — Existing Key Management Architecture Review.` We will inspect the actual source contracts first and define the exact implementation changes before modifying code.

---

## Phase 14: Security Configuration Service

```js
14.1 Existing Configuration & Security Architecture Review

- Inspect existing configuration utilities, Security Core contracts, tenant hierarchy, database repositories and Phase 12 persistence interfaces.

14.2 Configuration Domain Model

- Define configuration entities, identifiers, ownership, scope, data types, lifecycle status and metadata.

14.3 Configuration Schema & Validation

- Define supported configuration types, validation rules, required fields, defaults and schema versioning.

14.4 Configuration Persistence & Repository Integration

- Implement repository operations for configuration records and versions using the established database conventions.

14.5 Configuration Scope & Ownership Validation

- Validate organization, project, application and environment ownership using the existing tenant hierarchy and boundary rules.

14.6 Configuration CRUD Operations

- Implement create, read, update and delete operations with appropriate validation and lifecycle safeguards.

14.7 Configuration Inheritance & Resolution

- Define and implement scope precedence, inheritance, overrides and deterministic resolution of effective configuration values.

14.8 Sensitive Configuration Encryption

- Encrypt sensitive configuration values using the existing Security Core service and appropriate encryption contexts.

14.9 Configuration Versioning & History

- Track configuration changes, version history, previous values and the metadata needed for controlled recovery.

14.10 Rollback & Concurrent Update Protection

- Implement validated rollback behavior and safeguards against conflicting or lost updates.

14.11 Configuration Cache & Invalidation

- Define caching only where useful, with reliable invalidation after changes, rollback, revocation or relevant lifecycle events.

14.12 Configuration Access & Data Exposure Controls

- Define safe retrieval behavior, metadata masking and integration points for authorization without duplicating IAM.

14.13 Configuration Audit Integration

- Record relevant configuration creation, changes, rollback and deletion through the established audit contracts where available.

14.14 Configuration Service Integration Tests

- Test persistence, validation, inheritance, overrides, encryption, version history and rollback.

14.15 Tenant Isolation & Security Tests

- Test cross-tenant access, invalid scope combinations, sensitive-value leakage, stale caches and concurrent updates.

14.16 Phase 14 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and documentation review.

```

### Important design rules

- `Reuse the existing Security Core`: Do not introduce a separate encryption implementation or access to provider internals.
- `Preserve tenant boundaries`: Configuration scope resolution must respect the existing organization → project → application → environment hierarchy.
- `Define inheritance explicitly`: A configuration inherited from a parent scope must not silently override a more specific value. The precedence rules must be documented and tested.
- `Protect sensitive values`: Encrypt sensitive values before persistence, and never expose plaintext through logs, audit events or ordinary metadata responses.
- `Keep configuration and secrets distinct`: Configuration describes application settings; dedicated secret lifecycle operations belong to Phase 15.
- `Keep authorization separate`: Phase 14 defines access-control integration points but does not build the full IAM product.
- `Avoid premature caching`: Implement caching only when its consistency and invalidation behavior can be tested reliably.

### Phase 14 completion criteria

Phase 14 is complete when configuration records are persisted and validated, scoped inheritance works deterministically, sensitive values are protected, version history and rollback behave correctly, tenant isolation is verified, and applicable tests, type-check and build checks pass.
**Next step:** Once Phase 13 is signed off, begin `14.1 — Existing Configuration & Security Architecture Review.` We will inspect the actual source code first and identify the precise files and contracts that need changes before implementation.

---

## Phase 15: Secrets & Credentials Service

```js
15.1 Existing Secrets & Security Architecture Review

- Inspect existing Security Core encryption contracts, key-management interfaces, configuration models, repositories, tenant hierarchy and audit conventions.

15.2 Secret Domain Model & Resource Ownership

- Define secret identifiers, ownership, scope, secret types, lifecycle status, metadata and version relationships.

15.3 Secret Classification & Validation

- Define supported secret categories, classification requirements, input validation and rules for handling sensitive values.

15.4 Secret Persistence & Repository Integration

- Implement persistence for secret metadata, versions, lifecycle information and encrypted-value references using existing database conventions.

15.5 Secure Secret Creation

- Validate ownership and input, establish the correct encryption context, encrypt secret values through Security Core and persist them safely.

15.6 Authorized Secret Retrieval

- Define retrieval contracts, enforce the available access-control boundary and decrypt values only for explicitly authorized operations.

15.7 Masked Metadata & Safe Responses

- Return secret metadata without exposing plaintext values, cryptographic material or sensitive internal implementation details.

15.8 Secret Versioning & History

- Implement secret versions, current-version resolution and the metadata required to track changes and support recovery policies.

15.9 Secret Rotation & Update

- Support secure value replacement and rotation while defining how previous versions remain available or become inaccessible.

15.10 Expiry, Revocation & Lifecycle Management

- Define expiry handling, revocation, disablement, archival and deletion rules, including the consequences for future retrieval.

15.11 Credential Types & Integration Use Cases

- Define support requirements for API credentials, database credentials, webhook secrets, OAuth client secrets and integration credentials.

15.12 Secret Access Policy Integration

- Establish the service boundary for actor identity, tenant ownership and future IAM authorization without implementing a duplicate Permission Engine.

15.13 Audit Events & Sensitive-Data Redaction

- Record appropriate secret lifecycle and access events while ensuring plaintext values and credential material never enter logs or audit payloads.

15.14 Failure Handling & Recovery

- Handle encryption/decryption errors, missing versions, unavailable providers, database failures and interrupted lifecycle operations safely.

15.15 Secrets Service Integration Tests

- Test creation, retrieval, encryption, versioning, rotation, expiry, revocation, persistence and expected failure behavior.

15.16 Tenant Isolation & Security Tests

- Test cross-tenant access, unauthorized retrieval, plaintext leakage, invalid contexts, metadata exposure and lifecycle bypass attempts.

15.17 Phase 15 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and security-design review.

```

### Important design rules

- `Reuse Security Core`: All reversible secret encryption and decryption must go through the existing Security Core contracts.
- `Separate secrets from keys`: The Secrets Service manages application credentials; the Key Management Service manages encryption-key metadata and lifecycle.
- `Keep configuration separate`: Configuration values and secret credentials have different exposure and lifecycle requirements.
- `Never persist plaintext secrets`: Store encrypted values or references to an appropriate external secret store, never raw plaintext credentials in ordinary database records.
- `Use purpose-appropriate protection`: Recoverable credentials require encryption; user passwords require suitable one-way password hashing rather than reversible encryption.
- `Enforce access at the backend`: Masking the UI is not authorization. Retrieval must pass through an enforced access-control boundary.
- `Audit without leaking`: Audit metadata must never contain plaintext credentials, access tokens or cryptographic key material.
- `Keep IAM deferred`: Establish integration contracts now; full IAM, RBAC/UBAC management and the Permission Engine remain outside Phase 15.

### Phase 15 completion criteria

Phase 15 is complete when secrets are persisted securely, retrieval is appropriately authorized, lifecycle operations are reliable, tenant isolation is verified, sensitive data is protected from accidental exposure, and all applicable tests, type-check and build checks pass.
**Next step:** After Phase 14 is signed off, begin `15.1 — Existing Secrets & Security Architecture Review.` We will inspect the actual source code and existing contracts before deciding on file-level changes, then proceed one subphase at a time.

---

## Phase 16: Security APIs

```js
16.1 Existing API & Application Architecture Review

- Inspect Express routing, middleware, controllers, services, validation, error handling, request context and existing API conventions.

16.2 Security API Module Structure

- Define the API-layer boundaries and organize routes, controllers, DTOs, validation schemas and service integration according to existing TraceMind conventions.

16.3 API Versioning & Resource Design

- Define API versioning, resource naming, endpoint conventions, HTTP methods and consistent request/response contracts.

16.4 Shared Request & Response Contracts

- Establish common response formats, error structures, pagination metadata, correlation identifiers and validation-error responses.

16.5 Key Management APIs

- Expose approved key creation, metadata retrieval, version listing, rotation and lifecycle operations through the Key Management Service.

16.6 Security Configuration APIs

- Expose configuration creation, retrieval, updates, deletion, effective-value resolution, version history and rollback operations as appropriate.

16.7 Secrets & Credentials APIs

- Expose secure secret creation, metadata retrieval, authorized value retrieval, versioning, rotation, expiry and revocation operations.

16.8 Request Validation & Input Normalization

- `Validate request bodies, parameters, query strings, identifiers and enum values; reject malformed or unsupported inputs`.

16.9 Authentication Integration Boundary

-Integrate a defined authentication mechanism for API consumers and establish trusted actor or service identity context without building the full IAM product.

16.10 Tenant & Resource Access Enforcement

- Enforce tenant ownership and resource scope at backend service boundaries, independently of frontend restrictions.

16.11 Rate Limits & Resource Abuse Protection

- Define rate-limit integration, request-size limits, pagination bounds, timeouts and protections against excessive or abusive requests.

16.12 Idempotency & Concurrent Request Handling

- Define idempotency behavior for applicable mutations and safe handling of duplicate requests, retries and conflicting updates.

16.13 Sensitive Response & Error Protection

- Prevent plaintext secrets, tokens, key material, stack traces and internal provider details from leaking through API responses or logs.

16.14 API Documentation & OpenAPI Contracts

- Document endpoints, schemas, authentication requirements, error responses, examples and integration requirements for external developers.

16.15 API Unit & Contract Tests

- Test controllers, request validation, response formats, status codes, error mapping and service-contract compatibility.

16.16 API Integration & Security Tests

- Test end-to-end API behavior, tenant isolation, authentication boundaries, unauthorized requests, abuse protections and sensitive-data exposure.

16.17 Phase 16 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and API contract review.

```

### Important design rules

- `Reuse existing services`: API controllers must call the established Security Product services rather than implementing cryptography or persistence directly.
- `Keep authentication separate from authorization`: Authentication identifies the caller; backend authorization determines what that caller can access.
- `Do not expose sensitive endpoints without protection`: Production key, configuration and secret operations must have an enforced authentication and access-control boundary.
- `Enforce tenant isolation server-side`: Never trust organization or resource IDs supplied by a client without validating their ownership and scope.
- `Protect sensitive responses`: Secret values must only be returned through explicitly authorized operations. Key material and internal cryptographic implementation details must not be exposed.
- `Prepare for IAM without building it`: Define a clean integration contract for future IAM, RBAC/UBAC and the Permission Engine.
- `Design for external integration`: Use stable contracts, predictable errors and documentation so other applications can integrate without depending on TraceMind's internal module structure.
- `Keep commercialization out of scope`: Subscription management, entitlements, usage metering and billing belong to Plan C.

### Phase 16 completion criteria

Phase 16 is complete when the supported Security Product operations are available through documented APIs, request validation and access enforcement are in place, sensitive data is protected, tenant isolation is tested, and all applicable tests, type-check and build checks pass.
**Next step**: After Phase 15 is signed off, begin `16.1 — Existing API & Application Architecture Review`. We will inspect the actual source files and existing Express conventions before deciding which routes, controllers, middleware and contracts need changes.

---

## Phase 17: Authentication & Authorization Integration

```js
17.1 Existing Authentication & Authorization Review

- Inspect current authentication-related code, middleware, tenant context, API protection and any existing IAM or permission contracts.

17.2 Authentication Integration Contract

- Define the `interface` through which API requests establish a trusted user or service identity, keeping authentication implementation separate from Security Product business logic.

17.3 Trusted Actor & Service Identity Context

- Define the actor context required by downstream operations, including actor type, actor identifier, tenant association and request correlation information.

17.4 Authentication Middleware Integration

- Integrate the agreed authentication mechanism with the API layer and ensure protected routes reject missing, invalid or expired credentials.

17.5 Tenant Context Resolution & Validation

- Resolve and validate the caller's organization, project, application and environment context against the existing tenant hierarchy.

17.6 Resource Ownership Enforcement

- Ensure callers can access or mutate only resources within their permitted tenant and ownership boundaries.

17.7 Authorization Service Boundary

- Define a reusable authorization `interface` for Security Product operations, allowing future IAM integration without coupling business services to a specific IAM implementation.

17.8 Operation-Level Permission Requirements

- Define the required access checks for key management, configuration, secrets, audit retrieval and other sensitive operations.

17.9 Least Privilege & Default-Deny Enforcement

- Ensure access is denied when identity, tenant ownership or required authorization cannot be established. Avoid implicit permission grants.

17.10 Internal Service-to-Service Trust

- Define how trusted TraceMind modules and future external integrations authenticate to Security Product services, including credential handling and rotation requirements.

17.11 Authorization Failure Handling

- Standardize unauthenticated, unauthorized and inaccessible-resource behavior without leaking tenant or resource information.

17.12 Authorization Audit Integration

- Record relevant authentication and authorization outcomes using established audit contracts, while avoiding credential and token leakage.

17.13 Future IAM & Permission Engine Adapter

- Define the adapter boundary for future IAM authentication, RBAC, UBAC and Permission Engine integration without implementing the full IAM SaaS.

17.14 Authentication & Authorization Unit Tests

- Test middleware, trusted identity construction, context validation, authorization decisions and failure handling.

17.15 Tenant Isolation & Negative Security Tests

- Test missing or invalid credentials, cross-tenant access, forged tenant identifiers, unauthorized mutations and privilege-escalation attempts.

17.16 End-to-End API Security Tests

- Verify that protected Security Product APIs enforce the required identity, tenant and authorization checks throughout the request lifecycle.

17.17 Phase 17 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and security-boundary review.
```

### Important design rules

- `Authentication is not authorization`: A valid identity does not automatically grant access to every Security Product resource.
- `Never trust client-supplied tenant IDs alone`: Validate the caller's tenant membership and resource ownership using trusted context and backend checks.
- `Default to deny`: Missing identity, invalid context or unavailable required authorization must not silently grant access.
- `Keep IAM deferred`: Build the integration contract and adapter boundary now. Full identity management, RBAC/UBAC administration and the Permission Engine remain future IAM product work.
- `Protect internal integrations`: TraceMind modules and external applications must use explicitly defined trust mechanisms; internal network location alone is not sufficient proof of identity.
- `Enforce checks in backend services`: Frontend restrictions and route-level checks alone are insufficient if service operations can be invoked through other paths.
- `Preserve existing Security Core contracts`: Authentication and authorization must not introduce a second encryption engine or bypass existing key, configuration and secret services.

### Phase 17 completion criteria

Phase 17 is complete when protected operations require a trusted identity, tenant and resource boundaries are enforced, authorization failures are handled safely, future IAM integration has a defined contract, and applicable tests, type-check and build checks pass.
**Next step:** After Phase 16 is signed off, begin `17.1 — Existing Authentication & Authorization Review`. We will inspect the actual implementation first and determine which contracts and controls already exist before making changes.

---

## Phase 18: Security Audit & Activity

```js
18.1 Existing Monitoring & Audit Architecture Review

- Inspect existing audit models, monitoring services, repository interfaces, MySQL repositories, request context, correlation IDs and security-event conventions.

18.2 Security Audit Event Model

- Define audit event contracts covering event ID, actor, tenant, resource, action, outcome, timestamp and correlation information.

18.3 Audit Event Taxonomy & Classification

- Define event categories and action names for key lifecycle, configuration changes, secret operations, authentication and authorization outcomes.

18.4 Actor & Tenant Context Integration

- Integrate trusted actor identity, organization and resource scope from the established request and authorization boundaries.

18.5 Key Management Audit Integration

- Record key creation, version changes, rotation, disablement, revocation and other relevant lifecycle events.

18.6 Configuration Audit Integration

- Record configuration creation, updates, rollback, deletion and other security-relevant changes.

18.7 Secrets & Credentials Audit Integration

- Record secret creation, access, rotation, expiry, revocation and deletion events without recording secret values.

18.8 Authentication & Authorization Event Integration

- Record relevant access outcomes and security failures using established contracts, without duplicating authentication or authorization logic.

18.9 Audit Persistence & Repository Integration

- Persist validated audit events using the existing database and repository conventions, preserving tenant context and event metadata.

18.10 Audit Integrity & Append-Only Controls

- Define controls that prevent ordinary application workflows from silently modifying or deleting historical audit events.

18.11 Audit Retrieval & Filtering

- Define authorized, tenant-scoped audit queries with filters for resource, actor, event type, outcome and time range.

18.12 Retention, Archival & Data Lifecycle

- Define retention periods, archival requirements, access restrictions and controlled cleanup behavior for audit records.

18.13 Sensitive-Data Redaction & Safe Logging

- Prevent passwords, tokens, plaintext secrets, raw cryptographic keys and sensitive configuration values from entering audit events or logs.

18.14 Failure Handling & Audit Reliability

- Define behavior for persistence failures, transaction boundaries, retries, duplicate events and operations where audit delivery is required.

18.15 Audit Service Unit & Integration Tests

- Test event validation, persistence, event completeness, retrieval, filtering, ordering and expected failure behavior.

18.16 Tenant Isolation & Audit Security Tests

- Test cross-tenant queries, unauthorized retrieval, attempts to modify historical records and sensitive-data leakage.

18.17 Phase 18 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and audit-design review.

```

### Important design rules

- `Reuse TraceMind's monitoring foundation`: Inspect the existing audit models, MonitoringLoggerService, repositories and request context before creating anything new.
- `Separate audit from application logs`: Audit events need consistent schemas, controlled access, defined retention and stronger integrity guarantees than ordinary diagnostic logs.
- `Preserve trusted context`: Actor and tenant information must come from validated request or service context, not unverified client-supplied fields.
- `Never log sensitive values`: Record that a secret was accessed or rotated, not its plaintext value. Never record raw encryption keys, passwords or access tokens.
- `Enforce tenant-scoped retrieval`: Customers must not be able to inspect another organization's security history.
- `Define failure semantics explicitly`: Decide which operations must fail if an audit event cannot be persisted and where transactional or durable delivery guarantees are required. Do not claim complete auditing without a defined reliability mechanism.
- `Keep IAM and SaaS operations out of scope`: Integrate their future event contracts where appropriate, but do not build the full IAM product, billing or commercial analytics here.

### Phase 18 completion criteria

Phase 18 is complete when security-relevant events are consistently captured and persisted, audit retrieval is authorized and tenant-scoped, historical records have defined integrity and retention controls, sensitive values are excluded, and applicable tests, type-check and build checks pass.
**Next step**: After Phase 17 is signed off, begin `18.1 — Existing Monitoring & Audit Architecture Review`. We will inspect the actual TraceMind monitoring implementation first and reuse existing contracts wherever possible.

---

## Phase 19: Security Product Dashboard

```js
19.1 Existing Frontend & API Architecture Review

- Inspect the existing TraceMind frontend, routing, UI components, state management, API client, authentication integration and styling conventions.

19.2 Security Dashboard Structure & Navigation

- Define the Security Product dashboard layout, navigation, page structure and integration with the existing TraceMind application.

19.3 Tenant & Resource Context Selection

- Implement the required organization, project, application and environment context selection using validated backend data and existing tenant conventions.

19.4 Security Overview Dashboard

- Build an overview of available security resources, key lifecycle status, configuration activity and recent security events using authorized API responses.

19.5 Key Inventory & Details

- Display key metadata, ownership, purpose, provider information, version history and lifecycle status without exposing raw key material.

19.6 Key Lifecycle Management UI

- Provide approved UI actions for key creation, rotation, disablement and other supported lifecycle operations, with confirmation and error handling.

19.7 Security Configuration Management UI

- Build configuration listing, creation, editing, scoped resolution, version history and rollback interfaces supported by the APIs.

19.8 Secrets & Credentials Management UI

- Display secret metadata, status, expiry and version information; provide approved create, rotate and revoke workflows without exposing secret values by default.

19.9 Audit & Security Activity Explorer

- Provide tenant-scoped audit history with filters for event type, actor, resource, outcome and time range, subject to API permissions.

19.10 Forms, Validation & Error States

- Implement client-side validation, API validation feedback, loading states, empty states, retry behavior and actionable error messages.

19.11 Access-Aware UI & Sensitive-Data Handling

- Show actions according to the available access context, mask sensitive information and handle expired authentication or denied requests safely.

19.12 API Integration & State Consistency

- Integrate all pages with the secured APIs and ensure mutations refresh relevant views without presenting stale or misleading state.

19.13 Responsive Design & Accessibility

- Ensure the dashboard works across supported screen sizes and provides accessible navigation, form controls, labels and status indicators.

19.14 Dashboard Unit & Component Tests

- Test components, forms, rendering states, user interactions, error handling and API-client behavior.

19.15 End-to-End & Security UI Tests

- Test key workflows, configuration changes, secret lifecycle actions, audit filtering and behavior under denied access or tenant-context changes.

19.16 Phase 19 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and a review of API usage and sensitive-data exposure.

```

### Important design rules

- `Use secured APIs exclusively`: The frontend must never connect directly to MySQL or access provider internals.
- `Reuse the existing UI architecture`: Follow TraceMind's current frontend framework, component conventions, routing and API integration patterns rather than introducing a competing architecture.
- `Enforce security in the backend`: Hiding a button is not authorization. Every sensitive action must be validated and authorized by the backend.
- `Protect secret values`: Display secret metadata by default. Any operation that reveals a secret must use an explicitly authorized backend flow.
- `Keep tenant context consistent`: Changing the selected organization or project must not leave stale data visible from a previous context.
- `Respect API capabilities`: Only expose UI actions supported by the completed Security Product APIs. Do not create frontend-only behavior that suggests an operation succeeded when it did not.
- `Keep Plan C separate`: Subscription management, invoices, billing, usage quotas and commercial account settings belong to the future SaaS console.

### Phase 19 completion criteria

Phase 19 is complete when customers can operate the supported Security Product features through the dashboard, all data is retrieved through secured APIs, tenant context is handled safely, sensitive values remain protected, and applicable tests, type-check and build checks pass.
**Next step**: After Phase 18 is signed off, begin `19.1 — Existing Frontend & API Architecture Review`. We will inspect the actual TraceMind frontend and API contracts first, then identify the precise pages, components and files required before implementation.

---

## Phase 20: Production KMS & Security Readiness

```js
20.1 Existing Provider & Production Architecture Review

- Review Security Core provider contracts, key management, encryption envelopes, persistence, configuration, secrets, authentication boundaries and deployment conventions.

20.2 Production KMS Requirements & Provider Selection

- Define requirements for key protection, supported regions, availability, access policies, compliance needs, cost and operational ownership; select an appropriate provider.

20.3 KMS Provider Adapter Design

- Map the selected provider to existing Security Core provider interfaces without coupling product services directly to provider-specific APIs.

20.4 Key Material Protection & Envelope Encryption

- Define and implement the appropriate data-encryption-key and key-encryption-key workflow, including key wrapping and unwrapping where required.

20.5 Workload Identity & Least-Privilege Access

- Configure application-to-KMS authentication, minimum required permissions, environment separation and secure provider credentials.

20.6 Key Rotation & Version Compatibility

- Verify provider-side rotation, application-managed key versions and backward-compatible decryption of existing ciphertext.

20.7 Key Recovery, Backup & Disaster Recovery

- Define recovery responsibilities, metadata backup, provider recovery requirements, restore procedures and tested recovery objectives.

20.8 Provider Failure & Resilience Handling

- Handle provider outages, timeouts, throttling, permission failures, network failures and partial operations without unsafe fallback behavior.

20.9 Environment & Deployment Security

- Define production configuration, secret injection, environment isolation, secure deployment practices and separation of development, test and production keys.

20.10 Data Protection & Cryptographic Migration

- Define migration from existing local-provider or development arrangements where applicable, including compatibility, validation, rollback and recovery.

20.11 Production Monitoring & Alerting

- Establish monitoring for KMS availability, failed operations, latency, throttling, key lifecycle events and security-relevant failures.

20.12 Operational Runbooks & Incident Response

- Document provider outages, suspected key compromise, rotation incidents, access-policy changes, recovery and escalation procedures.

20.13 Security & Threat-Model Review

- Review tenant isolation, key access, secret exposure, provider permissions, encryption boundaries, audit integrity and failure behavior.

20.14 Performance & Capacity Testing

- Measure encryption/decryption latency, throughput, concurrent operations, provider limits, database behavior and expected load.

20.15 End-to-End Production Integration Tests

- Test key lifecycle, encryption, decryption, configuration, secrets, APIs, access enforcement, auditing and provider behavior together.

20.16 Security Validation & Release Readiness

- Verify applicable security controls, dependency and configuration checks, regression results, recovery evidence and documented limitations.

20.17 Staging Deployment & Production Pilot

- Deploy to a controlled staging environment, validate operational procedures, run a limited pilot and establish rollback criteria.

20.18 Final Verification & Plan B Sign-off

- Run the agreed automated and manual test suites, type-check, build, production-readiness review and formal sign-off.
```

### Important design rules

- `Reuse the existing Security Core contracts`: Implement the production provider through established abstractions rather than rewriting cryptographic operations.
- `Do not store raw production key material in ordinary MySQL tables`: Store metadata and references; use the selected KMS or approved key-management mechanism to protect key material.
- `Separate key rotation from data re-encryption`: Rotating a key-encryption key does not necessarily re-encrypt all application data. Define the required behavior for each key type.
- `Never silently fall back to local keys`: Production provider failures must follow an explicit, safe failure policy.
- `Protect existing ciphertext`: Any provider migration must preserve the ability to decrypt permitted historical data or include a tested re-encryption and recovery strategy.
- `Test recovery, not just backups`: A backup is not proof of recoverability. Perform restore exercises and validate key availability.
- `Keep IAM and commercialization separate`: Phase 20 integrates the existing access-control boundary; it does not implement the full IAM SaaS, subscriptions, billing or entitlements.

### Phase 20 completion criteria

Phase 20 is complete when the selected production KMS is integrated and tested, key protection and recovery procedures are validated, provider failures are handled safely, operational monitoring and runbooks are available, and the agreed security, performance, deployment and release-readiness gates pass.
**Next step**: After Phase 19 is signed off, begin `20.1 — Existing Provider & Production Architecture Review`. We will inspect the actual implementation first and select a KMS strategy based on the existing provider contracts and deployment requirements.
Plan B completion milestone: Once Phase 20 is signed off, the next decision is whether to begin Plan C commercialization or run a controlled Security Product pilot first. A successful build alone does not establish production readiness; that also requires validated security controls, recovery procedures and operational evidence.

---
