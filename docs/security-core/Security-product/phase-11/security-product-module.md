# Security Product Module

## Purpose

Security Product is the TraceMind product layer for managing customer-facing security resources and coordinating the existing Security Core. It is not a cryptography implementation and is not the IAM product.

## Responsibilities

- Coordinate product-level key resource and key-version workflows.
- Manage security configuration resources and resolution.
- Manage secrets and credential resource lifecycle.
- Define safe product-facing contracts and lifecycle validation.
- Define tenant-scoped resource ownership requirements.
- Define security audit requirements and integrate with the platform's audit/monitoring capability when available.
- Expose product APIs in the planned API phase and support the dashboard in the planned UI phase.

## Delegated responsibilities

- Cryptographic primitives and provider internals belong to `src/modules/security-core/`.
- Organization/project/application/environment hierarchy belongs to `src/modules/tenants/`.
- Shared errors, request context and utilities belong to `src/common/`.
- Security Product persistence schemas and MySQL adapters are Phase 12 work.
- Public REST APIs are Phase 16 work.
- Authentication/authorization integration is Phase 17 work; the standalone IAM product remains deferred.
- Audit implementation is Phase 18 work.
- Dashboard is Phase 19 work.
- Production KMS readiness is Phase 20 work.

## Non-negotiable rules

- Do not implement crypto primitives here.
- Do not import concrete local Security Core provider classes into product business services.
- Do not create a second tenant hierarchy.
- Do not treat caller-supplied tenant IDs or a `SecurityContext` as proof of authorization.
- Do not store raw key material in ordinary MySQL tables.
- Do not log plaintext secrets or raw key material.
- Do not couple product domain/application services directly to MySQL.
- Do not add IAM, billing, or entitlement policy to Security Core.
- Do not create placeholder TypeScript files without a defined contract and tests.

## Current status

This README records the agreed responsibility target. It does not mean the Security Product services, repositories, APIs, or dashboard are implemented.
See `docs/security-product/phase-11/11.2.2-security-product-responsibilities.md` for the full responsibility matrix, dependency rules, acceptance criteria, and manual verification checklist.
