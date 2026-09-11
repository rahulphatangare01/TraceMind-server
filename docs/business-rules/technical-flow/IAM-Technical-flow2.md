# IAM Updated plan

`"Build a standalone, enterprise-grade IAM + Security platform that TraceMind consumes, and that can also be sold independently to other SaaS/products."`

- That distinction is extremely important. We should design the boundaries before creating IAM tables or code.

#### 1. First: Change the Overall Architecture

- I recommend we stop thinking of IAM as:

```js
TraceMind
└── IAM
```

- and instead design:

```js
                    TraceMind Platform
                           │
             ┌─────────────┼──────────────┐
             │             │              │
            IAM         Security       Observability
             │             │              │
             └─────────────┴──────────────┘
                           │
                    Shared Platform
```

- But IAM and Security themselves should be independently deployable/productizable:

```js
┌──────────────────────────────────────────────────────┐
│                 TraceMind Ecosystem                  │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐               │
│  │ TraceMind    │    │ Other Client │               │
│  │ Application  │    │ Application  │               │
│  └──────┬───────┘    └──────┬───────┘               │
│         │                   │                        │
│         └─────────┬─────────┘                        │
│                   ↓                                  │
│          ┌───────────────────┐                       │
│          │    TraceMind IAM  │                       │
│          │       Service     │                       │
│          └───────────────────┘                       │
│                   │                                  │
│          ┌───────────────────┐                       │
│          │ TraceMind Security│                       │
│          │      Service      │                       │
│          └───────────────────┘                       │
└──────────────────────────────────────────────────────┘
```

- This gives us a much better long-term architecture.

#### 2. The Most Important Decision: Two Types of Users

- Your requirement is:

```js
1. TraceMind User
2. Customer User
```

- I agree, but internally I would call these identity domains, not simply user types.

```js
                    Identity
                       │
             ┌─────────┴─────────┐
             │                   │
      PLATFORM IDENTITY     CUSTOMER IDENTITY
             │                   │
      TraceMind Users       Customer Users

```

- Why?

- Because eventually the same IAM product could serve:

```js
TraceMind
Customer SaaS A
Customer SaaS B
Customer Mobile App
Customer API
```

- The IAM system itself shouldn't know that every customer is using TraceMind.

#### 3. TraceMind Users

- These are controlled completely by us.

- Their identity data should remain in the TraceMind IAM database.

- Example:

```js
TraceMind Platform
│
└── Internal IAM
│
├── Users
├── Credentials
├── Sessions
├── Roles
├── Permissions
└── Security policies
```

- These users include:

```js
PLATFORM_USER;
PLATFORM_SUPPORT;
PLATFORM_ADMIN;
PLATFORM_SUPPORT_ADMIN;
PLATFORM_SUB_ADMIN;
PLATFORM_SUPER_ADMIN;
PLATFORM_OWNER;
```

- Potentially custom platform roles later.

- Customer cannot control these identities.

#### 4. Customer Users — This Is Where the Architecture Changes

- You proposed two options:

- Option A

- Customer uses our database:

```js
Customer Application
↓
TraceMind IAM
↓
TraceMind IAM DB
↓
Customer Users
```

- Option B

```js
Customer owns the database:

Customer Application
↓
TraceMind IAM
↓
Customer's Identity Database
```

- This is possible, but there is an important architectural distinction:

`We should never make our IAM authorization engine depend directly on arbitrary customer database schemas.`

- Instead, introduce an Identity Provider / Identity Adapter abstraction.

#### 5. Recommended Architecture: Identity Provider Abstraction

- This should become one of the core concepts of our standalone IAM.

```js
                                  IAM
                     │
              Identity Provider
                     │
        ┌────────────┼─────────────┐
        │            │             │
   TraceMind DB   External DB    External IdP
        │            │             │
      MySQL       Customer DB    OIDC/SAML
```

- So our IAM doesn't care where the user's identity originates.

- It asks:

`"Give me the identity for this authentication request."`

