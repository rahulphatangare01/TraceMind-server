## TraceMind Security Core — Implementation Roadmap

- Overall position in TraceMind roadmap

```js
STEP 1 → Project Foundation ✅
STEP 2 → Multi-Tenant Foundation ✅
STEP 3 → Security Core ← NEXT
STEP 4 → TraceMind IAM
STEP 5 → Entitlement & Licensing
STEP 6 → Full TraceMind Security Product
STEP 7 → Telemetry Foundation
STEP 8 → Observability
STEP 9 → Dashboards / Alerts / Incidents
STEP 10 → AIOps / Intelligence
STEP 11 → Advanced Enterprise Security
```

- Security Core is therefore not the complete Security Product.

- It is the cryptographic/security infrastructure underneath IAM and the rest of TraceMind.

#### 1. Security Core objective

- At the end of Security Core implementation, we should have:

```js
Security Core
│
├── Crypto Abstraction
│
├── Key Abstraction
│
├── Encryption
│ └── Encryption Envelope
│
├── Decryption
│
├── Hashing
│
├── Password Hashing
│
├── Signing
│
├── HMAC
│
├── Security Context
│
├── Key Provider Interface
│
├── Local Key Provider
│
├── Key Version Model
│
├── Security Errors
│
├── Security Configuration
│
├── Security Audit Hooks
│
└── Comprehensive Tests
```

- But not yet:

```js
❌ Customer KMS UI
❌ AWS KMS integration
❌ Azure Key Vault integration
❌ GCP KMS integration
❌ Secret-management UI
❌ Customer key management dashboard
❌ Key rotation scheduler
❌ Security administration portal
❌ Customer security policies UI
```

- Those belong to the later Security Product.

#### 2. Implementation philosophy

- There are five rules I want us to follow.

- **Rule 1 — No business module directly uses Node crypto**

- Bad:

```js
crypto.createCipheriv(...)
crypto.createHash(...)
crypto.createHmac(...)
```

- inside IAM, Tenant, Telemetry, etc.

- Instead:

```js
security.encrypt(...)
security.hash(...)
security.sign(...)
```

- **Rule 2 — Security Core must not know about IAM**

- Security Core should not contain:

```js
User
Role
Permission
Membership
Session
Organization Owner
```

- It should only understand security primitives and security context.

- **Rule 3 — Provider abstraction before provider implementation**

- We first define:

`KeyProvider`

- Then:

`LocalKeyProvider`

- Later:

```js
AwsKmsProvider;
AzureKeyVaultProvider;
GcpKmsProvider;
VaultProvider;
```

- **Rule 4 — Existing functionality must not break**

- Security Core must initially be additive.

- We do not immediately modify:

```js
Organization;
Project;
Application;
Environment;
```

- to encrypt existing fields.

- First we prove the Security Core independently.

- Then IAM consumes it.

- Then other modules gradually migrate.

#### Rule 5 — Every security operation must be testable independently

- For example:

```js
encrypt → decrypt
hash → verify
sign → verify
rotate → decrypt old data
wrong context → reject
wrong key → reject
tampered ciphertext → reject
```

#### 3. Phase structure

- I recommend 10 phases.

```js
PHASE 0 → Security Core Foundation
PHASE 1 → Crypto Abstraction
PHASE 2 → Key Abstraction & Key Lifecycle
PHASE 3 → Encryption Envelope
PHASE 4 → Hashing
PHASE 5 → Signing & HMAC
PHASE 6 → Security Context
PHASE 7 → Provider Architecture
PHASE 8 → Local Provider
PHASE 9 → Security Service / Public API
PHASE 10 → Testing, Hardening & Integration Readiness
```

##### PHASE 0 — Security Core Foundation

- Goal

- Create the module without touching existing business functionality.

- Proposed structure:

```js
src/
└── modules/
└── security-core/
├── domain/
├── application/
├── infrastructure/
├── providers/
├── errors/
├── types/
├── constants/
├── utils/
├── security-core.container.ts
└── index.ts
```

- More detailed:

```js
security-core/
│
├── domain/
│ ├── enums/
│ ├── models/
│ └── value-objects/
│
├── application/
│ ├── services/
│ └── interfaces/
│
├── infrastructure/
│ └── repositories/
│
├── providers/
│ ├── interfaces/
│ └── local/
│
├── errors/
│
├── types/
│
├── constants/
│
├── utils/
│
├── security-core.container.ts
└── index.ts

```

- Deliverables

```js
Security Core module
configuration
dependency injection boundary
public exports
security-specific errors
no business-module changes
```

- Validation

- Existing APIs must behave exactly as before.

##### PHASE 1 — Crypto Abstraction

- Goal

- Define the abstraction between TraceMind and cryptographic implementation.

- We need to avoid designing the API around Node's `crypto` package.

