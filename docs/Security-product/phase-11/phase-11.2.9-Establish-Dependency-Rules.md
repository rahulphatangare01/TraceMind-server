## Phase 11.2.9 — Establish Dependency Rules.

This step establishes enforceable dependency rules for Security Product so that future features cannot accidentally couple the module to IAM, internal cryptographic providers, or database implementations from the wrong architectural layer.

### 11.2.9.1 — Rules we will enforce

| Area                             | Rule                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Security Product → Security Core | Import through `security-core/public-api.ts` only.                                 |
| Security Product → IAM           | No implementation dependency on `src/modules/iam/`.                                |
| Domain and application layers    | Must not depend on infrastructure or database implementation details.              |
| Infrastructure layer             | May implement application/domain contracts and access persistence infrastructure.  |
| Tenant ownership                 | Use the established ownership boundary; do not replace it with IAM authorization.  |
| Future IAM                       | Depend on the contract defined in Phase 11.2.8, not a concrete IAM implementation. |
| Dependency direction             | Security Core must not depend on Security Product.                                 |
| Existing modules                 | Preserve current public contracts and avoid unrelated refactoring.                 |

We’ll add a documented rule set and a manual architecture check. The broader automated boundary-test suite remains part of Phase 11.2.11.

- File 1 — `src/modules/security-product/DEPENDENCY_RULES.md`
- File 2 — `src/modules/security-product/__tests__/security-product-dependency-rules.manual.ts`

This check scans production source files under Security Product and reports detectable forbidden imports. It excludes tests and manual-check files from its source scan.

**Add one final check to the manual script**
The rule set also states that Security Core must not import Security Product. To make the manual check cover that rule, add the following immediately after the securityProductRoot declaration:

### 11.2.9.2 — Verification

From the project root, run:

```js
npx tsx src/modules/security-product/__tests__/security-product-dependency-rules.manual.ts
npm run test:security
npm run test:security:manual
npm run type-check
npm run build
```

- The dependency checker should report zero violations. If it reports any existing imports, do not bypass the check or refactor unrelated code immediately. Review each reported import against the established contracts first.

### Acceptance checklist

```js
- [ ] DEPENDENCY_RULES.md added.
- [ ] Manual dependency checker added.
- [ ] Security Product does not import concrete IAM implementations.
- [ ] Security Product imports Security Core through its public API only.
- [ ] Domain/application layers do not import infrastructure or database implementations.
- [ ] Security Core does not depend on Security Product.
- [ ] Security tests, manual checks, type-check and build pass.
```
