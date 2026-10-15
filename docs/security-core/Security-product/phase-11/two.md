# Security Core Plan C

## Phase 21: SaaS Control Plane Foundation

```js
21.1 Existing TraceMind SaaS Architecture Review

- Inspect the current tenant hierarchy, Security Product architecture, database conventions, service boundaries, configuration and deployment structure.

21.2 SaaS Control Plane Requirements

- Define the control plane responsibilities, trusted boundaries, operational responsibilities and separation from customer-facing Security Product operations

21.3 Product Catalog Domain Model

- Define how TraceMind represents independently offered products, product identifiers, versions, availability and product capabilities.

21.4 Tenant, Customer & Product Relationships

- Define the relationships between organizations, customer accounts and subscribed products while reusing the existing tenant hierarchy.

21.5 Platform Administration & Customer Administration Boundaries

- Define platform-level administration separately from customer organization administration and future IAM-managed permissions.

21.6 Subscription & Entitlement Integration Contracts

- Define interfaces for subscription status and product entitlement checks without implementing the full subscription or licensing engines.

21.7 Product Feature & Capability Registry

- Define how product capabilities and feature identifiers are represented so Security Core features can later be mapped to commercial plans.

21.8 Tenant Lifecycle & Product Availability Contracts

- Define how organization status and product availability affect service access, including activation, suspension and closure integration points.

21.9Control Plane Persistence Design

- Identify the minimum control-plane metadata and relationships that require persistence, reusing existing database and migration conventions.

21.10 Control Plane API & Service Boundaries

- Define internal service contracts and future API boundaries for product catalog, customer-product relationships and control-plane operations.

21.11 Security, Isolation & Trust Boundaries

- Define protection for platform operations, tenant isolation, administrative access, trusted service identities and fail-closed behavior.

21.12 Observability & Audit Integration

- Define how control-plane operations, product lifecycle changes and administrative actions integrate with TraceMind monitoring and audit foundations.

21.13Future IAM Integration Design

- Define how future IAM authentication, RBAC/UBAC and the Permission Engine will protect platform and customer administration without building IAM now.

21.14 Future Metering & Billing Integration Design

- Define integration points for usage events, quotas, subscriptions and billing without implementing those systems in this phase.

21.15 Architecture & Contract Tests

- Validate product boundaries, tenant relationships, service contracts, lifecycle assumptions and compatibility with existing TraceMind modules.

21.16 Phase 21 Documentation & Sign-off

- Document architecture decisions, approved interfaces, dependencies, security boundaries, unresolved decisions and the handoff to Phase 22.

```

### Important design rules

- `Security Core remains the product engine`: Plan C must not duplicate cryptographic functionality or key-management logic.
- `TraceMind remains the main SaaS platform`: Security Core is one product that TraceMind uses internally and offers to external applications.
- `Reuse existing tenant infrastructure`: Do not create a competing organization/project/application/environment hierarchy.
- `Keep entitlements separate from authorization`: Entitlements determine which product features a customer has purchased; IAM authorization determines what an individual actor may do.
- `Do not implement full IAM now`: Define its integration contracts and preserve the option to add IAM later.
- `Avoid premature billing implementation`: Plan Phase 21 around stable product and control-plane contracts; subscriptions, metering and billing are handled in later phases.
- `Do not build unnecessary abstractions`: Implement only the foundation required by the approved architecture and upcoming Phase 22.

### Phase 21 completion criteria

Phase 21 is complete when the control-plane responsibilities and boundaries are documented, product and tenant relationships are defined, future subscription and entitlement interfaces are agreed upon, security and audit integration points are established, and applicable contract tests, type-check and build checks pass.
**Next step**: Begin `21.1 — Existing TraceMind SaaS Architecture Review` after Plan B has been completed and signed off. We will inspect the actual codebase before deciding which control-plane components already exist and which need implementation.

---

## Phase 22: Customer Onboarding & Tenant Lifecycle

```js
22.1 Existing Tenant & Onboarding Architecture Review

- Inspect the existing tenant models, lifecycle services, repositories, database constraints, control-plane contracts and any existing registration or provisioning workflows.

22.2 Customer Onboarding Domain Model

- Define customer onboarding records, organization ownership, onboarding status, required metadata and relationships to TraceMind tenants.

22.3 Customer Registration & Organization Provisioning

- Define and implement the customer registration workflow and organization provisioning using the existing tenant architecture.

22.4 Initial Organization Administrator Setup

- Define how the initial organization administrator is established through a trusted mechanism, keeping full IAM implementation deferred.

22.5 Project, Application & Environment Provisioning

- Define which resources are created during onboarding and support controlled provisioning using existing hierarchy constraints.

22.6 Product Activation Integration

- Connect onboarding to the control-plane product relationship and activation contracts established in Phase 21.

22.7 Onboarding Validation & Duplicate Prevention

- Validate registration data, enforce uniqueness rules, prevent duplicate organizations and handle repeated onboarding requests safely.

22.8 Provisioning Transactions & Failure Recovery

- Define transaction boundaries, partial-provisioning behavior, retry handling, idempotency and recovery from failed onboarding steps.

22.9 Organization Activation & Suspension

- Implement authorized lifecycle transitions for activating and suspending organizations, including the impact on Security Product access.

22.10 Organization Reactivation & Closure

- Define reactivation and closure workflows, including resource retention, data ownership and safeguards against unintended deletion.

22.11 Tenant Lifecycle Integration

- Integrate onboarding and lifecycle workflows with existing tenant lifecycle services and ensure organization, project, application and environment states remain consistent.

22.12 Audit & Operational Event Integration

- Record onboarding, provisioning and lifecycle changes through the existing audit and monitoring contracts.

22.13 Security & Tenant Isolation Controls

- Protect registration and provisioning endpoints, validate ownership, prevent unauthorized tenant creation or modification, and apply appropriate abuse controls.

22.14 Customer Onboarding & Lifecycle API Contracts

- Define service and API contracts for registration, onboarding status, activation, suspension, reactivation and closure as appropriate.

22.15 Onboarding Unit & Integration Tests

- Test successful registration, resource provisioning, validation failures, duplicate requests, lifecycle transitions and partial failures.

22.16 Tenant Isolation & Recovery Tests

- Test cross-tenant access, unauthorized lifecycle changes, repeated requests, rollback or recovery behavior and inconsistent resource states.

22.17 Phase 22 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and onboarding-design review.
```

