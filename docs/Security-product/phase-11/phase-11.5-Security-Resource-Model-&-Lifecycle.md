## Phase 11.5 — Security Resource Model & Lifecycle

For TraceMind's Security Product Foundation, Phase 11.5 should build on the existing ownership model and persistence foundation. The goal is to define **how security resources are modeled, created, versioned, activated, rotated, disabled, revoked, and retired**, with consistent lifecycle rules and tenant-scoped operations.

We should follow the same approach as Phase 11.4: **inspect the existing implementation first, identify gaps, agree on the scope, then implement and test incrementally**. We should not recreate functionality that already exists in the Security Core or Security Product.

### 1. Objectives

- Define a consistent resource model for security keys and key versions.
- Establish explicit lifecycle states and permitted state transitions.
- Define resource creation, activation, rotation, deactivation, revocation, and retirement behavior.
- Preserve tenant ownership and complete `SecurityResourceScope` enforcement.
- Ensure key metadata and cryptographic key material have clearly separated responsibilities.
- Define persistence, validation, auditability, and failure-handling requirements.
- Prepare reusable lifecycle conventions for future security resources without prematurely implementing them.

### 2. Proposed step-by-step implementation plan

#### Step 11.5.1 — Review the existing security resource implementation

`Inspect only`
Review the existing models, schemas, services, repositories, transaction adapter, lifecycle methods, and tests.

- Inspect SecurityKeyPersistenceRecord and SecurityKeyVersionPersistenceRecord.
- Review current statuses and lifecycle-related constants.
- Review key creation, rotation, activation, deactivation, and deletion-related behavior where implemented.
- Identify existing capabilities, gaps, duplicated logic, and incomplete lifecycle behavior.
  `Deliverable: source-backed implementation inventory and gap list. No code changes yet.`

#### Step 11.5.2 — Define the security resource model

Define the canonical model for each resource currently in scope.

- Security key metadata.
- Security key version metadata.
- Resource identifiers and parent relationships.
- Tenant ownership scope and required identifiers.
- Provider references, version numbers, timestamps, audit metadata, and soft-delete fields.
- Required, optional, nullable, and immutable fields.
  `Deliverable: documented resource contracts and field invariants.`

#### Step 11.5.3 — Define the resource lifecycle state machine

Establish the valid states and transitions for keys and their versions.

- Review existing statuses before introducing any new ones.
- Define which transitions are allowed and which must be rejected.
- Define terminal or irreversible states, if applicable.
- Specify the behavior of the current version and older versions during rotation.
- Define how invalid transitions and repeated requests behave.
  `Deliverable: lifecycle state-transition table and validation rules.`

#### Step 11.5.4 — Define key lifecycle operations

Specify the behavior and contracts for supported operations.

- Create a security key.
- Retrieve a key within its authorized ownership scope.
- Activate or deactivate a key, if supported by the design.
- Rotate a key.
- Retire or revoke a key, where the lifecycle requires it.
- Soft-delete or archive metadata where permitted.
- Retrieve the current version and relevant version history.
  Each operation must define its preconditions, state changes, persistence effects, and error outcomes. Existing functionality should be reused rather than duplicated.

`Deliverable: operation contracts and lifecycle invariants.`

#### Step 11.5.5 — Define key-versioning and rotation rules

Formalize version creation and rotation behavior.

- Define unique and sequential version numbers.
- Ensure each version belongs to the correct parent key.
- Define which version is current and which older versions remain usable.
- Preserve atomicity across version creation and parent-key updates.
- Handle stale versions, concurrent rotations, missing resources, and transaction failures.
- Define when older versions can be retired.
  `Deliverable: versioning invariants, rotation contract, and failure-handling rules.`

#### Step 11.5.6 — Enforce persistence and lifecycle invariants

Verify that the service and persistence layers enforce the approved model.

- Validate lifecycle transitions before persistence.
- Enforce complete tenant scope on resource reads and mutations.
- Prevent inconsistent parent-key and key-version state.
- Preserve transactional guarantees during rotation.
- Enforce appropriate uniqueness, status, and soft-delete rules.
- Keep cryptographic key material out of metadata records.
  `Deliverable: minimal service, repository, or transaction changes where evidence shows a gap.`

#### Step 11.5.7 — Define errors, audit events, and failure recovery

Establish consistent outcomes for lifecycle operations.

- Missing or incorrectly scoped resources.
- Invalid state transitions.
- Duplicate or conflicting version operations.
- Concurrent updates and stale state.
- Persistence failures and transaction rollback.
- Security-relevant lifecycle events and audit metadata.
  Audit integration should reuse existing infrastructure where possible. Do not introduce a separate audit subsystem unless the current architecture requires one.

`Deliverable: error contract, audit requirements, and recovery expectations.`

#### Step 11.5.8 — Add lifecycle and regression tests

Add tests only for confirmed coverage gaps.

