## Phase 11.2.7 — Define Repository and Persistence Boundary

- We’ll establish the boundary between the Security Product’s application services and its persistence layer, using the existing TraceMind tenant repository conventions as the reference.
- The existing tenant module already separates repository interfaces from MySQL implementations and uses tenant-scoped lookups for projects, applications, and environments. We should `reuse that pattern rather than create a second tenant hierarchy or duplicate its repositories`.

**Scope of this phase**

- Define tenant-scoped repository contracts for Security Product resources.
- Define a persistence port that application services can depend on.
- Specify how missing records and tenant scope are represented at the interface.
- Add automated spec tests and a manual verification test.
- Keep MySQL implementation, SQL schemas, migrations, and transaction implementation for the appropriate persistence phase.

### 1. File — Define tenant-scoped resource scope types

- Create:
  `src/modules/security-product/application/interfaces/security-resource-scope.port.ts`

**Boundary rule**: a repository must receive the full scope required to identify the resource. It must not accept a project ID, application ID, or environment ID alone as sufficient tenant context.
This type defines the persistence contract; the existing tenant ownership service remains responsible for resolving and validating the hierarchy.

### 2. File — Define the repository and persistence contract

- Create:
  `src/modules/security-product/application/interfaces/security-product-persistence.port.ts`

**Important design choices**

- **No raw key material or plaintext secrets**: this contract is for product resource metadata and lifecycle persistence, not storage of cryptographic key bytes or plaintext secret values.
- **No MySQL types in application contracts**: MySQL-specific SQL, connections, and row mapping belong in infrastructure implementations.
- **No unscoped lookup methods**: findById(resourceId) without scope is deliberately not part of this contract.
- **No transaction implementation yet**: transaction handling, concurrency, migrations, and database constraints will be specified when we implement persistence, rather than inventing a transaction abstraction without a verified implementation.

### 3. File — Automated repository contract spec

- Create:
  `src/modules/security-product/__tests__/security-product-persistence.port.spec.ts`

- Test-scope note: this suite verifies the interface's intended contract with a controlled test double. It does not claim to test a MySQL repository implementation, which is deliberately outside this phase.

### 4. File — Manual persistence-boundary test

- Create:
  `src/modules/security-product/__tests__/security-product-persistence.port.manual.ts`

- This manual test uses an in-memory test adapter to verify the contract without touching your MySQL database.

### 5. Export the new interfaces

- Open:
  `src/modules/security-product/index.ts`

- Append these exports and preserve existing exports from earlier phases:

### 6. Verification commands

- Run these from `D:\Rahul\Rahul\v2\TraceMind.`

**1. Automated spec**

```js
npx vitest run src/modules/security-product/**tests**/security-product-persistence.port.spec.ts
```

**2. Manual boundary test**

```js
npx tsx src/modules/security-product/**tests**/security-product-persistence.port.manual.ts
```

**3. Existing manual test suite**

```js
   npm run test:security:manual
```

**4. Type-check**

```js
npm run type-check
```

**5. Build**

```js
npm run build
```

### 7. Acceptance checklist

```js
[ ] Repository contracts require tenant scope for all resource operations
[ ] Cross-scope lookup and missing-resource behavior are covered by spec tests
[ ] Soft-delete contract does not expose a physical-delete operation
[ ] No database-specific implementation leaks into application interfaces
[ ] Automated spec and manual tests pass
[ ] Type-check and build pass
```