- Conceptually:

```js
interface CryptoProvider {
encrypt(...): Promise<...>;
decrypt(...): Promise<...>;

hash(...): Promise<...>;
verifyHash(...): Promise<boolean>;

sign(...): Promise<...>;
verifySignature(...): Promise<boolean>;

hmac(...): Promise<...>;
verifyHmac(...): Promise<boolean>;
}
```

- But we should not blindly use this exact interface during implementation. We'll refine it based on the key-provider/envelope design.

- Define

```js
EncryptionAlgorithm;
HashAlgorithm;
SignatureAlgorithm;
HmacAlgorithm;
```

- For example:

```js
AES-256-GCM
Argon2id
HMAC-SHA-256
Ed25519 / provider-backed signing
```

- Important

- Algorithms should be represented as explicit types/enums.

- No magic strings throughout the application.

##### PHASE 2 — Key Abstraction & Lifecycle

- This is one of the most important phases.

- Goal

- Create a provider-independent key model.

- We need to represent:

```js
Key
Key Version
Key Purpose
Key Scope
Key Status
Key Provider
```

- Conceptually:

```js
SecurityKey
    │
    ├── id
    ├── purpose
    ├── scope
    ├── provider
    └── versions
            │
            ├── v1
            ├── v2
            └── v3
```

- Key purposes

- For example:

```js
ENCRYPTION;
SIGNING;
HMAC;
KEY_WRAPPING;
```

- Key lifecycle

```js
PENDING
   ↓
ACTIVE
   ↓
DECRYPT_ONLY
   ↓
DISABLED
   ↓
DESTROYED
```

- Important behavior

- New encryption:

`ACTIVE version only`

- Decryption:

```js
ACTIVE;
DECRYPT_ONLY;
```

- depending on policy.

##### PHASE 3 — Encryption Envelope

- This phase creates the actual durable encryption format.

- This is foundational because encrypted data may survive for years.

- Conceptually:

```js
{
"version": 1,
"algorithm": "AES-256-GCM",
"keyId": "...",
"keyVersion": 1,
"iv": "...",
"authTag": "...",
"ciphertext": "..."
}
```

- Potentially we also include authenticated metadata/context.

- **Requirements**

- Encryption must support:

```js
plaintext
↓
encryption context
↓
key selection
↓
DEK
↓
AES-256-GCM
↓
envelope
```

- Decryption:

```js
envelope
↓
validate envelope
↓
resolve key
↓
validate context
↓
decrypt
↓
plaintext
```

- Tests

- We must test:

```js
normal encryption/decryption
corrupted ciphertext
invalid authentication tag
invalid key ID
invalid key version
malformed envelope
wrong context
unsupported algorithm
missing fields
```

##### PHASE 4 — Hashing

- This phase is deliberately separate from encryption.

- Goal

- Provide irreversible security operations.

```js
security.hash();
security.verifyHash();
```

- And specialized operations:

```js
security.hashPassword();
security.verifyPassword();
```

- Password

- Use:

`Argon2id`

- with configurable but centrally controlled parameters.

- **Token/API key hashing**

- We should provide appropriate high-entropy token hashing/verification.

- Example:

```js
API key
↓
hash
↓
database
```

- Never:

```js
API key
↓
encrypt
↓
database
```

- when the original secret does not need to be recovered.

- Tests

```js
same password verifies
wrong password fails
malformed hash fails safely
hash uniqueness/salt behavior
timing-safe verification where appropriate
```

##### PHASE 5 — Signing & HMAC

- Now implement integrity/authenticity primitives.

- Digital signatures

- Concept:

```js
payload
↓
private key
↓
signature
```

- Verification:

```js
payload + signature
↓
public key
↓
valid / invalid
```

- Potential use cases:

```js
JWT
signed configuration
signed events
webhook signatures
inter-service messages
```

- HMAC

- For shared-secret authentication:

```js
payload + secret
↓
HMAC
↓
signature
```

- Verification must use constant-time comparison.

##### PHASE 6 — Security Context

- This phase connects Security Core to our multi-tenant architecture.

- Security Core should understand:

```js
scope;
organization;
project;
application;
environment;
classification;
purpose;
```

- Example:

```js
{
scope: "APPLICATION",
organizationId: "...",
projectId: "...",
applicationId: "...",
classification: "SECRET",
purpose: "DATABASE_CREDENTIAL"
}
```

- Data classifications

```js
PUBLIC;
INTERNAL;
CONFIDENTIAL;
SENSITIVE;
HIGHLY_SENSITIVE;
SECRET;
```

- Security purposes

- Examples:

```js
PASSWORD;
API_KEY;
DATABASE_CREDENTIAL;
OAUTH_CLIENT_SECRET;
WEBHOOK_SECRET;
MFA_SECRET;
TELEMETRY_CREDENTIAL;
INTEGRATION_CREDENTIAL;
SESSION_SECRET;
```

