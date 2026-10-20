## Phase 11.3.5 — Implement MySQL Repository Interfaces and Adapters.

**Phase 11.3.5 roadmap**

`11.3.5.1 — Review existing repository conventions`

- Inspect tenant repository interfaces, MySQL implementations, database exports, and test conventions.
  `Ready to begin`

`11.3.5.2 — Define security repository interfaces`

- Establish key metadata and key-version repository contracts, preserving database independence at the application boundary.

`11.3.5.3 — Implement MySQL row mapping`

- Convert database rows into the persistence records introduced in Phase 11.3.4.

`11.3.5.4 — Implement key metadata repository`

- Add parameterized, tenant-scoped database operations and soft-delete handling.

`11.3.5.5 — Implement key-version repository`

- Persist version metadata and preserve historical version records.

`11.3.5.6 — Add repository tests and verification`

- Test scoped lookups, mapping, soft deletes, and error handling before integrating services.

**Start with Step 11.3.5.1**
We need to inspect the current working tree before writing repository code. From the TraceMind project root in Git Bash, run:

```js
cat src/modules/tenants/repositories/interfaces/organization.repository.interface.ts

find src/modules/tenants/repositories -type f | sort

find src/modules/tenants/repositories/mysql -type f -name '\*.ts' -exec sh -c '
for file do
echo ""
echo "========== $file =========="
    sed -n "1,240p" "$file"
done
' sh {} +

cat src/database/connection.ts
cat src/database/index.ts

cat src/modules/security-product/domain/models/security-key-persistence.model.ts
cat src/modules/security-product/domain/models/security-key-version-persistence.model.ts
cat src/modules/security-product/application/interfaces/security-product-persistence.port.ts
cat src/modules/security-product/application/interfaces/security-resource-scope.port.ts
```

Share the output, including any missing-file errors. We will use the actual repository signatures and database conventions to implement the smallest correct change.
**Scope boundary**: this phase implements repository interfaces and MySQL adapters. We will not yet wire them into key lifecycle services or run schema migrations. Those changes must wait until the repository behavior and database schema are verified.
