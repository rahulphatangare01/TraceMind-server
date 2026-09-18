## Security product Phase plan

### Phase 11 — Security Product Foundation

- Goal

- Convert the reusable Security Core into an actual TraceMind Security Product.

- Architecture:

```js
                    TraceMind Security Product
                              │
                 ┌────────────┴────────────┐
                 │                         │
            REST API                  Security Core
                 │                         │
            Controllers              Encryption
                 │                    Hashing
             Services                 Signing
                 │                    HMAC
           Repositories                  │
                 │                       │
                 └───────────┬───────────┘
                             │
                         Database
```

- **Work**

```js
Security Product module
Application layer
Controllers
Services
Repository interfaces
DTOs
Validation
API response contracts
Error handling
Security module configuration
```

- **Result**

- We have a proper product boundary around Security Core.

### Phase 12 — Security Database & Persistence

- This is the important missing part currently.

- Your current:

`LocalKeyProvider`

- is only:

```js
Memory
↓
Map<string, ...>
```

- It must eventually become:

```js
Security Service
↓
Repository
↓
MySQL
```

- **Core tables**

- We should design these carefully:

```js
security_keys;
security_key_versions;

security_configurations;

security_secrets;
security_secret_versions;

security_audit_events;

security_policies;
```

- Potentially later:

```js
security_key_access_logs;
security_secret_access_logs;
security_provider_configs;
security_rotation_policies;
```

- **Key database model**

```js
security_keys
│
└── security_key_versions
│
├── v1
├── v2
└── v3
```

- Important

- We should never store raw encryption key material directly in normal application tables.

- Instead:

```js
security_key_versions
↓
provider_key_reference
↓
KMS / Vault / secure provider
```

- For the local development provider, we can temporarily use protected local storage.

### Phase 13 — Key Management Service

- Now customers can actually manage keys.

**Customer operations**

- 1. Create key

  `POST /security/keys`

- Conceptually:

```js
Customer
↓
API
↓
Key Management Service
↓
KeyProvider
↓
Database
```

- 2. Retrieve key metadata

     `GET /security/keys/:keyId`

- Important:

- Customer receives:

```js
keyId;
purpose;
scope;
status;
currentVersion;
provider;
timestamps;
```

NOT:

    `raw key material`

- 3. List keys

  `GET /security/keys`

- 4. Rotate key

  `POST /security/keys/:keyId/rotate`

Result:

```js
v1 → DECRYPT_ONLY
v2 → ACTIVE
```

- 5.  Get key version

  `GET /security/keys/:keyId/versions/:version`

- 6.  Change key status

Later:

```js
ACTIVE;
DECRYPT_ONLY;
DISABLED;
DESTROYED;
```

### Phase 14 — Security Configuration

- Customers need organization/application-level security configuration.

Example hierarchy:

```js
Organization
↓
Project
↓
Application
↓
Environment
```

- Configuration can define:

```js
Default encryption policy
Default classification
Allowed algorithms
Key provider
Key rotation policy
Secret policy
Data retention
Audit policy
Security requirements
```

- Example:

```js
Organization A
├── encryption = enabled
├── default classification = CONFIDENTIAL
├── key rotation = 90 days
└── audit = enabled
```

### Phase 15 — Secrets & Credentials

- This becomes another major Security Product capability.

- Customers should be able to securely manage:

```js
API keys
Database credentials
OAuth client secrets
Webhook secrets
SMTP credentials
Integration credentials
Access tokens
Application secrets
```

- Architecture:

```js
Customer
↓
Secret API
↓
Secret Service
↓
EncryptionService
↓
Key Management
↓
Secure Provider
```

Database stores encrypted secret data, not plaintext.

- **Important distinction**

```js
Key Management
≠
Secret Management
```

Keys protect encrypted data.

Secrets are the sensitive data being protected.

### Phase 16 — Security APIs

Now expose the complete customer-facing REST API.

- Possible API structure:

```js
/security
│
├── /keys
├── /configurations
├── /secrets
├── /policies
└── /audit
```

- **Key APIs**

```js
POST /security/keys
GET /security/keys
GET /security/keys/:id
POST /security/keys/:id/rotate
GET /security/keys/:id/versions
PATCH /security/keys/:id/status
```

- **Encryption APIs**

Potentially:

```js
POST / security / encrypt;
POST / security / decrypt;
```