- Valid and invalid lifecycle transitions.
- Key-version creation and rotation.
- Incorrect parent-key or tenant scope.
- Stale version and concurrent-operation scenarios.
- Transaction rollback and persistence failures.
- Soft deletion, revocation, and retirement behavior where implemented.
- Backward compatibility with existing Security Core contracts.
  `Deliverable: automated tests demonstrating lifecycle invariants and regression safety.`

#### Step 11.5.9 — Document the security resource lifecycle

Update the Phase 11.5 documentation with the approved resource contracts, lifecycle state machine, operation rules, versioning behavior, test evidence, and known limitations.

Deliverable: reviewed lifecycle documentation consistent with the implementation.

#### Step 11.5.10 — Run regression checks and close the phase

- Run targeted lifecycle tests.
- Run the relevant Security Product and Security Core regression suites.
- Run TypeScript type-check and production build.
- Review the final diff and document all deferred work.
- Verify that ownership enforcement and existing persistence behavior remain intact.
  `Deliverable: verified results and a documented Phase 11.5 completion decision.`

### 3. What we will implement

| Area               | Expected Outcome                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Resource contracts | Consistent security key and key-version models.                                            |
| Lifecycle states   | Explicit, validated state transitions.                                                     |
| Key operations     | Defined creation, retrieval, rotation, and retirement/revocation behavior where supported. |
| Version management | Consistent version numbering, parent relationships, and current-version tracking.          |
| Tenant isolation   | Complete `SecurityResourceScope` on applicable operations.                                 |
| Persistence        | Consistent state changes, transactional behavior, and deletion rules.                      |
| Validation         | Rejection of invalid fields, state transitions, and inconsistent relationships.            |
| Error handling     | Predictable lifecycle errors and recovery behavior.                                        |
| Auditability       | Reuse of existing monitoring/audit infrastructure for security-relevant events.            |
| Automated tests    | Lifecycle, versioning, isolation, failure, and regression coverage.                        |
| Documentation      | Resource contracts, state machine, operation rules, and test evidence.                     |

### 4. What is outside this phase

To keep Phase 11.5 focused, the following should remain outside its scope unless the existing architecture demonstrates an essential dependency:

- Full IAM, RBAC, and UBAC implementation.
- New authentication or authorization systems.
- A customer-facing Security Product API or dashboard.
- Phase 12 database migration work, except where a separately approved migration is necessary for an identified lifecycle requirement.
- Building a separate secrets-management or credentials-management service.
- Replacing the Security Core or rewriting the existing persistence layer.
- Implementing lifecycle services for future resource types before their requirements are established.

### 5. Important design principles

`Tenant isolation remains mandatory`

Lifecycle operations must respect the existing ownership model and scoped repository contracts.

`State transitions must be explicit`

No implicit or unvalidated status changes. The final state machine must be based on the existing implementation and approved requirements.

`Persistence operations must remain consistent`

Version creation and current-version changes must not leave partially updated state.

`Metadata and key material remain separate`

Persistence records may contain provider references and lifecycle metadata, but must not contain raw cryptographic key material.

`Existing behavior must be verified before changing it`

Preserve working functionality and introduce only changes supported by identified gaps and tests.

### 6. Completion criteria

Phase 11.5 can be considered complete when:

- [ ] Existing resource models and lifecycle behavior have been inspected.
- [ ] Security key and key-version contracts are documented.
- [ ] Valid lifecycle states and transitions are defined.
- [ ] Versioning and rotation invariants are verified.
- [ ] Applicable lifecycle operations enforce tenant scope.
- [ ] Persistence consistency and failure handling are verified.
- [ ] Required audit events use the existing architecture.
- [ ] Tests cover identified lifecycle gaps and relevant regressions.
- [ ] Type-check and production build succeed.
- [ ] Documentation, final diff, and deferred items are reviewed.

### 7. How we will start

We will begin with Step 11.5.1 only. No implementation changes until we inspect the current code.

Run these commands from the TraceMind project root in Git Bash:

```js
printf '\n===== SECURITY RESOURCE MODELS =====\n'
grep -R -n \
 --include='\*.ts' \
 -E 'SecurityKeyPersistenceRecord|SecurityKeyVersionPersistenceRecord' \
 src/modules/security-product

printf '\n===== LIFECYCLE STATUSES AND TRANSITIONS =====\n'
grep -R -n \
 --include='\*.ts' \
 -E 'DECRYPT_ONLY|REVOKED|RETIRED|ARCHIVED|INACTIVE|ACTIVE|currentVersion|rotate|rotation' \
 src/modules/security-product

printf '\n===== LIFECYCLE SERVICES AND REPOSITORIES =====\n'
find src/modules/security-product -type f \
 | grep -E 'service|repository|transaction|model|schema|spec\.ts$'

printf '\n===== LIFECYCLE TESTS =====\n'
grep -R -n \
 --include='\*.spec.ts' \
 -E 'rotation|current version|version number|DECRYPT_ONLY|soft.delete|revok|retir|lifecycle' \
 src/modules/security-product/**tests**
```

Share the output, and we will inspect the existing implementation, identify the exact gaps, and proceed one step at a time. We will not begin Step 11.5.2 or make code changes until Step 11.5.1 is reviewed.
