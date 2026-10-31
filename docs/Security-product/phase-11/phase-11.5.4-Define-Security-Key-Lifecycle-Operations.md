## Phase 11.5.4 — Define Security Key Lifecycle Operations

We’ll now define the operations supported by the Security Resource Model and the rules each operation must enforce.
`In progress` — `design only`
Scope: Security Key and Security Key Version lifecycle operations. No code changes in this step.

### 1. Lifecycle operations

The following operations are proposed based on the finalized 11.5.3 state machine.

| Operation                       | Target                   | Purpose                                                                    |
| ------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| `createKey`                     | Parent + initial version | Create a security key and its initial version                              |
| `activateKey`                   | Parent + initial version | Activate a pending key after provider confirmation                         |
| `disableKey`                    | Parent                   | Disable the parent key without changing version statuses                   |
| `reactivateKey`                 | Parent                   | Reactivate a previously disabled parent key                                |
| `rotateKey`                     | Parent + versions        | Create a new active version and retain the previous version for decryption |
| `disableKeyVersion`             | Individual version       | Independently disable a version                                            |
| `getKey`                        | Parent                   | Retrieve a key within its authorized tenant scope                          |
| `getKeyVersion`                 | Individual version       | Retrieve a specific version within its authorized tenant scope             |
| `getActiveKeyVersion`           | Parent + versions        | Retrieve the active version if one exists                                  |
| `getKeyVersions`                | Parent + versions        | Retrieve version history                                                   |
| `validateEncryptionEligibility` | Parent + version         | Check whether encryption is allowed                                        |
| `validateDecryptionEligibility` | Parent + version         | Check whether decryption is allowed                                        |

### 2. Operation contracts

**2.1 `createKey`**

**Purpose**: Create a parent security key and its initial version.

Preconditions:

- Parent key ID and version ID must be valid.
- Tenant/resource scope must be valid.
- Initial version must belong to the parent key.
- Initial version number must match `currentVersion`.
- Provider and purpose must be valid.
- No raw key material may be persisted.

Expected behavior:

- Create parent and initial version atomically.
- Initial statuses depend on provider readiness:
  - `PENDING` when provisioning or activation is incomplete.
  - `ACTIVE` when the provider confirms readiness.
- Roll back both records if either persistence operation fails.

**2.2 `activateKey`**

**Purpose**: Activate a pending key after provider confirmation.

Preconditions:

- Parent key is `PENDING`.
- Initial version is `PENDING`.
- Provider confirms that the version is ready.

Expected behavior:

- Transition parent key to `ACTIVE`.
- Transition initial version to `ACTIVE`.
- Update lifecycle timestamps and audit metadata.
- Persist both changes atomically.

**2.3 `disableKey`**

**Purpose**: Disable the parent key.

Preconditions:

- Parent key is ACTIVE.
- Caller is authorized for the key's tenant/resource scope.

Expected behavior:

- Parent status becomes DISABLED.
- Individual version statuses remain unchanged.
- Historical versions remain available for authorized metadata retrieval.
- Encryption and decryption operations are blocked through this parent key.

**2.4 `reactivateKey`**

**Purpose**: Reactivate a disabled parent key.

Preconditions:

- Parent key is DISABLED.
- Provider confirms that the underlying key resource remains usable.
- Required authorization and scope checks pass.

Expected behavior:

- Parent status becomes ACTIVE.
- Version statuses remain unchanged.
- Disabled versions remain disabled.
- Encryption is permitted only if an eligible ACTIVE version exists.
- Historical decryption is permitted for eligible DECRYPT_ONLY versions.

**2.5 `rotateKey`**
**Purpose**: Replace the current active version while preserving historical decryption.

Preconditions:

- Parent key is ACTIVE.
- Previous version is the persisted current version.
- Previous version is ACTIVE.
- Next version belongs to the same parent key.
- Next version number follows the expected sequence.
- Provider confirms the next version is ready for activation.
- Expected current version matches persisted state.

Expected behavior:

1. Lock the parent key within the appropriate tenant scope.
2. Verify the expected current version.
3. Transition previous version from ACTIVE to DECRYPT_ONLY.
4. Insert the next version as ACTIVE.
5. Update the parent currentVersion.
6. Update audit metadata.
7. Commit all changes atomically.
   If any step fails, roll back the entire transaction.

**2.6 `disableKeyVersion`**

**Purpose**: Independently disable a specific version.

Preconditions:

- Parent key is ACTIVE.
- Target version belongs to the parent key.
- Target version is ACTIVE or DECRYPT_ONLY.
- Caller is authorized.

Expected behavior:

- Target version becomes DISABLED.
- Other version statuses remain unchanged.
- Parent status remains unchanged.
- The disabled version cannot be used for encryption or decryption.
- Version history remains preserved.
  There is one important edge case concerning the current active version. See the decision below.