### Important design rules

- `Reuse TraceMind's tenant hierarchy`: Do not create a separate organization or resource hierarchy for external Security Core customers.
- `Separate registration from authentication`: Establishing an organization administrator must use a trusted mechanism, even though the full IAM SaaS is deferred.
- `Make provisioning idempotent`: Retrying an interrupted onboarding request must not create duplicate organizations or inconsistent resources.
- `Define suspension behavior explicitly`: Suspending an organization must affect access to protected Security Product operations, not merely change a status field.
- `Protect tenant boundaries`: Customers must not be able to create, activate, suspend or close organizations they do not control.
- `Keep product activation separate from billing`: Phase 22 integrates with product activation contracts; subscription plans, payments and entitlement enforcement are handled in later phases.
- `Preserve customer data`: Organization closure must follow explicit retention and deletion policies rather than automatically destroying keys, encrypted data or audit records.

### Phase 22 completion criteria

Phase 22 is complete when the onboarding and tenant lifecycle workflows are implemented, provisioning is safe to retry and recover, lifecycle transitions enforce access restrictions, tenant isolation is verified, and applicable tests, type-check and build checks pass.
**Next step**: After Phase 21 is signed off, begin `22.1 — Existing Tenant & Onboarding Architecture Review`. We will inspect the actual TraceMind implementation first, identify what can be reused, and define exact file-level changes before coding.

---

## Phase 23: Product Catalog & Subscription Management

```js
23.1 Existing Product Catalog & Subscription Architecture Review

- Inspect existing control-plane contracts, customer-product relationships, tenant lifecycle, database conventions and any subscription-related implementation.

23.2 Product Catalog Domain Model

- Define product identifiers, names, descriptions, versions, availability, lifecycle status and relationships to product capabilities.

23.3 Product Plan & Offering Model

- Define product offerings such as Free, Trial, Paid and Enterprise, including plan identifiers, status and applicable product associations.

23.4 Plan Features & Commercial Metadata

- Define how plan metadata represents included features, supported limits, add-ons and commercial attributes without implementing the entitlement engine.

23.5 Catalog Persistence & Versioning

- Design and implement catalog persistence, uniqueness constraints, lifecycle management and versioning using existing TraceMind database conventions.

23.6 Subscription Domain Model

- Define customer subscriptions, associated organization and product, selected plan, subscription status, effective dates and lifecycle metadata.

23.7 Subscription Creation & Activation

- Implement subscription creation and activation workflows with validated customer-product relationships and safe handling of repeated requests.

23.8 Subscription Lifecycle Management

- Define and implement pending, trial, active, past-due, suspended, cancelled and expired states where applicable, with valid transition rules.

23.9 Trial Management

- Define trial eligibility, start and end dates, expiry behavior, conversion to paid plans and handling of repeated trial requests.

23.10 Plan Upgrades & Downgrades

- Implement plan-change workflows, effective-date rules, feature-change implications and safeguards against inconsistent subscription states.

23.11 Renewal, Cancellation & Expiration

- Define renewal behavior, cancellation timing, end-of-term access and subscription expiration handling.

23.12 Subscription History & Change Tracking

- Track plan changes, lifecycle transitions, effective dates and relevant metadata for operational traceability.

23.13 Tenant & Product Lifecycle Integration

- Ensure subscriptions respect organization status, product availability and the existing tenant lifecycle contracts.

23.14 Entitlement & Billing Integration Contracts

- Define the interfaces through which Phase 24 will resolve feature access and Phase 27 will process commercial charges, without duplicating either system.

23.15 Subscription Administration API Contracts

- Define internal service and API contracts for catalog browsing, plan details, subscription creation, status retrieval and lifecycle changes.

23.16 Catalog & Subscription Unit Tests

- Test catalog validation, subscription creation, state transitions, trials, plan changes, cancellation and expiration.

23.17 Concurrency, Isolation & Lifecycle Tests

- Test duplicate subscription requests, conflicting plan changes, cross-tenant access, lifecycle inconsistencies and failure recovery.



23.18 Phase 23 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and catalog/subscription design review.
```

### Important design rules

- `Separate products, plans and subscriptions`: A product defines what TraceMind offers; a plan defines an offering; a subscription records a customer's relationship to that offering.
- `Keep entitlements separate`: Phase 23 stores subscription and plan information. Phase 24 determines the features and limits the customer is entitled to use.
- `Keep billing separate`: Phase 23 defines lifecycle and billing integration contracts. Invoices, payments, taxes and payment retries belong to Phase 27.
- `Preserve historical records`: Plan changes and cancellations should not erase subscription history.
- `Enforce tenant boundaries`: Customers must not be able to view or modify another organization's subscriptions.
- `Define state transitions explicitly`: A subscription must not become active or renew merely because an API request was repeated.
- `Keep IAM deferred`: Administrative operations require an enforced access boundary, but the full IAM product remains outside this phase.

### Phase 23 completion criteria

Phase 23 is complete when the product catalog and plans are managed through defined contracts, subscription lifecycle transitions are consistent and tenant-scoped, trial and plan-change behavior is defined, and applicable tests, type-check and build checks pass.
**Next step**: After Phase 22 is signed off, begin `23.1 — Existing Product Catalog & Subscription Architecture Review`. We will inspect the actual TraceMind codebase before deciding which models, repositories, services and API contracts need implementation.

---

## Phase 24: Entitlements & Licensing Engine

