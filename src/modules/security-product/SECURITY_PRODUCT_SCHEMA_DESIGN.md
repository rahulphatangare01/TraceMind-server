# TraceMind — Security Product Database Schema Design

**Phase:** 11.3.3 — Design Security Product Database Schemas  
**Status:** Proposed — pending verification and developer approval  
**Database:** MySQL / InnoDB  
**Depends on:** Phase 11.3.2 — Security Product Persistence Requirements

## 1. Purpose

Define the proposed relational schema for persistent Security Product
key metadata and key-version lifecycle records.

This document defines table responsibilities, logical columns,
relationships, tenant hierarchy constraints, indexes, lifecycle
integrity, and schema acceptance criteria.

This phase designs the schema. It does not implement SQL migrations,
repositories, or a persistent KeyProvider.

## 2. Design Principles

1. Preserve existing Security Product and Security Core contracts.
2. Follow existing tenant database conventions.
3. Store key metadata and version history separately.
4. Never store raw cryptographic key material in these tables.
5. Apply tenant scope in persistence queries.
6. Enforce relational integrity in MySQL wherever possible.
7. Preserve historical key versions.
8. Make key creation and rotation transaction-safe.
9. Keep database-specific details inside the infrastructure layer.
10. Avoid unrelated changes to existing tenant schemas.

## 3. Existing Database Conventions

The proposed tables follow the existing tenant schemas:

- Storage engine: InnoDB.
- Character set: utf8mb4.
- Collation: utf8mb4_unicode_ci.
- Identifiers: CHAR(36).
- Timestamps: DATETIME(3).
- Tenant foreign keys: ON DELETE RESTRICT and ON UPDATE RESTRICT.
- Deletion of key metadata: soft deletion using deleted_at.
- SQL access: parameterized statements.

## 4. Proposed Tables

### 4.1 security_keys

**Purpose:** Store the persistent metadata and tenant ownership of a
security key.

| Column          | Proposed SQL type | Nullable | Purpose                                            |
| --------------- | ----------------- | -------- | -------------------------------------------------- |
| id              | CHAR(36)          | No       | Primary key                                        |
| purpose         | VARCHAR(50)       | No       | Security key purpose                               |
| scope           | VARCHAR(30)       | No       | ORGANIZATION, PROJECT, APPLICATION, or ENVIRONMENT |
| organization_id | CHAR(36)          | No       | Owning organization                                |
| project_id      | CHAR(36)          | Yes      | Owning project when applicable                     |
| application_id  | CHAR(36)          | Yes      | Owning application when applicable                 |
| environment_id  | CHAR(36)          | Yes      | Owning environment when applicable                 |
| provider        | VARCHAR(100)      | No       | Provider identity                                  |
| status          | VARCHAR(30)       | No       | Key lifecycle status                               |
| current_version | INT UNSIGNED      | No       | Current committed version number                   |
| created_at      | DATETIME(3)       | No       | Creation timestamp                                 |
| updated_at      | DATETIME(3)       | No       | Last-update timestamp                              |
| deleted_at      | DATETIME(3)       | Yes      | Soft-deletion timestamp                            |
| created_by      | CHAR(36)          | Yes      | Creator identifier                                 |
| updated_by      | CHAR(36)          | Yes      | Last updater identifier                            |
| deleted_by      | CHAR(36)          | Yes      | Deleting actor identifier                          |

#### Primary key

- PRIMARY KEY (id)

#### Foreign keys

1. organization_id references organizations(id).
2. (project_id, organization_id) references projects(id, organization_id).
3. (application_id, project_id, organization_id) references
   applications(id, project_id, organization_id).
4. (environment_id, application_id, project_id, organization_id)
   references environments(id, application_id, project_id, organization_id).

All tenant foreign keys use ON DELETE RESTRICT and ON UPDATE RESTRICT.

#### Scope integrity

The scope must match the populated tenant identifiers:

- ORGANIZATION: organization_id populated; project_id, application_id,
  and environment_id are NULL.
- PROJECT: organization_id and project_id populated; application_id and
  environment_id are NULL.
- APPLICATION: organization_id, project_id, and application_id
  populated; environment_id is NULL.
- ENVIRONMENT: all four tenant identifiers populated.

Use a named CHECK constraint for these combinations.

The database must reject unsupported scopes. Application-level scope
validation remains required even when a database CHECK constraint exists.

#### Indexes

- Index for organization_id, scope, and deleted_at.
- Index for project_id and deleted_at.
- Index for application_id and deleted_at.
- Index for environment_id and deleted_at.
- Indexes required by foreign-key relationships.

Index choices must be validated against the actual scoped repository
queries before final SQL is approved.

### 4.2 security_key_versions

**Purpose:** Preserve each key version and its lifecycle history.

