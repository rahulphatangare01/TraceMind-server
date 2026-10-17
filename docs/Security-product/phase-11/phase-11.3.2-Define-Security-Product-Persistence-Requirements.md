## Phase 11.3.2 — Define Security Product Persistence Requirements

For this phase, we'll define exactly what Security Product must persist, which tenant scope owns each record, how key versions behave, and what the persistence implementation must guarantee.
The goal is to establish a requirements contract before creating database tables or modifying Security Core.
Based on the source code reviewed in Phase 11.3.1, the first priority is durable security-key metadata and key-version lifecycle records. Your existing `LocalKeyProvider` stores these records in memory, and your Security Product already exposes a tenant-scoped persistence contract. We should build on those contracts rather than introduce a parallel architecture.

### 1. Deliverables for Phase 11.3.2

```js
File 1 — Persistence requirements
    `src/modules/security-product/PERSISTENCE_REQUIREMENTS.md`
Defines the persistence scope, required fields, tenant isolation, key lifecycle, data protection, and acceptance criteria.

File 2 — Specification test
    `src/modules/security-product/**tests**/security-product-persistence-requirements.spec.ts`
Uses Vitest to verify that the requirements document includes the mandatory architecture and security decisions.

File 3 — Manual verification
    `src/modules/security-product/**tests**/security-product-persistence-requirements.manual.ts`
Performs a separate manual check of the documented requirements and critical persistence restrictions.
```

**Scope boundary**: This phase defines requirements only. It does not create SQL tables, MySQL repository implementations, or a new key provider. Those decisions follow after these requirements have been reviewed.

### 2. File 1 — `PERSISTENCE_REQUIREMENTS.md`

Create the file at `src/modules/security-product/PERSISTENCE_REQUIREMENTS.md` with the following complete content.

### 3. File 2 — Specification test

Create `src/modules/security-product/**tests**/security-product-persistence-requirements.spec.ts.`
This test validates the requirements document, not a database implementation. That distinction is important: we should not pretend that persistence works merely because its requirements are documented.

**What this spec test verifies**

- Required requirements sections exist.
- Tenant scope restrictions are explicit.
- Key lifecycle and security requirements are recorded.
- Raw key material is prohibited from this metadata persistence layer.
- Implementation tasks remain deferred to later phases.
  It does not test SQL execution, tenant isolation at runtime, or key rotation transactions. Those require implementation and integration tests in later phases.

### 4. File 3 — Manual verification

Create `src/modules/security-product/**tests**/security-product-persistence-requirements.manual.ts.`

### 5. Run the verification commands

After creating the three files, run these commands from the project root in Bash.
First, run the focused specification test:

```js
npx vitest run src/modules/security-product/__tests__/security-product-persistence-requirements.spec.ts
```

Next, run the manual verification independently:

```js
npx tsx src/modules/security-product/__tests__/security-product-persistence-requirements.manual.ts
```

Then run type-checking and the production build:

```js
npm run type-check
npm run build
```

These commands have different purposes. The specification and manual tests check the requirements document; type-checking and the build check project compatibility. None of these alone proves that a future MySQL implementation is secure or correct.

### 6. Completion checklist

```js
Phase 11.3.2 verification

[ ] Created PERSISTENCE_REQUIREMENTS.md
[ ] Created the Vitest specification file
[ ] Created the manual verification file
[ ] Focused specification test passed
[ ] Manual verification passed
[ ] Type-check passed
[ ] Production build passed
[ ] Reviewed and approved the persistence requirements
```