```js
24.1 Existing Subscription & Product Architecture Review

- Inspect the product catalog, plan models, subscription lifecycle, tenant hierarchy and integration contracts established in previous phases.

24.2 Entitlement Domain Model

- Define entitlement identifiers, product and feature associations, tenant ownership, status, effective dates and lifecycle metadata.

24.3 Feature & Capability Registry Integration

- Define how product features and capabilities map to catalog offerings and subscription plans using stable identifiers.

24.4 Plan-to-Entitlement Mapping

- Implement the mapping between plans, included features, add-ons and applicable resource or usage limits.

24.5 Subscription-Based Entitlement Resolution

- Resolve effective entitlements from a customer's current subscription, plan, trial status and approved commercial overrides.

24.6 Entitlement Lifecycle Management

- Handle activation, expiry, suspension, revocation, cancellation and subscription changes, including their effects on feature access.

24.7 Entitlement Overrides & Exceptions

- Define authorized administrative overrides for enterprise agreements, temporary access, trials and support cases, with explicit scope and expiry.

24.8 Entitlement Persistence & Versioning

- Persist entitlement assignments and relevant history using existing database conventions, constraints and transaction patterns.

24.9 Entitlement Evaluation Service

- Implement a reusable service that answers whether a tenant is entitled to a product feature or capability at a given time.

24.10 Entitlement Caching & Invalidation

- Define caching and invalidation rules for subscription changes, plan upgrades, expiry, suspension and revocation.

24.11 Entitlement Enforcement Integration

- Integrate entitlement checks at Security Product service boundaries and other relevant product operations, rather than relying on UI restrictions.

24.12 Entitlement & IAM Authorization Separation

- Ensure product entitlement checks and actor-level IAM permission checks remain separate and are both required where applicable.

24.13 Feature Limits & Enforcement Contracts

- Define how entitlement limits are exposed to Phase 25 metering and quotas, including the distinction between entitlement evaluation and runtime usage enforcement.

24.14 Failure Handling & Fail-Closed Behavior

- Define safe behavior when subscription state or entitlement resolution is unavailable, stale or inconsistent; never silently grant paid features.

24.15 Entitlement Audit & Operational Events

- Record relevant entitlement changes, overrides, evaluation failures and enforcement outcomes through established monitoring and audit contracts.

24.16 Entitlement Unit & Integration Tests

- Test plan mapping, subscription resolution, overrides, effective dates, lifecycle transitions, cache invalidation and feature enforcement.

24.17 Tenant Isolation & Negative Security Tests

- Test cross-tenant entitlement access, expired plans, suspended organizations, revoked features and attempts to bypass backend enforcement.

24.18 Phase 24 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and entitlement-design review.

```

### Important design rules

- `Entitlement is not authorization`: A subscription may include key rotation, but the individual actor must still have permission to rotate a key.
- `Use subscription data as the source of truth`: Do not independently duplicate plan or subscription lifecycle logic inside the entitlement engine.
- `Enforce at backend service boundaries`: Hiding a feature in the dashboard is not sufficient.
- `Fail safely`: An entitlement-resolution failure must never automatically grant access to paid or restricted features.
- `Define cache consistency explicitly`: Expired or revoked entitlements must not remain effective indefinitely because of stale cached data.
- `Keep metering separate`: Phase 24 resolves feature eligibility and limits; Phase 25 measures usage and enforces quotas.
- `Keep IAM deferred`: Integrate with its future authorization contract without building the full IAM SaaS in this phase.

### Phase 24 completion criteria

Phase 24 is complete when entitlements can be reliably resolved from subscriptions and plans, lifecycle changes are reflected in access decisions, feature enforcement works at backend boundaries, tenant isolation is verified, and applicable tests, type-check and build checks pass.
**Next step**: After Phase 23 is signed off, begin `24.1 — Existing Subscription & Product Architecture Review`. We will inspect the actual TraceMind implementation before defining the exact models, services, repositories and integration points to change.

---

## Phase 25: Usage Metering, Quotas & Limits

```js
25.1 Existing Entitlement & Product Usage Architecture Review

- Inspect subscription plans, entitlement limits, Security Product APIs, monitoring events, tenant context and existing persistence conventions.

25.2 Usage Metering Requirements & Metric Definitions

- Identify measurable product activities and define units, measurement rules, aggregation windows and which metrics are billable.

25.3 Usage Event Domain Model

- Define usage event identifiers, tenant and product references, metric names, measured quantities, timestamps, dimensions and source identifiers.

25.4 Usage Event Validation & Normalization

- Validate incoming usage events, normalize units and timestamps, reject invalid measurements and prevent untrusted clients from fabricating privileged usage records.

25.5 Usage Event Collection & Integration

- Capture relevant usage from approved Security Product service boundaries, such as API requests and supported security operations.

25.6 Idempotent Usage Ingestion

- Implement duplicate detection, stable event identifiers and retry-safe ingestion so repeated delivery does not inflate usage.

25.7 Usage Persistence & Data Integrity

- Design and implement usage-event persistence, indexes, tenant isolation and integrity constraints using existing TraceMind database conventions.


25.8 Usage Aggregation & Reporting Windows

- Aggregate usage by tenant, product, metric and billing period, with defined behavior for late-arriving events and corrections.

25.9 Usage Counter & Current Consumption Service

- Provide reliable current-period consumption and historical usage summaries for quota checks and customer reporting.

25.10 Entitlement Limit Integration

- Resolve applicable usage limits from Phase 24 entitlements and associate each supported metric with the correct plan or add-on limit.

25.11 Quota Policy & Threshold Definitions

- Define hard limits, soft limits, warning thresholds, grace periods and any approved overage policies.

25.12 Runtime Quota Enforcement

- Enforce applicable hard limits at backend service boundaries and define how operations behave when usage approaches or exceeds a quota.

25.13 Concurrency & Atomic Usage Updates

- Prevent concurrent requests from incorrectly bypassing quotas or double-counting consumption; define consistency guarantees for enforcement.

25.14 Usage Warnings & Operational Events

- Generate appropriate threshold and limit events for monitoring, customer notifications and future account-console integrations.

25.15 Billing Usage Export Contract

- Define a stable, auditable usage summary contract for Phase 27 billing, without implementing invoice generation or payment processing.

25.16 Usage Retention & Data Lifecycle

- Define retention, archival, aggregation retention and correction policies while preserving the records needed for billing reconciliation.

25.17 Usage Metering Unit & Integration Tests

- Test event validation, idempotency, aggregation, counters, late events, period boundaries and data persistence.

25.18 Quota, Concurrency & Tenant Isolation Tests

- Test limit enforcement, concurrent consumption, retries, cross-tenant access, overage rules and failure scenarios.

25.19 Phase 25 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and usage-accounting review.
```

### Important design rules