- The provider handles the source.

#### 6. Customer Option A — TraceMind Managed Identity

- This should be the default and easiest offering.

- Customer selects:

```js
Identity Storage:
TRACE_MIND_MANAGED
```

- Architecture:

```js
Customer
│
↓
TraceMind IAM
│
├── User DB
├── Credentials
├── Sessions
├── MFA
├── Roles
└── Permissions
```

- Customer gets APIs such as:

```js
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/password/reset
POST /users/invite
GET /users
PATCH /users/:id
```

- This is the easiest model for most customers.

#### 7. Customer Option B — Customer-Owned Identity Store

- This is more enterprise-level.

- Customer may say:

`"We already have our users in our database. We don't want TraceMind to store passwords/users."`

- Then:

```js
Customer Application
│
↓
TraceMind IAM
│
↓
Identity Adapter
│
↓
Customer Identity System
```

- But I recommend not starting with arbitrary database connection support.

- Instead, support standards first:

```js
OIDC
SAML
OAuth 2.0
SCIM
```

- Then later provide a controlled database adapter if there is a real customer requirement.

#### 8. Why I Don't Recommend Direct Customer DB First

- Suppose Customer A has:

```js
users;
user_id;
email;
password_hash;
```

- Customer B has:

```js
accounts;
account_uuid;
login;
secret;
```

- Customer C has:

```js
employees;
employee_id;
work_email;
```

- If our IAM directly integrates with arbitrary schemas, we end up building:

```js
Customer-specific SQL
Customer-specific mappings
Customer-specific password logic
Customer-specific transaction handling
```

- That becomes extremely difficult to maintain.

- Instead:

```js
Customer System
↓
OIDC / SAML / OAuth / SCIM
↓
TraceMind IAM
```

- This is much cleaner.

#### 9. But What If Customer Insists on Their Own Database?

- We can eventually support:

`CUSTOM_IDENTITY_PROVIDER`

- with an adapter contract:

```js
interface IdentityProvider {
authenticate(...): Promise<Identity>;
getUser(...): Promise<Identity | null>;
validateCredential(...): Promise<boolean>;
}
```

- Possible implementations:

```js
TraceMindIdentityProvider;
OIDCIdentityProvider;
SAMLIdentityProvider;
CustomerDatabaseIdentityProvider;
```

- Then IAM stays independent.

#### 10. Critical Separation: Identity vs Authorization

- This becomes even more important with customer-owned identity.

- Customer may own:

```js
User
Email
Password
Employee ID
Profile
```

- But TraceMind IAM can still own:

```js
Membership;
Role;
Permission;
Scope;
Entitlement;
Authorization;
```

- For example:

```js
Customer DB
    │
    └── User: Rahul
             │
             ↓
        TraceMind IAM
             │
             ├── Organization: Acme
             ├── Role: Developer
             ├── Project: Payments
             └── Permissions:
                    logs.read
                    traces.read
```

- This is an extremely powerful architecture.

#### 11. Customer Database Does NOT Need to Store TraceMind Roles

- This is an important decision.

- Even if customer owns identity:

```js
Customer DB
│
└── Rahul
```

- TraceMind IAM can maintain:

```js
Rahul
↓
External Identity ID
↓
TraceMind Membership
↓
Role
↓
Permissions
↓
Scope
```

- We need a mapping:

```js
External Identity
↓
IAM Principal
```

- Something like:

```js
identity_source;
external_subject;
principal_id;
```

- This allows us to decouple identity from authorization.

#### 12. Customer User Limit — This Belongs to Entitlement, Not IAM Logic

- You mentioned:

`Customer can have multiple users but limit users according to plan.`

- Correct.

- But I would not hard-code this into IAM.

- Instead:

```js

IAM
 │
 └── asks Entitlement Service
             │
             ↓
        "How many users?"
```

- For example:

```js
FREE
10 users

PRO
100 users

BUSINESS
1,000 users

ENTERPRISE
Custom
```

