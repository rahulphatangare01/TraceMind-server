## Phase 11.2.5 — Define Common Infrastructure Integration

### Objective

Define how Security Product consumes TraceMind's shared infrastructure without coupling product services directly to framework or infrastructure implementations.

**In scope**

- Logging contract
- Request and trace context access
- Shared identifier generation
- Automated contract tests
- Runnable manual verification

**Boundaries to preserve**

- No database connection or environment initialization in the new port.
- No direct Express dependency in Security Product application services.
- No IAM authorization or authentication logic.
- No changes to Security Core cryptographic contracts.

The available `zip-9.zip` baseline contains the shared ID-generation utilities and request-context middleware, but it does not show a concrete logger implementation. Therefore, the implementation below establishes an explicit adapter boundary rather than guessing a logger API or wiring an unverified implementation. Your current working tree remains authoritative.

### Step 1 — Add the common infrastructure contracts

his contract intentionally exposes only the infrastructure capabilities Security Product needs. It does not expose Express Request, a database pool, or provider internals.

### Step 2 — Add a composition factory

This factory makes the integration boundary independently testable. Concrete infrastructure implementations will be supplied through adapters instead of being initialized inside the product.

**Design rule**: the factory composes supplied dependencies; it must not create database pools, read environment variables, or initialize external infrastructure.

### Step 3 — Add automated spec tests

- These tests verify dependency composition, request-context access, identifier delegation, and logging access without importing the database or application container.

### Step 4 — Add the manual test file

- This is a standalone manual test, not a Vitest spec. It uses real assertions against test adapters and exits with an error if an expectation fails.

These tests validate the port and its composition, not whether TraceMind's concrete logger or request-context implementation works. We will verify those concrete adapters when wiring them to their actual interfaces.

### Step 5 — Export the new boundary

- Append these lines without removing the Phase 11.2.3 or 11.2.4 exports:

### Step 6 — Update the manual-test runner

- This preserves the existing npm run test:security:manual command while expanding its discovery scope. The new manual test does not need to be imported into the runner individually.

### Step 7 — Add manual verification for Phase 11.2.4 too

- This test assumes the Phase 11.2.4 service and error contracts match the code already applied in your working tree. If TypeScript reports a signature mismatch, share the exact diagnostic before changing the implementation.

### Acceptance criteria

- Both Phase 11.2.4 and Phase 11.2.5 have spec and manual test files.
- npm run test:security:manual discovers tests under both Security Core and Security Product.
- Tests do not require a live database connection.
- Type-check and build pass.
- No existing Security Core contract is changed.