- `Measure usage at trusted backend boundaries`: Do not rely solely on client-reported usage for quota enforcement or billing.
- `Keep entitlements separate from metering`: Phase 24 determines allowed features and limits; Phase 25 measures consumption and enforces quotas.
- `Make ingestion idempotent`: Retries and duplicate events must not silently inflate customer usage.
- `Define quota consistency`: Concurrent requests must not exceed hard limits because of race conditions, where strict enforcement is required.
- `Separate usage from billing`: Phase 25 produces reliable usage records and summaries; Phase 27 calculates charges, invoices and payments.
- `Plan for late events and corrections`: Establish clear rules for delayed ingestion, failed requests, reversals and billing-period boundaries.
- `Enforce tenant isolation`: Usage records and reports must never expose another organization's consumption.
- `Protect service availability`: Define safe behavior when the metering service is temporarily unavailable, balancing operational availability with strict quota and billing guarantees.

### Phase 25 completion criteria

Phase 25 is complete when usage can be captured and persisted reliably, duplicate events are handled safely, usage summaries are accurate, entitlement-based quotas are enforced according to defined consistency rules, and applicable tests, type-check and build checks pass.
**Next step**: After Phase 24 is signed off, begin `25.1 — Existing Entitlement & Product Usage Architecture Review`. We will inspect the actual TraceMind implementation before deciding which metrics, event contracts, repositories and quota mechanisms need to be added.

---

## Phase 26: Developer Access & Integration Platform

```js
26.1 Existing API & Developer Integration Architecture Review

- Inspect Security Product API contracts, authentication integration, tenant model, entitlement checks, usage metering and existing documentation conventions.

26.2 Developer Access Domain Model

- Define developer access resources, API credential metadata, application associations, ownership, status and lifecycle requirements.

26.3 API Credential Issuance & Registration

- Define and implement secure credential issuance for approved customer applications and service identities, using established security contracts.

26.4 Credential Storage & Secret Protection

- Persist only necessary credential metadata and protected verification material or secure references; never store recoverable plaintext credentials in ordinary tables.

26.5 Credential Scope & Permission Boundaries

- Define allowed product, application and environment scopes, and integrate with the existing authentication and authorization boundary.

26.6 Credential Expiration, Rotation & Revocation

- Implement credential lifecycle operations, expiry policies, rotation, revocation and safe handling of credentials that are no longer valid.

26.7 API Authentication & Credential Validation

- Integrate issued credentials with the API authentication mechanism, including invalid, expired, revoked and malformed credential handling.

26.8 Entitlement & Quota Integration

- Ensure authenticated integrations are subject to organization-level product entitlements, feature restrictions and applicable usage quotas.

26.9 Developer Documentation & API Reference

- Document API endpoints, authentication, request and response schemas, errors, security requirements, rate limits and integration examples.

26.10 SDK & Client Integration Strategy

- Define a supported SDK approach and implement an initial client library only where justified by stable API contracts and developer needs.

26.11 Sandbox & Test Integration Environment

- Define isolated test credentials, non-production environments, test data and safe integration workflows that cannot access production resources.

26.12 Webhook Contract & Delivery Foundation

- Define event subscriptions, payload schemas, signature verification, delivery retries, duplicate handling and webhook endpoint security.

26.13 Developer Access Audit & Monitoring

- Record credential issuance, rotation, revocation, authentication failures and integration events through established audit and monitoring contracts.

26.14 Developer Access Management API Contracts

- Define secured operations for credential metadata, lifecycle management, integration settings and webhook configuration.

26.15 Developer Integration Unit & Contract Tests

- Test credential lifecycle, authentication validation, API contract compatibility, SDK behavior where applicable and webhook signatures.

26.16 Security, Isolation & Abuse Tests

- Test credential leakage, privilege escalation, cross-tenant access, expired credentials, replay or duplicate webhook delivery, and quota bypass attempts.

26.17 Developer Experience & Operational Tests

- Validate setup documentation, onboarding examples, sandbox workflows, actionable error messages and troubleshooting guidance.

26.18 Phase 26 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and developer-integration security review.
```

### Important design rules

- `Build on the existing Security Product APIs`: Developer integrations must use documented contracts, not internal module imports or direct database access.
- `Separate API credentials from IAM`: API credentials identify an application or service integration; they do not replace user authentication or the future IAM Permission Engine.
- `Protect credentials from creation to revocation`: Show newly issued secrets only through a deliberate, secure flow. Never log them or expose them in ordinary API responses.
- `Enforce all relevant controls`: Valid credentials alone do not grant unrestricted access. Tenant ownership, product entitlements, operation permissions and applicable quotas must still be checked.
- `Keep sandbox and production isolated`: Test credentials and resources must not provide access to production tenants or key material.
- `Design webhooks defensively`: Authenticate webhook payloads, handle retries and duplicates, and avoid leaking sensitive security events.
- `Keep the SDK scope controlled`: Stabilize the API contracts first; avoid maintaining multiple SDKs before there is a clear need.

### Phase 26 completion criteria

Phase 26 is complete when external developers can obtain and manage integration credentials securely, authenticate to the supported APIs, follow clear documentation, test integrations in an isolated environment, and use supported webhook or SDK capabilities where implemented. Security, tenant isolation, entitlement and quota tests, type-check and build checks must pass.
**Next step**: After Phase 25 is signed off, begin `26.1 — Existing API & Developer Integration Architecture Review`. We will inspect the actual TraceMind implementation and define exact file-level changes before coding.

---

## Phase 27: Billing, Invoicing & Payments

