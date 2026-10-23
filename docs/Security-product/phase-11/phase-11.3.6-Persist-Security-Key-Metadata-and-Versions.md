## Phase 11.3.6 — Persist Security Key Metadata and Versions.

**Objective**: Persist security key metadata and version lifecycle information in MySQL while preserving tenant isolation, existing Security Core contracts, and the rule that raw key material must never be stored in the database.

**Phase overview**

```js
11.3.5 — Repository and transaction adapters
Complete — based on your confirmed test, type-check, and build results.

11.3.6 — Key metadata and version persistence
Current phase — implementation and verification pending.
```

### Step-by-step implementation plan

We’ll complete these sequentially, validating each step before moving on.

### 1. `11.3.6.1 — Verify the model changes`

- Confirm the new `SecurityKey` and `SecurityKeyVersion` model files, barrel exports, imports, and compatibility with existing Core contracts.

- **Gate**: Type-check and build pass after adding the files.

### 2. `11.3.6.2 — Inspect the current key-management flow`

- Review the current `LocalKeyProvider`, `SecurityServiceKeyManagementApi`, Security Product persistence ports, MySQL repositories, transaction adapter, and container wiring.
- Determine precisely where persistence should be introduced without duplicating existing behavior.
- **Gate**: Agree on the integration boundary before changing code.

### 3. `11.3.6.3 — Define the persistence integration contract`

- Define how key-management operations use the existing persistence ports and transaction adapter. Preserve Security Core’s public contracts and dependency direction.
- Cover key creation, lookup, active-version lookup, rotation, and status changes.
- **Gate**: Contracts clearly define transaction boundaries, errors, and return values.

### 4. `11.3.6.4 — Persist key metadata and the initial version`

- Implement key creation so the metadata record and initial version are written atomically through `createKeyWithInitialVersion`.
- Validate required organization and scope information. Ensure failures roll back both records.
- **Gate**: Creation persists both records or neither.

### 5. `11.3.6.5 — Implement persistent key and version lookups`

- Read metadata and version records through the existing scoped repositories. Handle missing records and soft-deleted keys consistently.
- **Gate**: Every lookup requires a `SecurityResourceScope`; no unscoped lookup followed by an ownership check.

### 6. `11.3.6.6 — Persist key rotation`

- Implement rotation using `rotateKeyWithVersion`. Lock and validate the current key/version, update the previous version’s lifecycle state, create the next active version, and update `currentVersion` atomically.
  **Gate**: Concurrent or failed rotations cannot leave inconsistent version metadata.

### 7. `11.3.6.7 — Persist status changes`

- Persist allowed key-version status changes and lifecycle timestamps using the repository and Core contracts. Verify that rotation-specific state transitions cannot be bypassed.
- **Gate**: Status changes are consistent with the existing domain rules.

### 8. `11.3.6.8 — Add persistence integration tests`

- Test successful creation, rollback, scoped reads, missing records, rotation, status changes, and soft deletion. Use the existing test conventions and appropriate mocks or test database strategy.

- **Gate**: Tests verify actual integration behavior, not just isolated mock calls.

### 9. `11.3.6.9 — Verify security and regression behavior`

- Check tenant isolation, supported scopes, transaction rollback, audit metadata, soft-delete behavior, and absence of raw key material in persistence records and logs.

- **Gate**: No regression in existing Security Core behavior.

### 10. `11.3.6.10 — Final verification and sign-off`

- Run the relevant tests, full type-check, and production build. Perform manual verification only where required, and record the actual results.

- **Gate**: You confirm all required checks pass before we begin Phase 11.3.7.

**Important architectural constraints**

- No raw key material in MySQL. Store metadata, version state, and provider references only.
- Preserve dependency direction. Security Core must not import Security Product infrastructure.
- Enforce tenant scope in every database operation. Organization, project, application, and environment scopes must match the supported persistence model.
- Use atomic transactions for initial key creation and rotation.
- Avoid unrelated refactoring. Reuse the repositories, transaction adapter, models, and mappers already implemented.
- Do not run database schema scripts or alter database state without explicit approval.

**Start with 11.3.6.1**

- Run the following from your project root:

```js
  npx tsc --noEmit
  npm run build
```

- If both pass, reply with the results and we’ll begin 11.3.6.2 — inspect the existing key-management flow.
