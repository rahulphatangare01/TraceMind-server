## Phase 11.5.3 — Security Resource Lifecycle State Machine

Finalized
No code changes

Your three decisions are incorporated. The lifecycle state machine is now finalized as follows.

### 1. Parent Security Key lifecycle

| Current State | Allowed Next State | Trigger / Condition                                             |
| ------------- | ------------------ | --------------------------------------------------------------- |
| `PENDING`     | `ACTIVE`           | Provider confirms initial key readiness.                        |
| `ACTIVE`      | `DISABLED`         | Authorized parent-key disable.                                  |
| `DISABLED`    | `ACTIVE`           | Authorized reactivation after required validation.              |
| `ACTIVE`      | `DESTROYED`        | Deferred — destruction policy requires review.                  |
| `DISABLED`    | `DESTROYED`        | Deferred — destruction policy requires review.                  |
| `PENDING`     | `DISABLED`         | Deferred — pending-key cancellation policy requires definition. |

**Rules**:

- Parent key reactivation is allowed.
- Reactivation changes the parent key status only; it does not automatically change individual version statuses.
- A disabled parent key blocks normal use of all its versions, regardless of their individual statuses.
- Parent disable does not rewrite version history.
- DECRYPT_ONLY remains a version-level state, not a parent-key state.

### 2. Security Key Version lifecycle

| Current State  | Allowed Next State | Trigger / Condition                                                       |
| -------------- | ------------------ | ------------------------------------------------------------------------- |
| `PENDING`      | `ACTIVE`           | Provider confirms version activation.                                     |
| `PENDING`      | `DISABLED`         | Authorized cancellation/disable.                                          |
| `ACTIVE`       | `DECRYPT_ONLY`     | Successful rotation; previous version retained for historical decryption. |
| `ACTIVE`       | `DISABLED`         | Authorized independent version disable.                                   |
| `DECRYPT_ONLY` | `DISABLED`         | Authorized independent version disable.                                   |
| `DISABLED`     | `ACTIVE`           | Deferred — version reactivation policy requires review.                   |
| Any state      | `DESTROYED`        | Deferred — destruction policy requires review.                            |

**Rules:**

- Independent version disabling is allowed.
- Disabling one version must not automatically disable its parent key or other versions.
- A disabled version cannot be used for encryption or historical decryption.
- DECRYPT_ONLY versions remain eligible for historical decryption when the parent key is ACTIVE.
- Version history is retained.

### 3. Effective usability rules

The state of both the parent key and the individual version determines whether an operation is allowed.

**Normal key usage (encryption):**

```js
UsableForEncryption =
  key.status === KeyStatus.ACTIVE && version.status === KeyStatus.ACTIVE;
```

**Historical decryption:**

```js
UsableForHistoricalDecryption =
  key.status === KeyStatus.ACTIVE && version.status === KeyStatus.DECRYPT_ONLY;
```

**Disabled version:**

```js
Usable =
  key.status === KeyStatus.ACTIVE && version.status !== KeyStatus.DISABLED;
```

The last expression is only a partial state check, not a complete authorization rule. Actual operation eligibility must use the explicit encryption/decryption rules above.

### 4. Final lifecycle invariants

1. Parent key and version statuses are independently managed.
2. Parent disable blocks all key operations, including historical decryption.
3. Parent reactivation does not automatically reactivate disabled versions.
4. Independent version disable affects only the selected version.
5. `ACTIVE` versions are eligible for normal encryption operations.
6. `DECRYPT_ONLY` versions are eligible only for historical decryption.
7. `DISABLED` versions are ineligible for encryption and decryption.
8. At most one version may be `ACTIVE` per key.
9. Rotation must atomically transition the previous version to `DECRYPT_ONLY`, insert the next `ACTIVE` version, and update the parent's currentVersion.
10. Provider readiness determines initial activation.
11. Soft deletion, `DISABLED`, and `DESTROYED` remain distinct concepts.
12. Destruction behavior remains out of scope until its policy is explicitly approved.

### 5. Deferred policy decisions

These are intentionally not finalized in this step:

- Whether a disabled individual version can be reactivated.
- Whether a pending parent key can be cancelled or disabled.
- Exact `DESTROYED` transition rules and provider-side destruction behavior.
- Whether and how a destroyed resource can be restored (if at all).

### Phase 11.5 progress

| Step   | Description                    | Status   |
| ------ | ------------------------------ | -------- |
| 11.5.1 | Review existing implementation | Complete |
| 11.5.2 | Define security resource model | Complete |
| 11.5.3 | Define lifecycle state machine | Complete |
| 11.5.4 | Define lifecycle operations    | Next     |

- No code changes are required for 11.5.3. This step establishes the approved lifecycle policy.