```js
27.1 Existing Subscription & Usage Architecture Review

- Inspect subscription models, plan pricing metadata, usage summaries, billing integration contracts, tenant hierarchy and existing persistence conventions.

27.2 Billing Domain Model

- Define billing accounts, billing periods, currency, billing status, billing contacts and relationships to customer organizations and subscriptions.

27.3 Pricing & Charge Calculation Model

- Define recurring charges, usage-based rates, add-ons, discounts, credits, overage charges and applicable pricing rules.

27.4 Billing Period & Cycle Management

- Define billing-cycle boundaries, renewal dates, partial periods, proration rules and consistent period calculations.

27.5 Usage-to-Billing Integration

- Consume validated usage summaries from Phase 25 and define handling for duplicate imports, late events, corrections and finalized billing periods.

27.6 Invoice Generation

- Generate invoices from subscription charges and eligible usage, including line items, quantities, rates, discounts, credits, taxes where applicable and totals.

27.7 Invoice Numbering & Lifecycle
- Define unique invoice numbering and lifecycle states such as draft, issued, paid, overdue, voided and credited, with explicit transition rules.

27.8 Tax, Currency & Rounding Rules

- Define supported currencies, decimal precision, rounding behavior, tax configuration and the requirements for the jurisdictions in which TraceMind will operate.

27.9 Payment Provider Integration

- Define and implement an appropriate payment-provider adapter for payment initiation, payment confirmation, refunds and payment-status retrieval.

27.10 Payment Webhook Verification

- Validate provider webhook authenticity, handle duplicate and out-of-order events, and prevent untrusted callbacks from changing billing records.

27.11 Payment Retry & Failure Handling

- Define retry policies, payment failure states, recovery workflows and customer notification integration points.

27.12 Credits, Refunds & Adjustments

- Implement controlled credit notes, refunds and billing adjustments with authorization, traceability and appropriate invoice relationships.

27.13 Subscription Renewal & Billing Integration

- Connect subscription lifecycle events to recurring billing while keeping subscription state and payment state distinct.

27.14 Dunning & Overdue Account Handling

- Define overdue reminders, grace periods, escalation and suspension recommendations, coordinating with Phase 23 subscription lifecycle and Phase 24 entitlements.

27.15 Billing Persistence & Transaction Integrity

- Implement repositories, database constraints, transactional updates and idempotent processing for invoices, payments and billing events.

27.16 Billing Audit & Reconciliation

- Track financial state changes and reconcile provider transactions, internal payment records, invoices, credits and usage totals.

27.17 Billing Service & API Contracts

- Define secured contracts for billing account details, invoice retrieval, payment status, billing history and supported billing operations.

27.18 Billing Unit & Integration Tests

- Test pricing calculations, recurring charges, usage charges, invoices, payment workflows, credits, refunds, renewals and webhook processing.

27.19 Financial Integrity & Security Tests

- Test duplicate charges, repeated webhooks, concurrent invoice generation, tenant isolation, unauthorized billing changes and reconciliation failures.

27.20Phase 27 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and billing-readiness review.
```

### Important design rules

- `Keep financial records consistent`: Use appropriate decimal handling for money, explicit currency codes and documented rounding rules.
- `Prevent duplicate charges`: Invoice generation, payment processing and webhook handling must be idempotent where applicable.
- `Separate subscription and payment status`: A successful payment is not the same as an active subscription; define how each lifecycle affects the other.
- `Use trusted usage records`: Billing must consume validated, tenant-scoped usage data rather than arbitrary client-submitted quantities.
- `Protect payment operations`: Verify payment-provider webhooks, enforce billing permissions and avoid storing sensitive payment credentials unnecessarily.
- `Maintain an audit trail`: Invoice adjustments, credits, refunds and reconciliation decisions must be traceable.
- `Keep entitlement enforcement separate`: Phase 24 determines feature access; billing and subscription policies determine the commercial state that informs entitlements.
- `Confirm jurisdictional requirements`: Tax, invoicing and payment compliance requirements should be established for the intended markets before production launch.

### Phase 27 completion criteria

Phase 27 is complete when recurring and usage-based charges can be calculated accurately, invoices and payment records remain consistent, provider callbacks are securely processed, refunds and adjustments are traceable, tenant isolation is enforced, and applicable tests, type-check and build checks pass.
**Next step**: After Phase 26 is signed off, begin `27.1 — Existing Subscription & Usage Architecture Review`. We will inspect the actual TraceMind implementation before choosing a payment provider or defining exact file-level changes.

---

## Phase 28: Customer Account & SaaS Console

```js
28.1 Existing Frontend & SaaS API Architecture Review

- Inspect TraceMind frontend conventions, routing, API clients, customer onboarding, subscriptions, entitlements, usage, developer access and billing contracts.

28.2 SaaS Console Layout & Navigation

- Define the console shell, navigation structure, page hierarchy, responsive layout and integration with the existing TraceMind application.

28.3 Customer Organization Profile

- Build organization profile views and supported editing workflows for account details, organization metadata and business contact information.

28.4 Organization & Tenant Context Management

- Provide clear organization, project and application context where applicable, respecting the existing tenant hierarchy and access boundaries.

28.5 Account Administrator & Member Management Integration

- Integrate supported member and administrator workflows through existing identity contracts, while keeping full IAM implementation separate.

28.6 Product Catalog & Plan Overview

- Display available products, current plans, included capabilities and relevant plan information from the control-plane APIs.

28.7 Subscription Management Interface

- Display subscription status, trial dates, renewal information and supported upgrade, downgrade, cancellation or reactivation workflows.

28.8 Entitlements & Feature Availability View

- Show the products and features available to the organization, including applicable plan restrictions and limits, using authoritative entitlement responses.

28.9 Usage & Quota Dashboard

- Display current consumption, historical usage, quota thresholds and usage summaries from Phase 25 APIs.

28.10 Billing Account & Payment Settings

- Build supported views and workflows for billing details, billing contacts and payment-method management through approved provider integrations.

28.11 Invoice & Payment History

- Display invoices, invoice status, payment history, credits and available invoice documents using authorized billing APIs.

28.12 Developer Credentials & Integration Management

- Provide supported API credential metadata and lifecycle operations, integration documentation links, sandbox access and webhook configuration.

28.13 Account Notifications & Service Status

- Display relevant subscription, usage, billing and integration notifications, plus service-status information where available.

28.14 Account Security & Access-Aware UI

- Handle authenticated sessions, authorization-dependent controls, sensitive-data masking and safe behavior for denied or expired requests.

28.15 Form Validation, Loading & Error States

- Implement validation, loading and empty states, retry behavior, confirmation dialogs and actionable error messages across console workflows.

28.16 API Integration & State Consistency

- Connect console pages to existing APIs and keep subscription, entitlement, usage and billing displays consistent after mutations.

28.17 Accessibility & Responsive Design

- Validate navigation, keyboard interaction, form labels, status indicators and supported screen sizes.

28.18 Console Unit & Component Tests

- Test page rendering, forms, state transitions, API-client behavior, errors and access-dependent UI behavior.

28.19 End-to-End & Tenant Isolation Tests

- Test customer onboarding through account management, subscription changes, usage views, billing workflows and unauthorized cross-tenant access.

28.20 Phase 28 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, regression checks and customer-console review.
```