- The purpose matters because later we can enforce policies such as:

```js
DATABASE_CREDENTIAL
→ must be encrypted

PASSWORD
→ must be hashed

WEBHOOK_SECRET
→ encrypted + HMAC usage
```

##### PHASE 7 — Provider Architecture

- Now we make the system truly provider-independent.

- Architecture:

```js
SecurityService
       │
       ▼
CryptoProvider
       │
       ▼
KeyProvider
       │
 ┌─────┴─────────────┐
 │                   │
Local             External
Provider          Providers
                      │
              ┌───────┼────────┐
              │       │        │
             AWS    Azure     GCP
```

- We should define provider interfaces before implementing external providers.

- Required abstractions

```js
KeyProvider;
CryptoProvider;
SecretProvider;
SigningProvider;
```

- We may discover during implementation that some of these should be combined or separated.

- The important thing is that Security Core owns the contract.

##### PHASE 8 — Local Provider

- Only now do we implement the first concrete provider.

- For local development/self-hosted V1:

```js
LocalCryptoProvider;
LocalKeyProvider;
```

- The local provider should use secure application configuration / protected key material.

- But there is an important rule:

`Production TraceMind Cloud should not depend on an application .env master key as the long-term production architecture.`

- Local provider exists for:

```js
development
testing
local/self-hosted deployments
CI
controlled environments
```

- Later we can implement:

```js
AwsKmsProvider;
AzureKeyVaultProvider;
GcpKmsProvider;
VaultProvider;
```

- without changing IAM or application modules.

##### PHASE 9 — Security Service / Public API

- Now we expose the clean developer-facing API.

- Instead of modules interacting with providers directly:

`localKeyProvider.encrypt(...)`

- we want:

- securityCore.encrypt(...)

- Conceptually:

```js
securityCore.encrypt(value, securityContext);
```

```js
securityCore.decrypt(encryptedValue, securityContext);
```

```js
securityCore.hashPassword(password);
```

```js
securityCore.verifyPassword(password, hash);
```

```js
securityCore.sign(payload, context);
```

```js
securityCore.verifySignature(payload, signature, context);
```

- This becomes the only interface normal TraceMind modules should use.

##### PHASE 10 — Testing, Hardening & Integration Readiness

- This phase should be substantial.

- Security Core isn't finished merely because the functions work.

- We need:

```js
Unit tests
Crypto
Key
Envelope
Hash
Sign
HMAC
Context
Provider
```

- Integration tests

```js
SecurityService
↓
Provider
↓
Key lifecycle
↓
Encryption
↓
Decryption
```

- Security tests

- Test:

```js
tampered ciphertext
wrong key
wrong version
wrong tenant
wrong organization
wrong application
wrong environment
invalid context
replayed data where applicable
malformed envelope
disabled key
destroyed key
provider unavailable
```

- Rotation tests

```js
v1 ACTIVE
↓
encrypt
↓
rotate
↓
v1 DECRYPT_ONLY
v2 ACTIVE
↓
new encryption → v2
old ciphertext → still decrypts
```

- This test is mandatory before IAM integration.

#### 4. Database strategy during Security Core

- I recommend we do not introduce a large security database schema immediately.

- Security Core initially needs only the minimum persistence necessary for its chosen local key model and metadata.

- We should first determine whether key metadata needs:

```js
security_keys;
security_key_versions;
```

- and what should actually be persisted locally versus held by the provider.

- The design should avoid storing raw master keys in MySQL.

- For example:

```js
MySQL
│
├── key_id
├── provider
├── provider_reference
├── current_version
├── status
└── metadata
```

- Not:

`❌ master_key = "actual-secret-key"`

- The exact schema should be designed immediately before Phase 2/7 implementation, after the interfaces are agreed.

#### 5. What will NOT change in existing modules

- During Security Core:

- **Tenant module**

- No change.

```js
Organization;
Project;
Application;
Environment;
```

- continue working.

- **Request context**

- No change.

```js
requestId;
traceId;
spanId;
```

- continue working.

- **API response**

- No change.

- **Existing repositories**

- No change.

- **Existing authentication**

- There isn't a full IAM yet, so no change.

- This makes Security Core a non-breaking foundational addition.

#### 6. Integration order after Security Core

- Once Security Core is stable:

```js
Security Core
      ↓
IAM
      ↓
API Keys
      ↓
Sessions
      ↓
MFA
      ↓
OAuth / SSO
```

- Then:

```js
Entitlement
↓
Security Product
```

- Then:

```js
Telemetry
↓
Credential protection
↓
Sensitive telemetry
↓
Redaction
↓
Encryption policies
```

#### 7. Suggested implementation sequence

- When we actually start coding, I recommend not jumping phase-to-phase blindly.