- Architecture:

```js
Customer
↓
Subscription
↓
Entitlement
↓
IAM
↓
User limit
```

- This fits perfectly with our existing Module & Entitlement System.

#### 13. Example User Creation

- Suppose customer has:

```js
Plan: PRO
User limit: 100
Current users: 99
```

- Request:

`Invite user`

- IAM asks:

```js
Entitlement:
Can organization create another user?
```

- Result:

```js
99 / 100;
ALLOW;
```

- Then:

`100 / 100`

- next request:

```js
DENY;
USER_LIMIT_REACHED;
```

- So IAM should consume entitlements, not own subscription rules.

#### 14. Now Your Security Service Becomes Separate

- Your second major requirement is:

`Encryption/decryption should also be a standalone service.`

- I strongly agree.

- Don't build encryption utilities inside IAM.

- Instead:

```js
                    Security Platform
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
      Encryption       Key Management     Secrets
          │                │                 │
      Encryption         Key rotation      Credentials
      Decryption         Key versions      Client secrets

```

- And TraceMind consumes this service.

#### 15. Security Product Can Be Independently Licensed

- Your product model becomes:

`TraceMind Security`

- with packages:

```js
SECURITY
├── Encryption
├── Decryption
├── Key Management
├── Secret Management
├── Credential Protection
├── Key Rotation
├── Security Policies
└── Audit
```

- Then customer can purchase:

`IAM only`

- or:

`Security only`

- or:

`IAM + Security`

- Exactly matching your vision.

#### 16. Encryption Configuration at Organization Level

- Your requirement here is good.

- We can eventually have:

```js
Organization
│
└── Security Configuration
│
├── Encryption enabled
├── Encryption algorithm
├── Key strategy
├── Key rotation
├── Credential policy
├── Client secret policy
├── Platform encryption
└── Application encryption
```

- But I would not allow customers to directly manipulate raw cryptographic keys casually.

- There should be a Key Management layer.

#### 17. Important Security Architecture

- I recommend:

```js
Application
↓
Security SDK
↓
Security Service
↓
Key Management Service
↓
Key Store / KMS
```

- Potentially later integrate with:

```js
AWS KMS
Azure Key Vault
Google Cloud KMS
HashiCorp Vault
```

- or provide:

`TraceMind Managed Key Management`

- This gives customers choices.

#### 18. "App Level" vs "Platform Level"

- Your requirement:

`security layer — App level, platform level`

- I would formalize this as security scopes.

```js
Security Scope
│
├── PLATFORM
├── ORGANIZATION
├── PROJECT
├── APPLICATION
├── ENVIRONMENT
└── FIELD / DATA
```

- Example:

```js
Organization
↓
Application
↓
Environment
↓
Sensitive field
```

- The customer can say:

```js
Production secrets
→ encrypted

Development secrets
→ encrypted

User PII
→ encrypted

API credentials
→ encrypted
```

#### 19. Credentials and Client Secrets

- Security service should eventually handle:

```js
API Keys
Client Secrets
Encryption Keys
Signing Keys
Webhook Secrets
Database Credentials
Integration Credentials
```

- But these should be treated as secrets, not simply encrypted strings.

- Architecture:

```js
Secret
↓
Secret Manager
↓
Encrypted Value
↓
Key Encryption Key
↓
KMS
```

- This is much stronger than:

`AES.encrypt(value, hardcodedKey)`

- which we absolutely should avoid.

#### 20. Encryption License / Entitlement

- Again, don't put licensing logic directly into encryption.

- Use:

```js
Module
↓
Entitlement
↓
Security Service
```

- For example:

```js
Security Basic
├── Encryption
└── Decryption

Security Pro
├── Encryption
├── Decryption
├── Key Rotation
└── Secret Management

Security Enterprise
├── Everything
├── Customer KMS
├── HSM
├── Advanced Policies
└── Compliance
```

#### 21. The Product Architecture I Recommend Now

- We're actually moving toward a platform architecture:

