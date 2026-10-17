# TraceMind — Security Product Persistence Requirements

**Phase:** 11.3.2 — Define Security Product Persistence Requirements  
**Status:** Draft — pending developer verification and approval  
**Module:** Security Product  
**Database:** MySQL / InnoDB  
**Depends on:** Phase 11.2 — Security Product Module Boundaries

---

## 1. Purpose

Define the persistence requirements that must be satisfied before
Security Product database schemas and MySQL repository implementations
are designed.

This document establishes the required persisted resources, data
ownership, tenant isolation, lifecycle behavior, security restrictions,
and acceptance criteria.

It does not define the final SQL schema or implement persistence.

## 2. Architecture Boundaries

1. Security Product owns product-level persistence requirements.
2. Security Core remains independent of Security Product.
3. Security Core operations are accessed through established public
   contracts.
4. Database access belongs in persistence adapters and repositories.
5. Application and domain contracts must not expose MySQL-specific types.
6. Tenant ownership validation is separate from authentication,
   authorization, and subscription entitlements.
7. Database persistence must not bypass the existing tenant hierarchy.
8. Existing Security Core interfaces must not be changed merely to
   accommodate a database implementation.

## 3. Persistence Scope

### 3.1 Initial persistence resources

The initial database-backed security resource is key metadata.

Key-version lifecycle records must also be persisted so that key
rotation and retrieval do not depend exclusively on process memory.

The persistence design must support:

- Security key metadata.
- Individual key versions.
- Key purpose, scope, provider identity, and status.
- Current key-version information.
- Key creation and update timestamps.
- Version creation and lifecycle timestamps.
- Provider key references, stored as opaque references.

### 3.2 Explicitly outside the initial scope

The following are not automatically included in this phase:

- Raw cryptographic key material.
- Encryption/decryption payload storage.
- A new secret vault.
- Provider credential management.
- Security Product HTTP APIs.
- Authentication and IAM implementation.
- Authorization policy storage.
- Subscription billing and entitlement storage.
- Audit-event storage and dashboards.

These resources require separately approved requirements if they
become part of a later phase.

## 4. Existing Domain Contracts

The design must remain compatible with the existing contracts:

- `SecurityKey`
- `SecurityKeyVersion`
- `KeyProvider`
- `SecurityKeyManagementService`
- `SecurityResourceScope`
- `SecurityProductPersistencePort`

The existing `SecurityProductPersistencePort` defines:

- `findById`
- `create`
- `update`
- `softDelete`

Key lifecycle persistence must additionally support the operations
required by the established key-management service, including
retrieving a specific version, retrieving the active version,
rotating a key, and changing version status.

These operations must not be represented as arbitrary, unvalidated
updates to persisted records.

## 5. Required Key Metadata

The persistence model must account for the following logical fields.

| Field          | Requirement                         |
| -------------- | ----------------------------------- |
| id             | Stable key identifier               |
| purpose        | Valid security key purpose          |
| scope          | Valid supported security scope      |
| organizationId | Organization owner where applicable |
| projectId      | Project owner where applicable      |
| applicationId  | Application owner where applicable  |
| environmentId  | Environment owner where applicable  |
| provider       | Provider identity                   |
| status         | Valid key lifecycle status          |
| currentVersion | Current key-version number          |
| createdAt      | Creation timestamp                  |
| updatedAt      | Last-update timestamp               |

Field names above describe domain concepts. Database column names
and exact SQL types will be decided during schema design.

## 6. Required Key-Version Metadata

Each version must retain enough information to identify the version
and enforce its lifecycle.

| Field                | Requirement                           |
| -------------------- | ------------------------------------- |
| id                   | Stable version-record identifier      |
| keyId                | Parent key identifier                 |
| version              | Version number within its key         |
| purpose              | Key purpose                           |
| status               | Version lifecycle status              |
| providerKeyReference | Opaque reference used by the provider |
| createdAt            | Version creation timestamp            |
| activatedAt          | Activation timestamp when applicable  |
| rotatedAt            | Rotation timestamp when applicable    |
| disabledAt           | Disable timestamp when applicable     |
| destroyedAt          | Destruction timestamp when applicable |

The logical identity of a version is the combination of its key
identifier and version number.

A version must not silently become associated with another key.

## 7. Tenant Scope and Ownership

Security Product tenant-owned persistence supports the scopes defined
by `SecurityResourceScope`:

- ORGANIZATION
- PROJECT
- APPLICATION
- ENVIRONMENT

The complete supplied scope must be used in database reads and
mutations.

### 7.1 Required hierarchy

- ORGANIZATION resources belong to an organization.
- PROJECT resources belong to a project within an organization.
- APPLICATION resources belong to an application within a project
  and organization.
- ENVIRONMENT resources belong to an environment within an
  application, project, and organization.

### 7.2 Scope validation

Before persistence, the implementation must reject:

- Missing required tenant identifiers.
- Inconsistent parent and child identifiers.
- A resource whose persisted ownership differs from the supplied scope.
- Attempts to access a resource using a different tenant scope.

The database schema must enforce hierarchy constraints wherever
relational constraints can express them.

### 7.3 Unsupported generic scopes

PLATFORM and FIELD are not part of the current
`SecurityResourceScope` contract.

