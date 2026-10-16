## Phase 11.2.11 — Add Automated Boundary Tests.

We’ll automate the dependency rules from Phase 11.2.9 and verify that the architecture documentation is present. These tests should run through Vitest and fail when a forbidden dependency is introduced.

### File 1

`src/modules/security-product/**tests**/security-product.architecture-boundary.spec.ts`

- Create this file:

Small correction before running the test: use the standard path-containment check below. It is more reliable across Windows and Unix paths.
In the test file, add `isAbsolute` to the `node:path` import:

### 11.2.11.2 — Run verification

From `D:\Rahul\Rahul\v2\TraceMind`, run:

```js
npx vitest run src/modules/security-product/__tests__/security-product.architecture-boundary.spec.ts
npm run test:security
npm run test:security:manual
npm run type-check
npm run build
```

The new Vitest suite should report 5 passing tests.

### Acceptance checklist

```js
[ ] Automated tests detect direct IAM implementation imports.
[ ] Security Product uses only the Security Core public API.
[ ] Domain/application layers avoid infrastructure implementation dependencies.
[ ] Security Core remains independent of Security Product.
[ ] Architecture and dependency documentation exist.
[ ] Existing security tests, manual checks, type-check and build pass.
```

The import checks cover detectable static imports with string-literal module paths; they are not a complete security audit or a guarantee against dynamically constructed imports.