```js
                        TRACE MIND PLATFORM
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ↓                        ↓                        ↓
      IAM                   SECURITY              OBSERVABILITY
        │                        │                        │
        │                        │                        │
 Authentication            Encryption                Logging
 Authorization             Key Management            Metrics
 Identity                  Secrets                    Tracing
 Sessions                  Credentials                APM
 RBAC                      Policies                   Sessions
 UBAC                      Security Audit             Alerts
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 ↓
                       ENTITLEMENT / BILLING
```

- This is much closer to the enterprise SaaS vision you described.

#### 22. But There Is Another Important Layer

- Because IAM and Security are independently sellable, we need a concept above Organization:

- Tenant / Customer Account

- Today we have:

`Organization`

- But for a standalone IAM/Security platform, I would introduce a platform-level concept such as:

`Tenant`

- Potential structure:

```js
Platform Tenant
      │
      ├── Organization
      │      ├── Project
      │      ├── Application
      │      └── Environment
      │
      ├── IAM Configuration
      │
      ├── Security Configuration
      │
      └── Entitlements
```

- We need to discuss whether Tenant and Organization should be the same thing in TraceMind, or whether Tenant should be a higher SaaS boundary.

- I lean toward having:

```js
Tenant
↓
Organization
```

- if we truly intend to sell IAM/Security as standalone products to other companies.

#### 23. Why This Matters

- Imagine:

- Customer A

- Uses:

```js
TraceMind Observability

- TraceMind IAM
- TraceMind Security
```

- Customer B

- Uses:

`TraceMind IAM only`

- for their own SaaS.

- Customer C

- Uses:

`TraceMind Security`

- but not TraceMind IAM.

- Customer D

- Uses:

```js
TraceMind IAM
+
Security
```

- with their own OIDC identity provider.

- All four should be possible without changing the core architecture.

#### 24. Proposed Product-Level Modules

- I would now redefine our modules as:

```js
TraceMind Platform
│
├── Core Platform
│
├── IAM
│
├── Security
│
├── Entitlement / Billing
│
└── Observability
```

- And Observability itself:

```js
Observability
├── Logs
├── Metrics
├── Traces
├── APM
├── Sessions
├── Alerts
├── Incidents
├── Dashboards
└── AIOps
```

- This gives us a clean commercial model.

#### 25. Revised IAM Plan

- I would now redesign STEP 3 as:

```js
STEP 3 — TraceMind IAM
│
├── 3.1 IAM Architecture
│
├── 3.2 Identity Domain
│
├── 3.3 Principal Model
│
├── 3.4 Identity Provider Abstraction
│
├── 3.5 TraceMind Managed Identity
│
├── 3.6 External Identity Integration
│
├── 3.7 User & Membership
│
├── 3.8 Role
│
├── 3.9 Permission
│
├── 3.10 Scope
│
├── 3.11 RBAC
│
├── 3.12 UBAC
│
├── 3.13 Authorization Engine
│
├── 3.14 Authentication
│
├── 3.15 Session Management
│
├── 3.16 MFA
│
├── 3.17 Invitations
│
├── 3.18 API Keys
│
├── 3.19 Service Accounts
│
├── 3.20 Security Events
│
├── 3.21 IAM Audit
│
├── 3.22 Entitlement Integration
│
└── 3.23 IAM SDK/API
```

#### 26. Revised Security Plan

- And separately:

```js

STEP 4 — TraceMind Security
│
├── 4.1 Security Architecture
├── 4.2 Cryptographic Architecture
├── 4.3 Key Management
├── 4.4 Encryption Service
├── 4.5 Decryption Service
├── 4.6 Secret Management
├── 4.7 Credential Protection
├── 4.8 Key Rotation
├── 4.9 Security Policies
├── 4.10 Organization Security Configuration
├── 4.11 Application Security Configuration
├── 4.12 Environment Security Configuration
├── 4.13 Customer KMS Integration
├── 4.14 Security Audit
├── 4.15 Security SDK
└── 4.16 Security Entitlements
```

