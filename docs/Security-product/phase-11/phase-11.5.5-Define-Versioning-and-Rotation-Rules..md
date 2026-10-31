## Phase 11.5.5 — Define Versioning and Rotation Rules.

In progress — design only
We’ll define how security key versions are numbered, created, activated, rotated, retained, and protected against concurrent updates.

As agreed, we will first establish the existing behavior and identify gaps. No code changes in this step.

### 1. Existing implementation — reviewed baseline

Based on the source details already reviewed in Phase 11.5.1:
| Area | Existing behavior | Assessment |
|-------------------------|---------------------------------------------------------------------------|------------|
| Version ownership | Each version references a parent `keyId` | Established |
| Version sequence | Rotation validates the next version sequence | Established |
| Current version | Parent stores `currentVersion` | Established |
| Initial creation | Parent and initial version are created transactionally | Established |
| Rotation | Previous version becomes `DECRYPT_ONLY`; next version becomes `ACTIVE` | Established |
| Concurrency | Parent key is locked using `FOR UPDATE` | Established |
| Stale updates | Expected current version is checked | Established |
| Version history | Historical versions are retained | Established |
| Unique version constraint | Proposed in schema design | Actual database constraint not verified |
| Current-version integrity | Validated by application logic during creation and rotation | Actual database constraint not verified |
| Provider readiness | Initial activation depends on provider readiness | Detailed rotation provisioning workflow not verified |

Important: the schema document describes proposed database constraints. We have not verified actual SQL DDL or migrations establishing those constraints.

### 2. Versioning rules to finalize

I recommend defining these rules explicitly:

| Rule                | Proposed behavior                                                                |
| ------------------- | -------------------------------------------------------------------------------- |
| Initial version     | Start at version `1`                                                             |
| Increment           | Each new version increments by exactly `1`                                       |
| Uniqueness          | `(keyId, version)` must be unique                                                |
| Ownership           | A version cannot belong to another parent key                                    |
| Current version     | Parent `currentVersion` must reference an existing version belonging to that key |
| Historical versions | Retain previous versions and their metadata                                      |
| Version reuse       | Never reuse a previously assigned version number                                 |
| Version gaps        | Do not allow gaps in the normal rotation sequence                                |
| Raw key material    | Never persist it                                                                 |

### 3. Rotation lifecycle

The intended rotation flow is:

### Key Rotation Workflow

1. **Validate rotation request**
   - Parent active
   - Expected version
   - Scope

2. **Verify provider readiness**
   - Next version is ready to activate

3. **Execute database transaction**
   - Lock parent
   - Verify current version

4. **Transition versions**
   - Previous → `DECRYPT_ONLY`
   - Next → `ACTIVE`

5. **Update parent `currentVersion`**
   - Commit all changes atomically

If any database operation fails, the transaction must roll back. Provider-side operations require separate failure handling because a database rollback cannot automatically reverse an external provider operation.

### 4. Decisions required to finalize versioning policy

I recommend the following defaults. Please confirm or change them.

### Versioning and Rotation Policy Decisions

#### 1. Initial version number

- [x] Start at version 1 (recommended)
- [ ] Start at version 0
- [ ] Review later

#### 2. Version sequence

- [x] Strict increment by exactly 1 (recommended)
- [ ] Allow gaps in version numbers
- [ ] Review later

#### 3. Version number reuse

- [x] Never reuse a version number (recommended)
- [ ] Allow reuse after deletion
- [ ] Review later

#### 4. Provider readiness during rotation

- [x] Provider must confirm readiness before database transaction (recommended)
- [ ] Create pending version first, activate after provider confirmation
- [ ] Review later

#### 5. Provider succeeds but database transaction fails

- [x] Attempt provider cleanup and record failure for recovery (recommended)
- [ ] Retain provider resource and retry database persistence
- [ ] Review later

## Phase 11.5.5 — Versioning and Rotation Rules

`Complete` **Design finalized — no code changes**

### 1. Finalized versioning rules

| Area               | Finalized rule                                                               |
| ------------------ | ---------------------------------------------------------------------------- |
| Initial version    | Every new security key starts at version `1`                                 |
| Version increment  | Strict increment by exactly `1`                                              |
| Version uniqueness | `(keyId, version)` must be unique                                            |
| Version reuse      | Never reuse an assigned version number                                       |
| Version ownership  | Every version belongs to exactly one parent key                              |
| Current version    | Parent `currentVersion` references an existing version belonging to that key |
| Version history    | Preserve historical version metadata                                         |
| Version gaps       | Not allowed in the normal rotation sequence                                  |
| Raw key material   | Never persist cryptographic key material                                     |