### 3. Encryption and decryption eligibility

These should be centralized policy checks rather than duplicated status conditions across services.

| Parent status | Version status | Encryption | Historical decryption                    |
| ------------- | -------------- | ---------- | ---------------------------------------- |
| `ACTIVE`      | `ACTIVE`       | Allowed    | Not through historical-decryption policy |
| `ACTIVE`      | `DECRYPT_ONLY` | Blocked    | Allowed                                  |
| `ACTIVE`      | `DISABLED`     | Blocked    | Blocked                                  |
| `PENDING`     | Any            | Blocked    | Blocked                                  |
| `DISABLED`    | Any            | Blocked    | Blocked                                  |
| `DESTROYED`   | Any            | Blocked    | Blocked                                  |

### 4. Persistence and audit requirements

Every lifecycle mutation should:

- Validate the current state before transitioning.
- Verify tenant/resource ownership.
- Record the actor and operation timestamp.
- Use transactions for operations involving multiple records.
- Prevent stale concurrent updates.
- Preserve historical version metadata.
- Avoid storing raw cryptographic key material.
- Return a clear domain error when a transition is invalid.
  Generic repository updates must not become an alternative path for bypassing lifecycle rules.

### 5. One policy decision required

There is an important edge case in independent version disabling:

Suppose a key has one `ACTIVE` version, and that version is also the parent's currentVersion. If we independently disable it, the parent remains `ACTIVE`, but no active version remains for encryption.

How should `disableKeyVersion` handle the current active version?

- **Option A — Require rotation first (recommended)**

- The current active version cannot be disabled directly. Rotate to a new active version first, then disable the previous version if required.

#### Option A — Require rotation before disabling the current active version.

This ensures an active parent key does not lose its current encryption version through an independent version-disable operation.

**1. Finalized rule: Disable current active version**
When the target version is the parent's current active version:

1. Direct disabling is rejected.
1. A successful rotation must happen first.
1. The previous version transitions from ACTIVE to DECRYPT_ONLY.
1. The new version becomes ACTIVE and the parent currentVersion is updated.
1. The previous version can then be independently disabled if required.

| Stage                                   | Version 1      | Version 2 | Current version |
| --------------------------------------- | -------------- | --------- | --------------- |
| Before rotation                         | `ACTIVE`       | —         | `1`             |
| After successful rotation               | `DECRYPT_ONLY` | `ACTIVE`  | `2`             |
| After independently disabling Version 1 | `DISABLED`     | `ACTIVE`  | `2`             |

**2. Final lifecycle operation contracts**

| Operation                       | Finalized behavior                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `createKey`                     | Atomically create parent and initial version; status depends on provider readiness      |
| `activateKey`                   | Activate pending parent and initial version after provider confirmation                 |
| `disableKey`                    | Disable parent only; preserve version statuses                                          |
| `reactivateKey`                 | Reactivate parent after provider validation; preserve version statuses                  |
| `rotateKey`                     | Atomically transition previous version, insert next version, and update current version |
| `disableKeyVersion`             | Disable an eligible non-current version independently                                   |
| `getKey`                        | Retrieve parent within tenant scope                                                     |
| `getKeyVersion`                 | Retrieve a specific version within tenant scope                                         |
| `getActiveKeyVersion`           | Retrieve current active version                                                         |
| `getKeyVersions`                | Retrieve version history                                                                |
| `validateEncryptionEligibility` | Validate parent and version status for encryption                                       |
| `validateDecryptionEligibility` | Validate parent and version status for decryption                                       |

**3. Final operation invariants**

1. Parent and version lifecycle states remain independently managed.
2. Parent disable blocks encryption and decryption.
3. Parent reactivation does not reactivate disabled versions.
4. Only `ACTIVE` versions are eligible for encryption.
5. `DECRYPT_ONLY` versions are eligible for historical decryption while the parent is active.
6. `DISABLED` versions cannot be used for encryption or decryption.
7. The current active version cannot be independently disabled.
8. Rotation must succeed before the previous current version can be disabled.
9. At most one version can be `ACTIVE` per key.
10. Multi-record lifecycle operations must be transactional.
11. All lifecycle changes must enforce tenant scope and audit metadata.
12. Raw cryptographic key material must never be persisted.

**4. Deferred decisions**
The following remain outside the finalized contract:

- Reactivation of an individually disabled version.
- Cancellation of pending parent keys.
- `DESTROYED` transitions and provider-side destruction.
- Restoration of soft-deleted resources.

**Phase 11.5 progress**
| Step | Description | Status |
|------|----------------------------------------|--------|
| 11.5.1 | Review existing implementation | Complete |
| 11.5.2 | Define security resource model | Complete |
| 11.5.3 | Define lifecycle state machine | Complete |
| 11.5.4 | Define lifecycle operations | Complete |
| 11.5.5 | Define versioning and rotation rules | Next |
