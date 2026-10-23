## Phase 11.3.4 — Step 1: Inspect existing contracts

Before creating new models, let's inspect the current source so the implementation matches your actual types and avoids duplicate interfaces.
Run these commands from your TraceMind project root in Git Bash.

### 1. Find existing key models, interfaces, and related files

`find src/modules/security-core src/modules/security-product -type f | sort`

### 2. Find the relevant TypeScript declarations

```js
   grep -R -n -E \
    'interface SecurityKey|type SecurityKey|interface SecurityKeyVersion|type SecurityKeyVersion|SecurityResourceScope|SecurityProductPersistencePort|CreateKeyRequest|KeyStatus' \
    src/modules/security-core src/modules/security-product \
    --include='\*.ts'
```

### 3. Review the approved schema design

```js
   cat src/modules/security-product/SECURITY_PRODUCT_SCHEMA_DESIGN.md
```

What we'll implement after reviewing the output

- **Persistence record models**
- Define database-oriented TypeScript records for key metadata and key-version metadata, including database column naming and nullable fields.

- **Domain-to-persistence mapping**
- Define how existing domain objects map to persistence records without leaking database details into Security Core.

**Validation and tests**

- Cover required fields, tenant scope, timestamps, nullable tenant identifiers, and mapping compatibility.

We'll keep this step limited to persistence models and mappings—**no SQL migrations, repository implementation, or changes to the database** yet.
Please share the command outputs. I'll use them to propose the smallest set of actual code changes for Phase 11.3.4.

Run these commands from your TraceMind project root in Git Bash.

### 1. Security key domain models

```js
cat src/modules/security-core/domain/models/security-key.ts
cat src/modules/security-core/domain/models/security-key-version.ts
```

### 2. Key purpose, status, and scope enums

```js
cat src/modules/security-core/domain/enums/key-purpose.enum.ts
cat src/modules/security-core/domain/enums/key-status.enum.ts
cat src/modules/security-core/domain/enums/security-scope.enum.ts
```

### 3. Existing key creation and management contracts

```js
cat src/modules/security-core/application/interfaces/key.provider.interface.ts
cat src/modules/security-core/application/interfaces/security-key-management.service.interface.ts
```

### 4. Security Product persistence and scope contracts

```js
cat src/modules/security-product/application/interfaces/security-product-persistence.port.ts
cat src/modules/security-product/application/interfaces/security-resource-scope.port.ts
```

**What happens next**

- After reviewing these definitions, I'll provide the actual code for the smallest necessary set of files:

1. Persistence record types for security keys and key versions.
2. Domain-to-persistence mapping functions, if the existing contracts require them.
3. Focused automated specification tests.
4. Manual verification checks.

### 1. Confirmed Model Boundaries

| Model                            | Persistence Considerations                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `SecurityKey`                    | Stores key metadata, tenant hierarchy, provider, status, current version, and timestamps. |
| `SecurityKeyVersion`             | Stores version metadata and lifecycle timestamps, including `providerKeyReference`.       |
| `SecurityResourceScope`          | Restricts persistence to organization, project, application, or environment scopes.       |
| `SecurityProductPersistencePort` | Requires tenant-scoped reads, creates, updates, and soft deletes.                         |

- Important: `SecurityKey` tenant IDs are optional in the Core model, but the Security Product persistence scope requires the IDs appropriate to each tenant level. The persistence adapter must validate that relationship rather than silently filling in missing IDs.

### 2. Next: verify the existing export and test conventions

Before creating files, run these commands from the TraceMind project root in Git Bash. This checks whether persistence models or related exports already exist, avoiding duplicate definitions.

```js
find src/modules/security-product -type f | sort

cat src/modules/security-core/domain/models/index.ts
cat src/modules/security-core/domain/enums/index.ts
cat src/modules/security-core/public-api.ts

cat src/modules/security-product/index.ts
cat src/modules/security-product/application/index.ts
cat src/modules/security-product/domain/index.ts

find src/modules/security-product -path '*__tests__*' -type f | sort

```

### Will Phase 11.3.4 be complete after this?

`Not yet`. This command only verifies the current structure. We still need to implement and validate the resource persistence models.
The remaining Phase 11.3.4 work is:

`1. Define persistence models`

- Create persistence-specific types for key metadata and key-version records, retaining the existing Security Core domain contracts.

`2. Define mapping and validation rules`

- Handle tenant scope, optional identifiers, timestamps, lifecycle fields, and database-compatible representations.

`3. Add automated and manual tests`

- Verify model mappings, scope consistency, and lifecycle metadata without changing Security Core behavior.

`4. Verify the phase gates`

- Run the focused specification tests, manual verification, type-check, and build. Review any failures before making further changes.

After you confirm these checks pass, we can mark Phase 11.3.4 complete and proceed to Phase 11.3.5 — Implement MySQL Repository Interfaces and Adapters.
