## Phase 11.3.3 — Design Security Product Database Schemas

We will design the schema for persistent Security Key Metadata and Key Version Lifecycle Records.

### Step 1: Inspect the existing schema and approved requirements

Before writing SQL, we need to verify the exact column types, primary keys, composite foreign keys, and naming conventions in your current database. This avoids introducing incompatible relationships or duplicate constraints.
Run these commands from your TraceMind project root in Git Bash:

```js
cat src/modules/security-product/PERSISTENCE_REQUIREMENTS.md
```

```js
cat src/database/schemas/tenant/001_create_organizations.sql
cat src/database/schemas/tenant/002_create_projects.sql
cat src/database/schemas/tenant/003_create_applications.sql
cat src/database/schemas/tenant/004_create_environments.sql
```

Please share the outputs. These are read-only commands; they won't modify your database.

### Step 2: What we will design

- `security_keys`
  Persistent key metadata: purpose, scope, tenant ownership, provider, status, current version, timestamps, and soft deletion.

- `security_key_versions`
  Version history, provider key references, lifecycle status, activation and rotation timestamps, and unique version identity.

- `Tenant isolation and integrity`
  Enforce the existing Organization → Project → Application → Environment hierarchy, with database constraints wherever supported.

### Step 3: Acceptance gates

Once we verify the source schemas, we'll prepare the schema design and its focused spec/manual checks. The design must preserve key-version history, support soft deletion, prevent invalid tenant relationships, and `never persist raw cryptographic key material.`
We will not execute schema migrations against your database in this step. After the design passes review, we can proceed to Phase 11.3.4.
Please share the file outputs so we can design the schema against your actual codebase rather than assumptions.
