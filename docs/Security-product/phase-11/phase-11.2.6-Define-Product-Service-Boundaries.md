## Phase 11.2.6 — Define Product Service Boundaries

- Great. We’ll keep this phase within the existing TraceMind Security Product architecture and provide actual file-wise code, automated spec tests, and a runnable manual test.

### 1. What we are implementing

The goal is to establish a clear composition boundary between the product's application services, Security Core, tenant ownership validation, and common infrastructure.

```js
                                                                        Security Product service boundary
                                                                        Typed service composition contract
                                                                                        |
                                                           Security Core                                   Tenant ownership
                                                 Crypto and key-management contracts                    Resource ownership resolution
                                                            |                                                       |
                                                        Common infrastructure                               Product services
                                                    Logging, request context, IDs                 Separate contracts and dependencies
```

**Rules for this phase**

- Product services depend on interfaces, not concrete provider implementations.
- Security Core remains responsible for cryptographic operations.
- Tenant ownership validation remains separate from actor authorization.
- Common infrastructure is injected through its defined port.
- We will not implement persistence, configuration CRUD, secret storage, or IAM authorization prematurely.
- No database initialization or environment loading is added to these service-boundary tests.

### 2. File 1 — Define the service-boundary contract

- Why use Pick here? The product needs the `resolve` capability. It does not need to depend on the concrete ownership service's constructor or implementation details.

### 3. File 2 — Add the composition factory

- This factory establishes a stable composition point without changing the existing securityProduct container or inventing concrete logging and request-context adapters that have not yet been wired.

### 4. File 3 — Automated spec tests

- These are composition-boundary tests. They do not pretend to verify encryption, database persistence, or tenant ownership itself; those behaviors remain covered by their respective service tests.

### 5. File 4 — Runnable manual test

- The manual test uses controlled adapters and performs no database access. It verifies the actual composition factory and the shape of its result.

### 6. File 5 — Export the service-boundary contracts

- No change to security-product.container.ts is required for this step. We are defining and testing the service-composition contract first; actual concrete infrastructure adapters can be wired when their implementations are verified.

### 7. Run the verification gates

Run each command from your TraceMind project directory:

**Automated spec tests**

```js
npx vitest run src/modules/security-product/__tests__/security-product-services.spec.ts
```

**Manual tests**

```js
npm run test:security:manual
```

The existing manual-test runner should discover the new `.manual.ts` file because Phase 11.2.5 expanded discovery to Security Product.

**Type-check**

```js
npm run type-check
```

**Production build**

```js
npm run build
```

### 8. Acceptance criteria

```js
- [ ] Service boundaries are defined through explicit TypeScript contracts.
- [ ] Composition preserves the injected dependencies.
- [ ] No provider internals are exposed through the product service catalog.
- [ ] Automated spec tests pass.
- [ ] Manual tests pass.
- [ ] Type-check and build pas
```
