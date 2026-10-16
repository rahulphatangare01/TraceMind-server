# TraceMind — Phase 11.2.3

## Define Security Core Integration Boundary

**Plan:** B — Security Product  
**Phase:** 11 — Security Product Foundation  
**Step:** 11.2.3 — Define Security Core Integration Boundary  
**Source baseline:** `zip-9.zip`  
**Status:** Implementation artifacts prepared; pending execution in the user's working tree

---

## 1. Objective

Define a stable, curated contract through which Security Product consumes Security Core. Product application services must depend on public operation contracts, not concrete local providers or the full Security Core composition container.

This step introduces a narrow type-level integration boundary and a specification test. It does not implement product key-management workflows, database persistence, public REST APIs, or IAM.

## 2. Source findings

In the supplied archive:

- `SecurityService` is defined in `application/interfaces/security.service.interface.ts` and exposes encryption/decryption, hashing/verification, signing/verification, and HMAC creation/verification.
- Key lifecycle operations are exposed separately through `SecurityServiceKeyManagementApi`.
- `security-core.container.ts` exports a `securityCore` object that includes the facade, key-management API, validators, application services, and concrete provider instances.
- The existing root `index.ts` exports the container as well as provider-oriented contracts. Importing the full root barrel is therefore broader than the product integration needs.
- The existing key-management API class has no separate public service interface in the supplied archive.

## 3. Boundary decision

Introduce a dedicated `src/modules/security-core/public-api.ts` curated export surface and a Security Product port:

`src/modules/security-product/application/interfaces/security-core.port.ts`

The product port contains only:

- `operations: SecurityService`
- `keyManagement: SecurityKeyManagementService`

The port uses type-only imports from `security-core/public-api.ts`. It does not import provider classes or the full container. The existing `securityCore` composition object remains available for backward compatibility; this step does not remove or change its exports.

## 4. Files in this change

### New: `src/modules/security-core/public-api.ts`

Exports the stable service contracts, their request/result types, key-management request and model types, and the domain enums required by consumers. It intentionally does not export the container or concrete provider classes.

### New: `src/modules/security-core/application/interfaces/security-key-management.service.interface.ts`

Defines the key lifecycle contract currently implemented by `SecurityServiceKeyManagementApi`.

### Modified: `src/modules/security-core/application/services/security-service-key-management-api.service.ts`

Adds `implements SecurityKeyManagementService`. Method behavior is unchanged; the compiler checks that the existing implementation conforms to the new contract.

### New: `src/modules/security-product/application/interfaces/security-core.port.ts`

Defines the only Security Core dependency that Security Product application services should require.

### New: `src/modules/security-product/__tests__/security-core.port.spec.ts`

Verifies the product port can be composed from the existing Security Core facade and key-management API, exposes the expected operations, and does not include provider objects.

## 5. Composition rule

The composition root—not product business services—wires concrete implementations into the port. The intended wiring shape is:

```ts
const securityCorePort: SecurityCorePort = {
  operations: securityCore.securityService,
  keyManagement: securityCore.securityServiceKeyManagementApi,
};
```

This is an illustration of the composition boundary, not a request to add a new container in this substep. If/when wiring is added to the product container, keep the import of `security-core.container.js` in the composition root only. Product application services should receive `SecurityCorePort` through dependency injection.

## 6. Dependency rules

1. Security Product application services may import `SecurityCorePort`.
2. `SecurityCorePort` imports only types from `security-core/public-api.ts`.
3. Security Product business services must not import `LocalCryptoProvider`, `LocalKeyProvider`, `LocalKeyMaterialProvider`, or other concrete provider implementations.
4. Security Product must not reach into `securityCore` container properties directly.
5. Security Core must not import Security Product.
6. Key management remains a distinct contract from cryptographic operations.
7. This port is not an authorization mechanism. A valid security context or tenant identifier does not prove the actor is authorized.
8. No database persistence, product API, IAM implementation, or dashboard is added in this step.
9. The existing root `security-core/index.ts` is not removed or narrowed here, avoiding an unreviewed breaking change for existing consumers.
10. Raw key material must not cross the product boundary or be returned by product APIs.

## 7. Acceptance criteria

- [ ] A curated Security Core public API exists without exporting the composition container or concrete providers.
- [ ] `SecurityService` is available from the curated public API.
- [ ] Key lifecycle operations have their own public interface.
- [ ] The existing key-management implementation explicitly implements that interface.
- [ ] Security Product has a narrow `SecurityCorePort` using type-only imports.
- [ ] Product port tests cover required operations and absence of provider internals.
- [ ] Existing Security Core behavior and root exports remain unchanged.
- [ ] Relevant automated tests, manual checks, type-check, and build pass in the actual working tree.

## 8. Automated specification test

Run the focused spec:

```powershell
npx vitest run src/modules/security-product/__tests__/security-core.port.spec.ts
```

Then run the existing regression and quality gates:

```powershell
npm run test:security
npm run test:security:manual
npm run type-check
npm run build
```

Do not mark the step complete until the commands have been run against the actual working tree and results recorded. If `npx vitest` cannot resolve the project config or dependencies, report the exact output before changing scripts or configuration.

## 9. Manual verification

1. Open `src/modules/security-core/public-api.ts`; confirm it does not export `securityCore`, `LocalCryptoProvider`, or concrete provider classes.
2. Open `src/modules/security-product/application/interfaces/security-core.port.ts`; confirm it imports types only from `security-core/public-api.js`.
3. Search Security Product source for imports from `security-core/providers/` or `security-core/security-core.container.js`. Only the composition root/test may import the container; product application code must not.
4. Confirm `SecurityServiceKeyManagementApi` implements `SecurityKeyManagementService` without changing method behavior.
5. Confirm `src/modules/security-core/index.ts` remains unchanged by this step.
6. Confirm no SQL schema, repository, route, controller, IAM service, or dashboard was added.
7. Review test output, type-check, and build output.

## 10. Known limitation and next step

This step defines the integration contract; it does not yet instantiate a Security Product service or container. Product service boundaries are addressed in 11.2.6. Automated architectural import-rule enforcement is scheduled for 11.2.10–11.2.11.

**Next substep after verification and approval:** 11.2.4 — Define Tenant Resource Ownership Boundary.