| Column                 | Proposed SQL type | Nullable | Purpose                    |
| ---------------------- | ----------------- | -------- | -------------------------- |
| id                     | CHAR(36)          | No       | Primary key                |
| key_id                 | CHAR(36)          | No       | Parent security key        |
| version                | INT UNSIGNED      | No       | Positive version number    |
| purpose                | VARCHAR(50)       | No       | Security key purpose       |
| status                 | VARCHAR(30)       | No       | Version lifecycle status   |
| provider_key_reference | VARCHAR(512)      | No       | Opaque provider reference  |
| created_at             | DATETIME(3)       | No       | Version creation timestamp |
| activated_at           | DATETIME(3)       | Yes      | Activation timestamp       |
| rotated_at             | DATETIME(3)       | Yes      | Rotation timestamp         |
| disabled_at            | DATETIME(3)       | Yes      | Disable timestamp          |
| destroyed_at           | DATETIME(3)       | Yes      | Destruction timestamp      |

#### Primary key and relationships

- PRIMARY KEY (id).
- FOREIGN KEY (key_id) references security_keys(id).
- Use ON DELETE RESTRICT and ON UPDATE RESTRICT.
- UNIQUE (key_id, version).

Version records are retained as lifecycle history. Generic key soft
deletion must not physically delete version records.

#### Indexes

- UNIQUE index on (key_id, version).
- Index on (key_id, status).
- Indexes must support specific-version and active-version retrieval.

#### Active-version integrity

At most one version for a key may have status ACTIVE.

The implementation must prevent concurrent rotations from creating
multiple active versions. Evaluate a MySQL generated column with a
unique index as a database-level safeguard, subject to the supported
MySQL version and lifecycle semantics.

The repository must also serialize or safely coordinate rotations.
A database constraint does not replace transactional lifecycle logic.

## 5. Tenant Hierarchy Integrity

The intended hierarchy is:

Organization → Project → Application → Environment

The existing schemas already provide these composite unique keys:

- projects: (id, organization_id)
- applications: (id, project_id, organization_id)

The existing environments schema does not define the composite key
required for the proposed security_keys environment foreign key.

Before final SQL implementation, evaluate adding this supporting
constraint to environments:

UNIQUE (id, application_id, project_id, organization_id)

This constraint is an explicit schema dependency, not an instruction
to modify the existing tenant schema during this design phase.

The environment relationship must be verified against the existing
application relationship and its composite foreign key.

## 6. Current Version Consistency

security_keys.current_version must identify a version belonging to
the same security key.

MySQL does not provide deferred foreign-key constraint checking.
A direct foreign key from (security_keys.id, current_version) to
(key_id, version) would complicate initial creation because the key
and its first version must be created together.

For the initial design:

1. Create the key and its initial version in one transaction.
2. Update current_version as part of the same transaction.
3. Ensure rollback leaves neither a partially created key nor a
   partially committed version.
4. Serialize concurrent rotations and update current_version only
   after the new lifecycle state is successfully committed.
5. Verify current_version against persisted versions in repository
   integration tests.

Do not add a circular foreign key without first resolving these
creation and transaction semantics.

## 7. Soft Deletion

Only security_keys has generic soft-deletion fields in this design.

- Set deleted_at and deleted_by when applicable.
- Normal key lookups exclude soft-deleted keys.
- Do not physically delete key metadata through generic softDelete.
- Retain version history.
- Do not assume that deleting a key automatically destroys provider
  material or revokes a provider reference.
- Restore and provider-destruction behavior require explicit lifecycle
  rules in a later implementation decision.

## 8. Security Restrictions

- Do not persist raw cryptographic key material.
- Treat provider_key_reference as opaque.
- Never log provider references or sensitive values unnecessarily.
- Use parameterized SQL.
- Validate scope before persistence.
- Include the complete supplied scope in repository reads and mutations.
- Do not use an unscoped lookup followed only by an ownership check.
- Keep authentication, authorization, and subscription entitlements
  outside the responsibility of these tables.
- Do not introduce IAM, billing, audit-event storage, or a secret vault
  in this phase.

## 9. Migration and Compatibility Considerations

Before implementing SQL:

1. Confirm the supported MySQL server version and CHECK constraint
   enforcement behavior.
2. Confirm the actual domain status and purpose values.
3. Verify all foreign-key column types and collations match their
   referenced columns.
4. Validate existing tenant data before adding the environment
   composite unique key.
5. Confirm index names do not conflict with existing schema objects.
6. Ensure schema execution order creates tenant tables before
   security-product tables.
7. Make migration execution repeatable only through an explicitly
   designed migration strategy; do not assume CREATE TABLE scripts
   are safely rerunnable.

## 10. Out of Scope

This design does not implement:

- SQL schema or migration files.
- Repository interfaces or MySQL repository implementations.
- A persistent KeyProvider.
- Security Product APIs.
- Provider credential storage.
- Raw key-material persistence.
- IAM, billing, entitlement, or dashboard features.

## 11. Acceptance Criteria

- [ ] Both proposed tables and their responsibilities are documented.
- [ ] Column types align with existing domain contracts.
- [ ] Tenant scope combinations are explicitly defined.
- [ ] Foreign-key and composite-key dependencies are documented.
- [ ] Key-version identity is unique per key.
- [ ] Active-version and current-version integrity are addressed.
- [ ] Soft deletion preserves key-version history.
- [ ] Raw key material is excluded.
- [ ] MySQL version and CHECK constraint support are verified.
- [ ] Automated specification tests pass.
- [ ] Manual verification passes.
- [ ] Type-check and build pass.
- [ ] Developer approves the schema design before SQL implementation.

**Final status:** Proposed — pending verification and developer approval.
