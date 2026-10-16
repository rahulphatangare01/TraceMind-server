# Security Product Dependency Rules

## Purpose

These rules protect the Security Product module's boundaries and keep
Security Core reusable independently of Security Product and future IAM.

## Allowed dependency direction

- Domain defines business concepts and must remain independent of application
  services, infrastructure implementations, databases, and external products.
- Application coordinates use cases through contracts and domain types.
- Infrastructure implements application/domain contracts and may access
  database or provider-specific infrastructure.
- The composition root may assemble implementations behind their contracts.
- Security Product may use Security Core through its curated public API.
- Security Product may use tenant ownership through its established boundary.
- Future IAM integration must use the FutureIamAuthorizationPort contract.

## Forbidden dependencies

1. Security Product must not import concrete IAM implementations.
2. Security Product must not import Security Core internals directly.
   Imports from Security Core must use `security-core/public-api.ts`.
3. Domain and application code must not import database connection modules,
   MySQL repositories, or infrastructure implementations.
4. Security Core must not import Security Product.
5. Business logic must not access cryptographic provider internals directly
   when the Security Core public API provides the required operation.
6. Authorization, tenant ownership, and subscription entitlements remain
   separate decisions. One must not silently substitute for another.

## Composition and adapters

- Concrete infrastructure implementations are wired at the composition root.
- Interfaces and ports define cross-layer contracts.
- No silent fallback to another security provider is permitted.
- Existing tenant hierarchy constraints remain authoritative for persistence.
- Resource lookup and mutation must apply tenant scope at the persistence
  boundary; checking ownership only after an unscoped lookup is insufficient.

## Enforcement

Run the manual dependency check from the repository root:

`npx tsx src/modules/security-product/__tests__/security-product-dependency-rules.manual.ts`

This check covers detectable source-import violations. It does not replace
code review, type-checking, automated architecture tests, or security tests.

- Security Product application and domain code must consume Security Core
  through `security-core/public-api.ts`.
- The Security Product composition root may import the concrete Security
  Core container solely to wire dependencies. This is an explicit exception,
  not a pattern for application services or domain logic.
- Security Core must not depend on Security Product.