- We will work like this:

```js
PHASE 0
Foundation
   ↓
Review
   ↓
PHASE 1
Crypto contracts
   ↓
Review
   ↓
PHASE 2
Key model
   ↓
Review
   ↓
PHASE 3
Encryption envelope
   ↓
Review
   ↓
PHASE 4
Hashing
   ↓
Review
   ↓
PHASE 5
Signing/HMAC
   ↓
Review
   ↓
PHASE 6
Security context
   ↓
Review
   ↓
PHASE 7
Provider abstraction
   ↓
Review
   ↓
PHASE 8
Local provider
   ↓
Review
   ↓
PHASE 9
Security service
   ↓
Review
   ↓
PHASE 10
Tests + hardening
   ↓
SECURITY CORE COMPLETE
```

#### 8. Definition of Done

- I would not declare Security Core complete until all of these are true:

- **Architecture**

```js
    - No business module directly depends on Node crypto.
    - Crypto provider is abstracted.
    - Key provider is abstracted.
    - Local provider is replaceable.
    - Security Core has no IAM dependency.
    - Security Core has no Tenant business dependency.
```

- **Encryption**

```js
  - AES-256-GCM implemented.
  - Encryption envelope defined.
  - Key ID stored.
  - Key version stored.
  - Authentication tag verified.
  - Encryption context supported.
  - Wrong context rejected.
  - Tampered ciphertext rejected.
```

- **Keys**

```js
  - Key model defined.
  - Key version model defined.
  - ACTIVE supported.
  - DECRYPT_ONLY supported.
  - DISABLED supported.
  - DESTROYED supported.
  - Rotation model tested.
  - Old ciphertext remains decryptable after rotation.
```

- **Hashing**

```js
  - Argon2id password hashing.
  - Password verification.
  - Token hashing.
  - API key hashing.
  - No recoverable passwords.
```

- **Signing**

```js
  - Signing abstraction.
  - Verification abstraction.
  - HMAC support.
  - Constant-time verification where applicable.
```

- **Context**
  - Organization context.
  - Project context.
  - Application context.
  - Environment context.
  - Data classification.
  - Security purpose.

- **Reliability**

```js
  - Provider failure handled.
  - Invalid key handled.
  - Invalid envelope handled.
  - No silent fallback to insecure provider.
  - Existing TraceMind APIs unaffected.
```

- **Tests**
  - Unit tests.
  - Integration tests.
  - Negative/security tests.
  - Key rotation tests.
  - Cross-tenant isolation tests.
  - Provider failure tests.

#### 9. The most important dependency rule

- We should freeze this architecture now:

```js
                        TraceMind Modules
                               │
              ┌────────────────┼────────────────┐
              │                │                │
             IAM           Telemetry       Integrations
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ Security Core │
                       └───────┬───────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
              Crypto         Keys         Context
                 │             │             │
                 └─────────────┼─────────────┘
                               │
                         Provider API
                               │
                     ┌─────────┴─────────┐
                     │                   │
                 Local Provider     External KMS
                                      (future)
```

- And specifically:

```js
IAM ───────────────► Security Core
Tenant ────────────► Security Core
Telemetry ─────────► Security Core
Integration ───────► Security Core

Security Core ──X──► IAM
Security Core ──X──► Tenant
Security Core ──X──► Telemetry
```

- That dependency direction will prevent the security layer from becoming tightly coupled to TraceMind's current business model.

#### 10. Final roadmap we should follow

```js
 ╔══════════════════════════════════════════════════════╗
║             TRACEMIND SECURITY CORE                  ║
╚══════════════════════════════════════════════════════╝

PHASE 0
Security Core Foundation
        ↓
PHASE 1
Crypto Abstraction
        ↓
PHASE 2
Key Abstraction & Lifecycle
        ↓
PHASE 3
Encryption / Decryption Envelope
        ↓
PHASE 4
Hashing & Password Security
        ↓
PHASE 5
Signing & HMAC
        ↓
PHASE 6
Security Context & Classification
        ↓
PHASE 7
Provider Architecture
        ↓
PHASE 8
Local Provider
        ↓
PHASE 9
Security Service / Public API
        ↓
PHASE 10
Testing / Hardening / Isolation
        ↓
        ▼
╔══════════════════════════════════════════════════════╗
║          SECURITY CORE STABLE                        ║
╚══════════════════════════════════════════════════════╝
        ↓
        IAM can safely start
        ↓
        Entitlement
        ↓
        Full Security Product
        ↓
        Customer KMS / Vault / HSM
```

- I recommend we freeze this roadmap before implementation.

- For the actual implementation, we should start with Phase 0 only and build/review the folder structure, configuration boundary, errors, types, and container first. Then we can move to Phase 1 after the foundation compiles and existing TraceMind APIs remain green.