### Important design rules

- `Reuse existing APIs`: The console must not access MySQL or business repositories directly.
- `Keep commercial and security dashboards separate`: Security resource operations belong to Phase 19; subscriptions, usage, billing and account settings belong here.
- `Use authoritative backend data`: The frontend must not calculate subscription eligibility or independently grant product features.
- `Respect IAM boundaries`: Member and administrator operations must use approved identity and authorization interfaces rather than introducing a duplicate IAM implementation.
- `Protect billing and credentials`: Sensitive payment details and API credentials must use dedicated, secure workflows.
- `Enforce tenant isolation`: Switching organizations must not leave data from the previous organization visible or permit unauthorized account modifications.
- `Build only against available contracts`: If an upstream API or capability is not yet implemented, document the dependency rather than simulating a successful production operation.

### Phase 28 completion criteria

Phase 28 is complete when customers can manage their supported account, product, subscription, usage, billing and developer integration workflows through the console; backend authorization and tenant isolation are enforced; and applicable tests, type-check and build checks pass.
**Next step**: After Phase 27 is signed off, begin `28.1 — Existing Frontend & SaaS API Architecture Review`. We will inspect the actual TraceMind implementation before deciding which pages, components and API integrations need to be built.

## Phase 29: Platform Administration, Reliability & Support

```js
29.1 Existing Platform & Operations Architecture Review

- Inspect TraceMind deployment, configuration, database, monitoring, audit, tenant lifecycle, provider integrations and existing operational tooling.

29.2 Platform Administration Domain & Access Boundaries

- Define platform-level administrative responsibilities, operational roles and separation from customer organization administration and future IAM.

29.3 Platform Administration API & Service Contracts

- Define controlled service interfaces for platform operations, tenant status inspection, product availability and operational administration.

29.4 Platform Operations Console

- Build the authorized operator `interface` for platform health, tenant lifecycle visibility, product status and operational workflows, reusing existing UI conventions.

29.5 Tenant & Subscription Operational Visibility

- Provide authorized support staff with relevant organization, subscription, entitlement and usage status for troubleshooting without bypassing customer data boundaries.

29.6 Service Health & Dependency Monitoring

- Monitor application health, database connectivity, Security Core providers, KMS availability, API latency, failures and other critical dependencies.

29.7 Operational Metrics, Logs & Alerts

- Define actionable service-level metrics, structured logs, alert thresholds and alert routing for reliability and security incidents.

29.8 Service-Level Objectives & Reliability Targets

- Define availability, latency, error-rate and recovery targets appropriate to the initial SaaS offering, including how they will be measured.

29.9 Incident Management & Response Procedures

- Define incident severity, escalation, ownership, response workflows, communication and post-incident review procedures.

29.10 Customer Support & Diagnostics

- Define support-case workflows, troubleshooting information, safe diagnostic access and customer communication boundaries.

29.11 Backup & Restore Operations

- Define database backup schedules, backup protection, retention, restore procedures and recovery verification.

29.12 Disaster Recovery & Business Continuity

- Define recovery objectives, dependency recovery order, key-management availability requirements and controlled disaster-recovery exercises.

29.13 Security Operations & Administrative Audit

- Audit privileged platform actions, support access, tenant lifecycle changes and operational configuration updates through established audit contracts.

29.14 Operational Security & Vulnerability Management

- Define dependency scanning, security updates, secret handling, configuration checks, vulnerability remediation and release-risk management.

29.15 Capacity Planning & Resource Management

- Monitor database growth, storage, connection pools, request throughput, KMS quotas and resource consumption to guide capacity decisions.

29.16 Deployment, Rollback & Environment Operations

- Define deployment verification, migration safety, configuration separation, rollback criteria and operational checks across supported environments.

29.17 Operational Runbooks & Documentation

- Document routine operations, incident response, backup and restore, KMS failure handling, tenant support and deployment procedures.

29.18 Reliability & Failure-Injection Tests

- Test dependency outages, database failures, provider timeouts, alerting, recovery procedures and safe degradation behavior.

29.19 Operational Security & Access Tests

- Test privileged access boundaries, tenant isolation, sensitive diagnostic data exposure, administrative audit coverage and unauthorized operational actions.

29.20 Phase 29 Verification & Sign-off

- Run applicable automated and manual tests, type-check, build, operational exercises and reliability-readiness review.
```

### Important design rules

- `Separate platform administration from customer administration`: Platform operators and customer organization administrators have different responsibilities and trust boundaries.
- `Apply least privilege`: Operational access must be explicitly authorized, audited and limited to the minimum necessary information and actions.
- `Reuse TraceMind monitoring`: Extend the existing monitoring and audit foundations instead of introducing a competing logging platform unnecessarily.
- `Protect customer data during support`: Diagnostic tools must not expose plaintext secrets, raw cryptographic keys, passwords or unnecessary customer data.
- `Validate recovery procedures`: Backups alone are insufficient; perform restore tests and document key dependencies and recovery objectives.
- `Define measurable reliability targets`: Monitoring and alerts should be tied to meaningful service-level objectives rather than collecting metrics without operational purpose.
- `Avoid premature infrastructure expansion`: Select operational tooling based on actual deployment requirements and existing architecture.
- `Keep IAM and commercialization boundaries intact`: Integrate established contracts without duplicating IAM, subscription or billing logic.

### Phase 29 completion criteria

Phase 29 is complete when platform operations have defined administrative boundaries, actionable monitoring and alerting, documented incident and support procedures, tested backup and recovery processes, secure operational access, and verified reliability controls. Applicable tests, type-check and build checks must pass.
**Next step**: After Phase 28 is signed off, begin `29.1 — Existing Platform & Operations Architecture Review`. We will inspect the actual TraceMind implementation first, identify existing operational capabilities, and establish the exact changes required before implementation.

## 30 — SaaS Launch & Commercial Readiness