#### 27. And Entitlement Must Become Shared Infrastructure

- Our previous:

`STEP 4 → Module & Entitlement`

- should probably move earlier conceptually.

- Because:

```js
IAM;
Security;
Observability;
```

- all depend on entitlements.

- Architecture:

```js
                 Entitlement Engine
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
       IAM          Security      Observability
        │               │               │
   User limits      Encryption      Log volume
   MFA features     Key limits      Retention
   SSO              KMS             APM
```

- We don't necessarily have to implement Billing immediately, but Entitlement must be a platform capability.

#### 28. Customer Database Choice Should Be an Entitlement

- For example:

```js
Customer Plan
      │
      └── Identity Storage
             │
             ├── MANAGED
             └── EXTERNAL
```

- Enterprise:

```js
Identity Provider:
OIDC / SAML
```

- Higher tier:

`Customer-managed identity`

- This means product packaging can control what is available.

#### 29. One More Feature I Strongly Recommend

- Because you're planning this as a standalone IAM product:

- **Developer / Application Identity**

- We need to distinguish:

`Human Identity`

- from:

`Application Identity`

- Eventually:

```js
Users
Service Accounts
Machine Identities
API Keys
OAuth Clients
```

- Example:

```js
Customer SaaS
↓
OAuth Client
↓
TraceMind IAM
↓
Access Token
```

- This is essential if customers will embed your IAM into their own products.

#### 30. Final Architecture I Would Freeze Before Coding

- At this stage, I would target:

```js
                         TRACE MIND PLATFORM
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
             CORE              IAM             SECURITY
                │                 │                 │
                │          ┌──────┴──────┐          │
                │          │             │          │
                │      PLATFORM      CUSTOMER       │
                │       IDENTITY      IDENTITY      │
                │          │             │           │
                │          │        ┌────┴─────┐     │
                │          │        │          │     │
                │          │     MANAGED    EXTERNAL│
                │          │        │          │     │
                │          │        DB       OIDC/   │
                │          │                 SAML    │
                │          │                       │
                └──────────┼───────────────────────┘
                           │
                     AUTHORIZATION
                           │
                    ┌──────┼──────┐
                    │      │      │
                   Role Permission Scope
                    │      │      │
                    └──────┼──────┘
                           │
                     ENTITLEMENT
                           │
                 ┌─────────┼─────────┐
                 ↓         ↓         ↓
                IAM    SECURITY   OBSERVABILITY
```

- My Strong Recommendation

- Do not start creating IAM tables yet.

- We have uncovered several architectural decisions that should be settled first:

**A. Platform boundary**

```js
Tenant;
Organization;
```

- Do we need both?

**B. Identity ownership**

```js
TraceMind-managed
Customer-managed
External IdP
```

- Exactly which options will V1 support?

**C. Authorization ownership**

- Even if customer owns identity:

```js
Who owns roles?
Who owns permissions?
Who owns scopes?
```

- My recommendation: `TraceMind IAM owns authorization`, while identity can be managed by either TraceMind or an external provider.

**D. Entitlement boundary**

`Who enforces user limits?`

My recommendation: `Entitlement Engine`, not IAM.

**E. Security boundary**

- Encryption, key management, secrets and cryptographic operations should be a `separate Security service`, consumed by IAM and other modules.

**F. Deployment model**

- Eventually we should support:

```js
TraceMind Cloud
Self-hosted IAM
Private Cloud
Customer VPC
```

- That will affect how we design configuration, keys, storage adapters, and service communication.

- So I would now pause implementation at STEP 3.1 and have our next architecture discussion specifically around these four things:

```js
1. Tenant vs Organization architecture
2. Managed Identity vs Customer Identity vs External IdP
3. IAM Role + Permission + Scope + Membership model
4. IAM/Security/Entitlement service boundaries
```

- Once those four are frozen, then we design the database schema. That will prevent us from having to redesign IAM after implementation starts.
