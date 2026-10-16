## Phase 11.3 — Proposed subphase breakdown

Based on the work completed in Phase 11.2, I recommend the following next phase.

```js
Phase 11.3 — Security Product Persistence Foundation
Objective: prepare the Security Product to persist security resources and key metadata safely, using the existing tenant hierarchy and Security Core contracts.

11.3.1 Review Existing Database and Persistence Infrastructure

- Inspect database connection, SQL schemas, repository patterns, tenant constraints, and existing Security Core key storage.

11.3.2 Define Security Product Persistence Requirements

- Identify which security resources and metadata need persistence, their lifecycle, and their tenant scope.

11.3.3 Design Security Product Database Schemas

- Define tables, relationships, unique constraints, indexes, and tenant-isolation constraints.

11.3.4 Define Security Resource Persistence Models

- Establish TypeScript models and validation schemas consistent with the database design.

11.3.5 Implement MySQL Repository Interfaces and Adapters

- Implement scoped persistence operations, including reads, creation, updates, and soft deletion.

11.3.6 Persist Security Key Metadata and Versions

- Define how key records, versions, statuses, and provider references are stored without persisting raw key material in MySQL.

11.3.7 Add Tenant-Isolation and Persistence Tests

- Test cross-tenant access prevention, scope validation, lifecycle behavior, and database constraints.

11.3.8 Integrate Persistence with Security Product Services

- Connect the repository layer to product services through the previously established contracts.

11.3.9 Run Regression Tests and Manual Verification

- Verify specifications, manual tests, type-checking, and production build.

11.3.10 Final Review and Sign-off

- Review architecture, tenant isolation, persistence behavior, documentation, and phase closure criteria.

```

**Working rules for Phase 11.3**
We will continue with your existing workflow:

1. Work on one subphase at a time.
2. Inspect the actual source files and existing interfaces before writing code.
3. Implement the smallest required change, file by file, directly in chat.
4. Add or update automated tests.
5. You run manual verification, specification tests, type-checking, and build.
6. We proceed only after you confirm the current subphase passes.

**Important**: This is a proposed breakdown, not a verified copy of your original roadmap. Before we start implementation, we should confirm that Phase 11.3's intended objective is indeed the Security Product Persistence Foundation. If that matches your plan, we can begin with 11.3.1 — Review Existing Database and Persistence Infrastructure.