Example:

```js
Security Key: key_001

Version 1 → ACTIVE
Version 2 → DECRYPT_ONLY
Version 3 → DECRYPT_ONLY
Version 4 → ACTIVE

Current Version: 4
Next Version: 5
```

If version 4 is disabled later, version 5 must not be replaced with version 4.

### 2. Finalized rotation workflow

### Key Rotation Workflow

1. **Validate rotation request**
   - Verify tenant scope, parent status, expected current version, and version sequence.

2. **Provider provisioning**
   - Request creation of the next provider-side version.

3. **Provider readiness confirmation**
   - Provider must confirm readiness before starting the database transaction.

4. **Start database transaction**
   - Lock the parent key using `FOR UPDATE` and revalidate the expected current version.

5. **Update previous version**
   - Transition the previous `ACTIVE` version to `DECRYPT_ONLY`.

6. **Insert next version**
   - Insert the provider-confirmed next version with status `ACTIVE`.

7. **Update parent key**
   - Update `currentVersion`, `updatedAt`, and audit metadata.

8. **Commit transaction**
   - Commit all database changes atomically.

### 3. Provider and database failure recovery

Your decision establishes an important distinction between provider operations and database transactions.

| Scenario                                                   | Required behavior                                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Provider provisioning fails                                | Do not start the database transaction                                         |
| Provider confirms readiness, database transaction succeeds | Rotation completes                                                            |
| Provider confirms readiness, database transaction fails    | Roll back transaction and attempt provider cleanup                            |
| Provider cleanup succeeds                                  | Record cleanup outcome                                                        |
| Provider cleanup fails                                     | Record failure for recovery and retain sufficient provider reference metadata |

**Important recovery requirement**: Provider cleanup itself can fail. The system must not silently discard the provider reference or claim the resource was destroyed.

A recovery record should contain enough metadata to identify the operation and retry cleanup safely. Its persistence mechanism and schema will be defined in a later implementation design.

### 4. Final rotation invariants

1. Initial version always starts at 1.
2. Version numbering increments by exactly one.
3. Previously assigned version numbers are never reused.
4. Version numbers are unique within a parent key.
5. Every version belongs to the same parent key throughout its lifecycle.
6. Provider readiness must be confirmed before the database transaction.
7. Parent locking and expected-version validation prevent stale concurrent rotation.
8. Previous and next version transitions must be committed atomically.
9. Parent `currentVersion` must match the newly activated version after successful rotation.
10. Database failure must trigger rollback.
11. Provider cleanup must be attempted after provider success and database failure.
12. Cleanup failure must be recorded for recovery.
13. Historical versions remain available according to their lifecycle eligibility.
14. Raw cryptographic key material must never be persisted.

### 5. Concurrency example

Suppose two requests attempt to rotate version 4 simultaneously.

- Request A expects version 4.
- Request B also expects version 4.
- Request A obtains the parent lock and completes rotation to version 5.
- Request B obtains the lock afterward.
- Request B rechecks `expectedCurrentVersion`.
- The persisted version is now 5, so Request B is rejected as stale.
  This prevents two concurrent rotations from creating conflicting current versions.

### 6. Deferred implementation considerations

These are not yet implementation decisions:

- Exact provider cleanup/recovery record schema.
- Retry policy, retry limits, and backoff.
- Cleanup idempotency mechanism.
- Recovery worker or scheduled reconciliation mechanism.
- Database uniqueness and referential constraints verification against actual DDL.
- Handling provider resources that remain orphaned after repeated cleanup failures.

| Step   | Description                              | Status   |
| ------ | ---------------------------------------- | -------- |
| 11.5.1 | Review existing implementation           | Complete |
| 11.5.2 | Define security resource model           | Complete |
| 11.5.3 | Define lifecycle state machine           | Complete |
| 11.5.4 | Define lifecycle operations              | Complete |
| 11.5.5 | Define versioning and rotation rules     | Complete |
| 11.5.6 | Enforce persistence/lifecycle invariants | Next     |
