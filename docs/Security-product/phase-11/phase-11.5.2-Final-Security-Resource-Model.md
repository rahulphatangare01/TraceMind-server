## Phase 11.5.2 — Final Security Resource Model

### 1. Approved decisions

| Decision            | Agreed Behavior                                  |
| ------------------- | ------------------------------------------------ |
| Key disable         | Disable only the parent Security Key.            |
| Version statuses    | Preserve existing version statuses.              |
| Destruction         | Keep destruction transition policy under review. |
| Initial creation    | Provider-dependent: `PENDING` or `ACTIVE`.       |
| Raw key material    | Never persist in Security Product records.       |
| Historical versions | Preserve version history.                        |

Initial creation rule
The provider workflow determines the initial state:

- `PENDING`: provider provisioning or activation is not yet complete.
- `ACTIVE`: provider confirms that the initial version is ready for use.

  The key and initial version must have compatible states. Their exact validation will be defined in the lifecycle contract.
  Parent disable behavior
  When a Security Key becomes `DISABLED`:

- Update the parent key status.
- Do not automatically change individual version statuses.
- Preserve version history.
- Prevent use of versions through a disabled parent key.
- Any reactivation behavior requires an explicit lifecycle rule.
  This distinction is important: a version can retain its `ACTIVE` status while its parent key is disabled. Effective usability must therefore consider both statuses.