```js
30.1 — Existing Platform & Launch Readiness Review
- Review the current implementation across Phases 21–29.
- Verify completed features, dependencies, known issues, and outstanding work.
- Identify launch blockers and deferred features.
- Establish a documented launch-readiness baseline.




30.2 — End-to-End Platform Integration Review
- Validate customer onboarding through tenant provisioning.
- Verify product catalog, subscriptions, entitlements, and quotas.
- Validate developer access, APIs, usage metering, and billing integration.
- Verify customer console and platform administration workflows.




30.3 — Production Security & Threat-Model Review
- Review authentication, authorization, and default-deny behavior.
- Validate tenant isolation across APIs, database queries, caches, and background jobs.
- Verify Security Core integration, secret protection, and key-management boundaries.
- Review administrative access, credential rotation, and sensitive-data exposure.
- Track and resolve critical security findings before launch.




30.4 — Legal, Privacy & Compliance Readiness
- Review privacy notices, terms of service, and customer agreements.
- Document data collection, processing, retention, deletion, and export policies.
- Review customer data ownership and third-party processor responsibilities.
- Identify applicable legal, tax, and regulatory requirements for the intended markets.
- Record required compliance actions without claiming certifications that have not been obtained.




30.5 — Performance, Load & Capacity Validation
- Define expected concurrent users, request rates, and workload profiles.
- Run API load, stress, and endurance tests.
- Validate database performance, connection pooling, and resource consumption.
- Measure latency, throughput, error rates, and resource saturation.
- Document capacity limits and scaling requirements.




30.6 — Failure Handling & Resilience Validation
- Test database, external provider, and dependency failures.
- Verify timeouts, retries, idempotency, and transaction recovery.
- Validate subscription, entitlement, quota, and billing failure behavior.
- Verify graceful degradation and fail-closed behavior for security-sensitive operations.
- Ensure failures are observable and recoverable.




30.7 — Backup, Restore & Disaster Recovery Validation
- Verify production backup schedules and retention.
- Test database restoration and data-integrity checks.
- Validate recovery procedures for critical platform services.
- Establish recovery time objective (RTO) and recovery point objective (RPO) targets.
- Record and address gaps found during recovery drills.




30.8 — Final Automated & Regression Testing
- Run unit, integration, API contract, and end-to-end test suites.
- Verify tenant isolation and negative security scenarios.
- Test onboarding, subscription lifecycle, entitlement enforcement, and quota limits.
- Validate usage aggregation, invoice generation, and payment event processing.
- Ensure regression tests cover all resolved launch-blocking defects.




30.9 — Production Infrastructure & Environment Readiness
- Verify production configuration, secrets, database access, and network controls.
- Validate TLS, domain configuration, and certificate renewal.
- Confirm environment separation and secure deployment configuration.
- Verify database migrations, indexes, and operational dependencies.
- Remove debug settings, test credentials, and unsafe development defaults.




30.10 — CI/CD, Release & Rollback Validation
- Verify the release pipeline and required quality gates.
- Validate build artifacts and deployment configuration.
- Test migration compatibility and rollback or forward-recovery procedures.
- Define release versioning and deployment approval requirements.
- Ensure failed deployments can be detected and safely handled.




30.11 — Monitoring, Alerting & Operational Readiness
- Verify health checks, logs, metrics, and distributed request correlation.
- Configure alerts for errors, latency, resource exhaustion, and dependency failures.
- Establish actionable alerts for security incidents and billing failures.
- Validate dashboards, alert routing, and escalation paths.
- Confirm that operational signals are useful without exposing secrets or sensitive data.




30.12 — Support, Incident Response & Runbook Readiness
- Finalize incident response and escalation procedures.
- Document common operational and customer-support scenarios.
- Define security incident communication and evidence-preservation procedures.
- Verify customer support workflows and issue-tracking processes.
- Assign operational ownership for critical services and incidents.




30.13 — Pilot Customer Selection & Onboarding
- Define pilot eligibility and onboarding criteria.
- Select a small set of suitable pilot customers.
- Provision isolated organizations, projects, applications, and environments.
- Validate customer setup, credentials, product access, and support channels.
- Establish pilot objectives and measurable success criteria.




30.14 — Pilot Execution & Feedback Evaluation
- Monitor pilot usage, performance, and reliability.
- Validate onboarding, integrations, and product workflows with real usage.
- Collect customer feedback and operational issues.
- Prioritize defects by severity, security impact, and customer impact.
- Confirm whether pilot exit criteria are met before broader release.




30.15 — Commercial & Billing Readiness
- Verify published plans, prices, features, and usage limits.
- Validate subscription activation, upgrade, downgrade, cancellation, and expiration.
- Verify invoice calculations, applicable taxes, payment handling, and reconciliation.
- Confirm refund, failed-payment, and overdue-account policies.
- Test that product entitlements and usage limits match the selected plan.




30.16 — Customer Documentation & Launch Communication
- Finalize getting-started guides and developer API documentation.
- Publish relevant product, plan, and usage-limit information.
- Prepare maintenance, incident, and service-status communication processes.
- Document known limitations and support channels.
- Verify that customer-facing documentation matches actual product behavior.




30.17 — Launch Blocker Review & Go/No-Go Decision
- Consolidate test reports, security findings, operational gaps, and pilot feedback.
- Verify that no unresolved critical launch blockers remain.
- Review residual risks and formally document accepted risks.
- Obtain required engineering, security, operations, and business approvals.
- Record the go/no-go decision and its justification.




30.18 — Controlled Production Launch
- Deploy the approved release to production.
- Start with the approved rollout scope and gradually expand where practical.
- Monitor platform health, tenant behavior, security signals, and commercial workflows.
- Validate critical customer journeys after deployment.
- Pause or roll back the release if predefined safety thresholds are breached.




30.19 — Post-Launch Stabilization & Review
- Review production incidents, alerts, performance, and customer feedback.
- Verify billing, usage metering, and entitlement consistency.
- Resolve launch-related defects and document follow-up improvements.
- Compare actual reliability and capacity against launch targets.
- Confirm that operational ownership and support processes are functioning.




30.20 — Final Verification & Plan C Sign-off
- Confirm all mandatory launch acceptance criteria.
- Archive release evidence, test results, deployment details, and risk approvals.
- Document remaining non-blocking work and the post-launch roadmap.
- Obtain final production-readiness sign-off.
- Mark Plan C complete only after the agreed launch gates are satisfied.



Phase 30 completion criteria
Phase 30 is complete when:
- [ ] Critical end-to-end workflows are verified.
- [ ] Security and tenant-isolation requirements pass.
- [ ] Performance, resilience, and recovery targets are validated.
- [ ] Production infrastructure, deployment, monitoring, and rollback are ready.
- [ ] Legal, privacy, customer-support, and commercial requirements are reviewed.
- [ ] Pilot exit criteria and production launch gates are satisfied.
- [ ] Production launch and post-launch stabilization are documented.
- [ ] Final sign-off is recorded.
Important TraceMind boundary: This phase validates the existing TraceMind platform and Security Product integrations. It does not require building the deferred standalone IAM SaaS product. The platform must still have sufficient authentication, authorization, and tenant-access controls for production; future IAM integration should remain behind the established contracts.
Recommended execution order: Complete each step sequentially, validate the relevant tests and acceptance criteria, and obtain confirmation before moving to the next step. Phase 30 should verify the implementation—not introduce a large set of new features during launch preparation.

```