They must not be forced into the tenant-resource model. Any future
platform-wide or field-level persistence requires an explicit design.

## 8. Read and Mutation Requirements

### 8.1 Reads

- Reads must apply the complete resource scope in the query.
- Normal reads must exclude soft-deleted resources.
- Missing resources return `null` where the existing contract specifies it.
- Version lookups must verify both key identity and version number.
- An unscoped lookup followed by an ownership check is insufficient.

### 8.2 Creation

- Creation must validate required fields and scope consistency.
- Parent resources must exist and match the supplied hierarchy.
- Unique constraints must prevent duplicate resource identities.
- Database errors must not be silently converted into successful results.

### 8.3 Updates

- Updates must be scoped to the resource's complete ownership hierarchy.
- Updates must not change ownership implicitly.
- Lifecycle changes must follow valid state transitions.
- No-op and missing-resource behavior must be documented and tested.
- Concurrent lifecycle operations must not create inconsistent versions.

### 8.4 Soft deletion

- Generic soft deletion must not physically delete the record.
- Deletion must record the deletion timestamp and actor where available.
- Normal reads must exclude deleted records.
- Restore behavior, if supported, must be explicit and tested.
- Parent-child deletion rules must not be assumed without an approved policy.

## 9. Key-Version Lifecycle Requirements

The persistence design must preserve the existing lifecycle concepts.

1. A newly created key begins with an initial version.
2. A rotation creates a new version with a unique version number.
3. The previously active version transitions to DECRYPT_ONLY when
   that transition is valid under the existing lifecycle rules.
4. The new version becomes ACTIVE only when the rotation succeeds.
5. Historical versions remain addressable for supported decryption
   and lifecycle operations.
6. Status changes must persist the appropriate lifecycle timestamps.
7. A key's currentVersion must agree with the successfully committed
   lifecycle state.
8. Failed operations must not leave partially applied lifecycle changes.
9. Concurrent rotations must not create duplicate version numbers
   or multiple unintended active versions.

The implementation must determine and test transaction boundaries
before enabling database-backed rotation.

## 10. Data Protection Requirements

- Raw cryptographic key material must not be stored in MySQL by this
  metadata persistence layer.
- Provider references must be treated as opaque values.
- Sensitive provider references must not be exposed in routine logs.
- Secrets, passwords, encryption keys, and provider credentials must
  not be included in error messages or diagnostic output.
- Database credentials must come from validated environment configuration.
- Database queries must use parameterized statements.
- Tenant isolation must not rely solely on application-side filtering.
- Database access must follow the existing Security Product dependency
  boundaries.

Encryption of selected metadata at rest, provider-specific secret storage,
and key-material persistence require separate explicit designs.

## 11. Repository Requirements

Persistence adapters must:

- Implement application-level contracts.
- Keep MySQL and driver-specific types inside the infrastructure layer.
- Use parameterized SQL.
- Apply tenant scope in the query itself.
- Preserve domain-to-database mapping consistently.
- Handle missing and soft-deleted records predictably.
- Avoid leaking database implementation details through public contracts.
- Support the transaction requirements of key lifecycle operations.
- Be testable without requiring production credentials.

## 12. Schema Requirements

The later schema design must evaluate:

- Primary keys and stable identifiers.
- Key-to-version relationships.
- Unique version identity per key.
- Valid foreign keys and tenant hierarchy.
- Appropriate indexes for scoped lookup and lifecycle queries.
- Audit timestamps and soft-delete behavior where required.
- Safe migration and schema execution practices.
- Referential integrity when deleting or restoring related records.

Exact table names, column types, indexes, and foreign-key definitions
are deferred to the database-schema design phase.

## 13. Testing Requirements

Automated tests must cover:

- Required metadata and version fields.
- Valid and invalid tenant scopes.
- Cross-tenant read and mutation rejection.
- Missing and soft-deleted resources.
- Duplicate key-version identity.
- Rotation and status transitions.
- Persistence of lifecycle timestamps.
- Atomicity of multi-record lifecycle operations.
- Parameterized query behavior.
- Database constraint failures.
- Protection against raw key-material persistence.
- Existing Security Core contract compatibility.

Unit tests, repository integration tests, and manual verification
must have clearly distinguished responsibilities.

## 14. Out of Scope

This requirements phase does not implement:

- SQL schema files.
- Database migrations.
- MySQL repository classes.
- A persistent `KeyProvider`.
- Security Product endpoints.
- IAM authorization.
- Billing or entitlement enforcement.
- Dashboard features.

Those changes must follow the approved requirements and architecture.

## 15. Acceptance Criteria

Phase 11.3.2 is ready for sign-off when:

- [ ] Persisted resources are explicitly identified.
- [ ] Key metadata and version fields are documented.
- [ ] Tenant scope and ownership rules are documented.
- [ ] Key lifecycle persistence requirements are documented.
- [ ] Data protection restrictions are explicit.
- [ ] Repository and schema requirements are documented.
- [ ] Automated specification tests pass.
- [ ] Manual verification passes.
- [ ] Type-check and production build pass.
- [ ] No unresolved requirement conflicts with existing contracts.
- [ ] The developer approves the requirements before schema design.

**Final status:** Pending verification and developer approval.
