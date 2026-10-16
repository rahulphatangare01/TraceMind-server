## Phase 11.2 — Security Product Module Boundaries

- **Objective**

Define a clean, maintainable boundary between the existing Security Core engine and the new Security Product layer while reusing TraceMind's existing tenant hierarchy, common utilities, and database foundations.

Important: This step is architecture and contract design first. We will inspect the exact source files, define acceptance criteria, and add specification tests before implementing anything. We will not jump ahead to Phase 12 persistence or Phase 16 APIs.

**Steps for 11.2**

```js
11.2.1 Review Existing Module Boundaries

- Inspect actual exports, imports, container wiring, and dependencies in Security Core, tenants, common, and database modules.

11.2.2 Define Security Product Responsibilities

- Identify product-level capabilities and explicitly exclude cryptographic implementation, future IAM, and commercial billing logic.

11.2.3 Define Security Core Integration Boundary

- Use existing public contracts for crypto and key-management operations; do not access provider internals directly.

11.2.4 Define Tenant Resource Ownership Boundary

- Reuse Organization → Project → Application → Environment relationships and existing validation conventions.

11.2.5 Define Common Infrastructure Integration

- Determine how request context, errors, validation, logging, and correlation identifiers should be reused.

11.2.6 Define Product Service Boundaries

- Separate product orchestration from Security Core operations, tenant services, persistence, and future API controllers.

11.2.7 Define Repository and Persistence Boundary

- Specify the `interface` boundary without implementing database persistence ahead of Phase 12.

11.2.8 Define Future IAM Integration Boundary

- Document authentication and authorization integration points without building the IAM product.

11.2.9 Establish Dependency Rules

- Prevent circular dependencies, provider leakage, duplicated tenant logic, and direct database access from domain services.

11.2.10 Create Architecture Specifications

- Write verifiable rules for allowed imports, public interfaces, and prohibited dependencies.

11.2.11 Add Automated Boundary Tests

- Test the agreed architecture rules and verify that existing Security Core behavior remains unchanged.

11.2.12 Perform Manual Architecture Verification

- Inspect `module`  `exports`, `imports`, `dependency direction`, and `integration boundaries` against the specification.

11.2.13 Final Verification and Sign-off

- Run the relevant tests, manual checks, type-check, and build; review changes before closing the step.

```

### Rules we must preserve

- `Security Core`: Cryptographic operations and reusable security primitives.
- `Security Product`: Product-level orchestration, resource management, and the services that will expose security capabilities to customers.
- `Tenants`: The existing hierarchy and ownership relationships; do not create a parallel tenant system.
- `Common`: Reuse existing infrastructure where appropriate instead of duplicating it.
- `IAM`: Deferred; define only the necessary integration boundaries.
- `Persistence`: Designed in Phase 12, not implemented prematurely in Phase 11.2.

**Starting point: 11.2.1**

Our first action is to inspect the current source of truth for these areas:

- `src/modules/security-core/`
- `src/modules/tenants/`
- `src/common/`
- `src/database/`
- `src/app.ts`
- `src/routes/index.ts`

We will identify actual exports and dependency relationships before deciding where the Security Product module belongs.
**Next gate**: Complete 11.2.1, document the findings and acceptance criteria, and then move to the next substep only after you review and confirm.