## Phase 31 — Post-Launch Growth, Optimization & Product Evolution

```js
Phase 31 — Step-by-step roadmap

31.1 — Production Performance Baseline
- Analyze real production traffic, API latency, throughput, and error rates.
- Identify database bottlenecks and resource-intensive operations.
- Establish performance baselines for critical services.
- Compare actual behavior against Phase 30 targets.




31.2 — Customer Feedback & Product Insights
- Collect feedback from pilot and production customers.
- Identify onboarding friction, usability problems, and missing capabilities.
- Analyze feature adoption and customer support requests.
- Prioritize improvements based on customer impact and effort.




31.3 — Database & Query Optimization
- Review slow queries, execution plans, and index effectiveness.
- Optimize high-volume tenant and usage queries.
- Review transaction boundaries, connection pooling, and locking.
- Validate pagination, archival, and retention strategies.
- Confirm that optimizations preserve tenant isolation and data integrity.




31.4 — Application Architecture Optimization
- Identify unnecessary coupling and duplicated logic across modules.
- Review service boundaries and shared platform abstractions.
- Optimize resource-intensive synchronous workflows.
- Introduce asynchronous processing only where justified by measured needs.
- Preserve existing contracts and backward compatibility.




31.5 — SaaS Scalability & Capacity Evolution
- Measure growth in organizations, applications, requests, and stored data.
- Establish capacity thresholds and scaling triggers.
- Evaluate horizontal scaling and stateless service design.
- Review workload isolation for high-volume tenants.
- Test scaling strategies before applying them to production.




31.6 — Continuous Security Improvement
- Review newly discovered vulnerabilities and dependency risks.
- Reassess tenant isolation, credential handling, and privileged operations.
- Validate key rotation, secret lifecycle, and audit integrity.
- Improve security testing and remediation workflows.
- Revisit threat models when architecture or integrations change.




31.7 — Reliability & SLO Improvement
- Evaluate actual service-level indicator (SLI) measurements.
- Review service-level objectives (SLOs) and error budgets.
- Analyze recurring incidents and failure patterns.
- Improve alert quality and reduce false positives.
- Track reliability improvements against measurable targets.




31.8 — Infrastructure & Operating Cost Optimization
- Measure compute, database, storage, network, and provider costs.
- Attribute usage and cost to products or tenants where practical.
- Identify idle resources and inefficient workloads.
- Optimize retention, archival, and resource allocation.
- Establish cost-per-tenant and cost-per-workload baselines.




31.9 — Customer Onboarding Optimization
- Measure registration-to-activation conversion.
- Reduce manual onboarding and provisioning steps.
- Improve validation, setup guidance, and error recovery.
- Review organization, project, application, and environment provisioning.
- Validate the complete customer journey after each improvement.




31.10 — Developer Experience & Integration Improvements
- Improve API documentation, examples, and error messages.
- Review SDK requirements based on customer integrations.
- Improve API credential lifecycle and integration diagnostics.
- Refine webhook reliability, retries, and delivery visibility.
- Gather feedback from developers integrating TraceMind into applications.




31.11 — Product Usage & Entitlement Analytics
- Identify which products and features customers actually use.
- Analyze quota utilization and usage patterns.
- Identify ineffective or confusing plan restrictions.
- Validate entitlement enforcement under real workloads.
- Use findings to inform future product and pricing decisions.




31.12 — Billing Accuracy & Revenue Operations
- Reconcile metered usage against subscription and invoice records.
- Review failed payments, retries, refunds, and billing adjustments.
- Verify idempotency and duplicate-event protection.
- Analyze plan utilization and billing-related support incidents.
- Improve financial reconciliation and reporting accuracy.




31.13 — Background Jobs & Event Processing Optimization
- Review scheduled jobs, webhook deliveries, and asynchronous workloads.
- Identify duplicate processing, delayed tasks, and retry storms.
- Improve idempotency, observability, and failure recovery.
- Introduce queue infrastructure only when workload requirements justify it.
- Validate processing guarantees and tenant isolation.




31.14 — Continuous Testing & Quality Engineering
- Expand regression tests based on real production incidents.
- Add tests for newly identified edge cases.
- Improve test data, integration environments, and test reliability.
- Validate migrations and backward compatibility.
- Keep type-checking, builds, and required test suites as release gates.




31.15 — Release Engineering & Deployment Improvements
- Improve deployment automation and release consistency.
- Reduce deployment downtime and operational risk.
- Validate migration compatibility and rollback procedures.
- Strengthen release notes, change tracking, and approval gates.
- Measure deployment frequency, failure rate, and recovery time.




31.16 — Product Roadmap & Feature Prioritization
- Consolidate customer feedback, operational findings, and product metrics.
- Identify features that deliver measurable customer value.
- Evaluate integrations and product capabilities requested by customers.
- Separate essential improvements from speculative features.
- Maintain a prioritized roadmap with clear acceptance criteria.




31.17 — Continuous Improvement Cycle & Sign-off
- Review outcomes from the completed optimization work.
- Compare performance, reliability, security, cost, and customer metrics against baselines.
- Document improvements, unresolved risks, and follow-up actions.
- Confirm regression testing and production verification.
- Establish the next improvement cycle based on measured priorities.

```