But we need to be careful here.

For a SaaS product, generic plaintext encryption/decryption over REST can create serious security risks.

For many use cases, the preferred model will eventually be:

```js
Customer Application
↓
TraceMind Security SDK
↓
Security Service
```

rather than sending sensitive plaintext through a generic public API unnecessarily.

So we should design this carefully when we reach Phase 16.

### Phase 17 — Authentication & Authorization Integration

This is where your previously planned IAM comes in.

- Architecture becomes:

```js
Customer
↓
Authentication
↓
IAM
↓
Authorization
↓
Security API
↓
Security Service
↓
Security Core

```

- IAM determines:

  `WHO`

- Security determines:

  `HOW DATA IS PROTECTED`

- Authorization determines:

  `WHAT THEY CAN ACCESS`

- Example:

```js
User
↓
IAM
↓
Can user rotate this organization's key?
↓
YES
↓
Security Key Service
↓
Rotate

```

### Phase 18 — Security Audit & Activity

Every sensitive security operation should be auditable.

Examples:

```js
KEY_CREATED;
KEY_ACCESSED;
KEY_ROTATED;
KEY_DISABLED;

SECRET_CREATED;
SECRET_ACCESSED;
SECRET_UPDATED;
SECRET_DELETED;

ENCRYPTION_REQUESTED;
DECRYPTION_REQUESTED;

SECURITY_CONFIGURATION_CHANGED;
```

- Audit should record things such as:

```js
organizationId;
actorId;
action;
resourceType;
resourceId;
requestId;
traceId;
timestamp;
result;
```

But never log plaintext secrets or raw key material.

### Phase 19 — Customer Security Dashboard

Only after APIs and backend are stable.

- Dashboard areas:

```js
Security Overview
│
├── Keys
├── Key Versions
├── Rotation
├── Secrets
├── Security Policies
├── Configuration
└── Audit Activity
```

- Customer can see:

```js
Active keys
Key versions
Rotation status
Security events
Secret metadata
Security configuration
Security warnings
```

### Phase 20 — Production Provider / KMS Integration

- Finally replace/extend the local provider.

```js
Security Service
       ↓
Provider Abstraction
       ↓
 ┌─────┼────────┬─────────┐
 ↓     ↓        ↓         ↓
Local AWS      Azure     GCP
      KMS      Key Vault  KMS
```

Later:

```js
HashiCorp Vault
Customer KMS
HSM
Private Cloud
Customer VPC
```

This is where your original requirement of customer-managed keys / customer database / enterprise deployment becomes real.

#### Complete Architecture

- After all these phases, the architecture should look like:

```js
                        CUSTOMER
                       │
                       ▼
              Security Product API
                       │
                       ▼
              Authentication / IAM
                       │
                       ▼
                Authorization
                       │
                       ▼
              Security Services
                 │          │
                 │          │
                 ▼          ▼
          Key Management   Secrets
                 │          │
                 └────┬─────┘
                      ▼
                Security Core
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      Encryption    Hashing    Signing/HMAC
          │
          ▼
     Provider Layer
          │
     ┌────┼──────────────┐
     ▼    ▼              ▼
   Local  AWS KMS    Customer KMS
          │
          ▼
       DATABASE
```

**Current Progress**

- This is the important part to keep us aligned:

```js
SECURITY CORE

Phase 0 ✅
Phase 1 ✅
Phase 2 ✅
Phase 3 ✅
Phase 4 🔵 NEXT
Phase 5 ⏳
Phase 6 ⏳
Phase 7 ⏳
Phase 8 ⏳
Phase 9 ⏳
Phase 10 ⏳

SECURITY PRODUCT

Phase 11 ⏳ Foundation
Phase 12 ⏳ Database
Phase 13 ⏳ Key Management
Phase 14 ⏳ Security Configuration
Phase 15 ⏳ Secrets
Phase 16 ⏳ APIs
Phase 17 ⏳ IAM Integration
Phase 18 ⏳ Audit
Phase 19 ⏳ Dashboard
Phase 20 ⏳ Production KMS
```

The key point

currently here:

`Security Core → Phase 4 Hashing`

And database/API/customer functionality has deliberately not started yet.

The correct overall direction is:

`Core → Provider → Persistence → Service → API → IAM → Customer → Dashboard/KMS`
