## Phase 11.2.4: Define Tenant Resource Ownership Boundary

We will now implement the actual Security Product code, file by file, using the tenant APIs from your `zip-9.zip` baseline.
The objective is to ensure that every tenant-scoped security operation resolves its resource against TraceMind's existing hierarchy:
`Organization → Project → Application → Environment`
This implementation will reuse the existing tenant services and Security Core validators. It will not create a second tenant system, modify tenant database schemas, or implement IAM.

### 1. What we are implementing

```js
                                        Security Product
                                    Receives a security context
                                             |
                                 Security Core context validation
                        Validate scope, required identifiers and hierarchy rules
                                             |
                                  Tenant Resource Ownership Service
                             Resolve each resource using its parent identifiers
                                             |
        Existing tenant services                                Ownership verification
        Scoped resource lookups                                 Parent-child consistency
```

The distinction is important: `validating ownership is not the same as authorizing a user`. This phase verifies that the requested tenant resources exist and belong to the specified hierarchy. Actor authentication and permissions remain part of the planned Phase 17 integration.

### 2. File 1 — Define the tenant lookup contract

- Why this contract exists: Security Product depends on a narrow lookup interface, not on MySQL repositories or database connections. The composition root will adapt the existing tenant services to this contract.

### 3. File 2 — Define the Security Core validation boundary

- Security Product needs two distinct validation operations:

1. Validate an untrusted input as a `SecurityContext`.
2. Apply the existing `SecurityBoundaryValidator` rules and receive its normalized context.

- This interface keeps product logic independent of the concrete validator classes.

- The adapter will use `securityCore.securityContextValidator` and `securityCore.securityBoundaryValidator` from your existing Core container. We do not need to implement duplicate scope validation in Security Product.

### 4. File 3 — Define ownership errors

- We need stable internal error codes for missing resources, invalid scope, and inconsistent parent-child relationships.
- These errors are internal application errors for this stage. Mapping them to public HTTP responses belongs to the later Security APIs phase.

### 5. File 4 — Implement the ownership service

- This is the core implementation for Phase 11.2.4.
  It uses the actual `SecurityScope` values from Security Core and the existing tenant lookup contract.

Why the service verifies the hierarchy at every level
For an environment-scoped operation, the service checks:

1. The organization exists.
2. The project belongs to that organization.
3. The application belongs to that organization and project.
4. The environment belongs to that organization, project, and application.

The existing MySQL repositories already include parent identifiers in their scoped lookups and filter out soft-deleted records. This service adds an application-level consistency check rather than replacing those protections.
**Scope limitation**: This service checks ownership and existence only. It does not reject a suspended organization or inactive environment based on status; lifecycle eligibility must be enforced by the appropriate product workflow.

### 6. File 5 — Wire the existing tenant services into Security Product

Dependency rules after this change

- Only the composition root imports the concrete Security Core container.
- Only the composition root connects Security Product to the existing tenant service instances.
- The ownership service receives interfaces, not MySQL repositories.
- The tenant module does not import Security Product.
- No new database connection, tenant repository, or duplicate hierarchy is created.

### 7. File 6 — Export the new Security Product contracts

- This exposes the product's intended integration contracts without exporting the internal tenant repository implementations.

### 8. File 7 — Add specification and negative tests

- The test uses the existing Security Core validators and fake tenant lookups. It does not require a database connection.

- **Test note**: This suite uses deliberately minimal tenant fixtures because it tests the ownership service's behavior, not the tenant Zod model schemas. The production tenant services and repositories remain responsible for validating and returning complete tenant models.

### 9. Update the existing Phase 11.2.3 test

- The product container now exports tenantResourceOwnership in addition to securityCore. Therefore, update the existing assertion in:
- Keep the other assertions checking that `securityProduct.securityCore` does not expose concrete provider instances.
  Correction to the ownership mismatch test

In File 8, the mismatch test should invoke `service.resolve()` only once; otherwise, the one-time mock is consumed by the first assertion. Replace that test with this version:

### Phase 11.2.4 — Completion criteria

This stage is complete when the ownership service, composition wiring, tests, and exports are in place; valid tenant hierarchies resolve correctly; invalid or mismatched hierarchies are rejected; and all verification gates pass.
