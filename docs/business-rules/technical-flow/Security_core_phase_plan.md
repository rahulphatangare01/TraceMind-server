### PHASE 0 → Security Core Foundation

- We need these architectural concepts:

```js
Security Core
│
├── SecurityContext
│
├── DataClassification
│
├── SecurityPurpose
│
├── SecurityScope
│
├── KeyPurpose
│
├── KeyStatus
│
├── Algorithm identifiers
│
├── Security errors
│
└── Provider boundaries
```

- We should not yet implement:

```js
❌ AES encryption
❌ Argon2
❌ HMAC
❌ signing
❌ key generation
❌ key rotation
❌ KMS

```

- Those belong to subsequent phases.

```js
KeyPurpose
    ↓
What the cryptographic key does

SecurityPurpose
    ↓
Why the application is protecting the data
```

- For example:

```js
KeyPurpose: ENCRYPTION;

SecurityPurpose: DATABASE_CREDENTIAL;
```

- **Provider boundary**

- We are not implementing the provider yet.

- But the architecture should reserve:

```js
providers/
└── interfaces/
```

- The next phase will define the actual interfaces.

- For Phase 0, the important architectural rule is:

```js
Business modules
      ↓
Security Core
      ↓
Provider abstraction
      ↓
Concrete provider
```

- Never:

```js
IAM ───────► Node crypto
Telemetry ─► Node crypto
Tenant ────► Node crypto
```

##### Phase 0 completion criteria

```js
[ ] security-core module created
[ ] module boundary established
[ ] SecurityScope created
[ ] DataClassification created
[ ] SecurityPurpose created
[ ] KeyPurpose created
[ ] KeyStatus created
[ ] algorithm identifiers created
[ ] SecurityContext created
[ ] security errors created
[ ] public index created
[ ] container created
[ ] TypeScript build passes
[ ] existing tenant APIs still work
[ ] no existing module modified unnecessarily
```

### Phase 1 — Crypto Abstraction

- **1. Phase objective**

- At the end of Phase 1, we want this architecture:

```js
                    TraceMind Modules
                           │
                           ▼
                  ┌──────────────────┐
                  │  Security Core   │
                  │                  │
                  │  SecurityService  │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ CryptoProvider   │
                  │   Interface      │
                  └────────┬─────────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
             Encrypt     Hash       Sign
             Decrypt     Verify     Verify
                │          │          │
                └──────────┼──────────┘
                           │
                    Implementation
                       later

```

- The critical boundary is:

```js
IAM / Telemetry / Integrations
              │
              ▼
        Security Core API
              │
              ▼
       CryptoProvider
              │
              ▼
       Crypto implementation
```

- No business module should know about Node's crypto APIs.

- **2. What Phase 1 contains**

- We'll define five contract groups:

```js
Phase 1
│
├── Encryption / Decryption
│
├── Hashing / Verification
│
├── Signing / Verification
│
├── HMAC / Verification
│
└── CryptoProvider
```

- And supporting types:

```js
├── Request types
├── Result types
├── Algorithm enums
├── Encoding types
└── Crypto errors
```

- **3. Important architecture decision**

- There are actually two different abstractions in our Security architecture:

```js
CryptoProvider
│
└── Cryptographic operations

KeyProvider
│
└── Key lifecycle / storage / retrieval
```

- We should not merge these.

- Phase 1 focuses on:

- CryptoProvider

- Phase 2 will properly define:

```js
KeyProvider
SecurityKey
KeyVersion
Key lifecycle
```

- This separation is important for KMS.

- For example, eventually:

```js
Security Core
│
├── CryptoProvider
│
└── KeyProvider
│
├── Local
├── AWS KMS
├── Azure Key Vault
└── GCP KMS
```

- **4. Directory structure**

- Add:

```js
src/modules/security-core/
│
├── application/
│   ├── interfaces/
│   │   └── crypto.provider.interface.ts
│   │
│   └── services/
│
├── domain/
│   ├── enums/
│   │   ├── encryption-algorithm.enum.ts
│   │   ├── hash-algorithm.enum.ts
│   │   ├── signature-algorithm.enum.ts
│   │   ├── hmac-algorithm.enum.ts
│   │   └── encoding.enum.ts
│   │
│   ├── models/
│   │   └── security-context.ts
│   │
│   └── value-objects/
│
├── providers/
│   └── interfaces/
│
├── types/
│   ├── encryption.types.ts
│   ├── hashing.types.ts
│   ├── signing.types.ts
│   ├── hmac.types.ts
│   └── crypto.types.ts
│
├── errors/
│
├── constants/
│
├── security-core.container.ts
└── index.ts

```

- **5. Encoding abstraction**
- Before defining requests, we need to standardize how binary cryptographic material is represented.
- **6. Encryption request**
- **7. Encryption result**
- **8. Decryption request**
- **9. Decryption result**
- \*\*10. Why context exists on both encrypt and decrypt

- Suppose:

```js
Organization A
Application X
```

- encrypts:

`database-password`

- Someone shouldn't be able to take that ciphertext and ask:

```js
Organization B
Application Y
```

- to decrypt it.

- Therefore:

```js
Encrypt
   ↓
context A
   ↓
ciphertext

Decrypt
   ↓
context B
   ↓
REJECT
```

- The actual enforcement mechanism will be refined in Phase 3, but the abstraction must support it from day one.
- **11. Hashing abstraction**

- Hashing is fundamentally different from encryption.
- **12. Password hashing needs a higher-level abstraction**

- Although generic hashing exists, passwords deserve a specialized API.

- Later we'll expose:

```js
hashPassword(password);
verifyPassword(password, hash);
```

- rather than making IAM know:

`algorithm = ARGON2ID`

- Why?

- Because we may later tune Argon2id parameters without changing IAM.

- So eventually:

```js
IAM
 │
 └── hashPassword()
          │
          ▼
      Security Core
          │
          ▼
       Argon2id
```

- This will be implemented in a later phase.

- **13. Signing abstraction**
- **14. HMAC abstraction**
- **15. CryptoProvider interface**
- **16. One important adjustment**

- I would not implement CryptoProvider against Node crypto yet.

- That's Phase 1's biggest trap.

- Phase 1 should end with:

```js
interfaces + types + validation + errors;
```

- not actual crypto implementation.

- The first actual crypto implementation belongs after we have finalized the key architecture.

- **17. Why we're not putting `key` into every request yet**

- You may notice something interesting.

- Encryption request has:

`context`

- but not:

`key: Buffer`

- This is intentional.

- We don't want:

```js
IAM
↓
raw encryption key
↓
CryptoProvider
```

- Instead:

```js
Security Core
│
├── Security Context
│
├── CryptoProvider
│
└── KeyProvider
```

- Phase 2 will establish exactly how:

```js
context
↓
key selection
↓
key reference
↓
provider
```

- works.

- That prevents us from accidentally designing the wrong dependency now.

- **18. Crypto errors**
- **19. Export all Phase 1 types** -**20. Phase 1 should NOT expose raw cryptographic primitives**
- **21. What about random secrets?**
- **22. Phase 1 testing**
- Since we're not implementing crypto yet, tests should focus on contracts and type safety.

- Compile test
  `npm run build`
- Existing application test

- Verify:

```js
Organization APIs
Project APIs
Application APIs
Environment APIs
```

- continue to work.

- Contract tests

- We should eventually create provider contract tests that say:

```js
Any CryptoProvider implementation MUST:
    encrypt
    decrypt
    hash
    verifyHash
    sign
    verifySignature
    createHmac
    verifyHmac
```

- This becomes extremely valuable when we add:

```js
LocalCryptoProvider;
AwsCryptoProvider;
AzureCryptoProvider;
```

- because every provider must pass the same contract suite.

- **23. Phase 1 definition of done**

```js
- PHASE 1 — CRYPTO ABSTRACTION

[ ] CryptoEncoding defined
[ ] Encryption contracts defined
[ ] Decryption contracts defined
[ ] Hash contracts defined
[ ] Hash verification contracts defined
[ ] Signing contracts defined
[ ] Signature verification contracts defined
[ ] HMAC contracts defined
[ ] HMAC verification contracts defined
[ ] CryptoProvider interface defined
[ ] Crypto-specific errors defined
[ ] Public exports updated
[ ] No Node crypto implementation yet
[ ] No raw keys passed into business APIs
[ ] SecurityContext integrated into security operations
[ ] npm build passes
[ ] Existing TraceMind APIs remain unchanged
```

- **24. What comes next**

- After Phase 1 is green, do not jump to AES implementation.

- The correct next phase is:

- **Phase 2 — Key Abstraction & Key Lifecycle**

- There we will settle the most sensitive remaining architecture:

```js
SecurityKey
     │
     ├── keyId
     ├── purpose
     ├── scope
     ├── provider
     └── versions
             │
             ├── v1 ACTIVE
             ├── v2 ACTIVE
             └── v3 DECRYPT_ONLY
```

- And specifically design:

```js
KeyProvider
KeyReference
KeyVersion
KeyStatus
KeyPurpose
Key selection
Key ownership
Key scope
DEK lifecycle
Master-key relationship
Key rotation contract
Key destruction contract
```

- Only after Phase 2 is finalized should we implement the actual AES-256-GCM encryption envelope.

### Phase 2 — Key Abstraction & Key Lifecycle

- Now we move to the most foundational part of Security Core.

- Phase 1 defined what cryptographic operations look like. Phase 2 defines `which key is used, where it comes from, how it is versioned, and how it moves through its lifecycle.`

- We should still `not implement AWS KMS, Azure Key Vault, customer KMS, or the actual encryption algorithm yet.`

- **1. Phase 2 objective**

- At the end of this phase, the architecture should support:

```js
Security Operation
       │
       ▼
Security Context
       │
       ▼
Key Selection
       │
       ▼
Key Reference
       │
       ▼
Key Version
       │
       ▼
Key Provider
```

- For example:

```js
Encrypt database credential
        │
        ▼
Organization: org_123
Application: app_456
Purpose: DATABASE_CREDENTIAL
Classification: SECRET
        │
        ▼
select appropriate key
        │
        ▼
key_organization_secret
        │
        ▼
version 3
        │
        ▼
provider
```

- **2. The key architecture we are freezing**

- Our model will be:

```js
                 Root / Master Key
                        │
                        │ protects
                        ▼
              Data Encryption Key
                        │
             ┌──────────┼──────────┐
             │          │          │
          Secret A   Secret B   Secret C
```

- We will not derive encryption keys directly from:

```js
organizationId;
projectId;
applicationId;
environmentId;
```

- Instead, these IDs are used as `security context and key-selection metadata.`

- **3. Key hierarchy**

- The logical hierarchy is:

```js
PLATFORM
   │
   ├── platform keys
   │
   └── ORGANIZATION
          │
          ├── org key
          │
          └── PROJECT
                │
                └── APPLICATION
                      │
                      └── ENVIRONMENT
```

- But we should `not automatically create a physical KMS key for every node.`

- Instead:

```js
Logical Security Scope
│
▼
Key Selection Policy
│
▼
Physical Key / DEK
```

- This prevents key explosion.

- **4. Key entity**
- Important

- `SecurityKey` does not contain:

```js
❌ raw key material
❌ master key
❌ plaintext secret
```

- It represents the logical key identity.

- **5. Key version**

- The important distinction:

```js
SecurityKey
    =
logical key

SecurityKeyVersion
    =
specific cryptographic generation
```

- So:

```js
key_123
   │
   ├── v1
   ├── v2
   └── v3
```

- **6. Why `providerKeyReference` exists**

- Suppose the provider is AWS KMS.

- We don't store:

`AWS master key material`

- Instead:

```js
provider = AWS_KMS
providerKeyReference = arn:aws:kms:...
```

- For Azure:

```js
provider = AZURE_KEY_VAULT
providerKeyReference = ...
```

- For local:

```js
provider = LOCAL;
providerKeyReference = local - key - reference;
```

- Security Core doesn't need to know the physical representation.

- **7. Key status lifecycle**

- We already decided:

```js
PENDING
   │
   ▼
ACTIVE
   │
   ▼
DECRYPT_ONLY
   │
   ▼
DISABLED
   │
   ▼
DESTROYED

```

- But we need strict transition rules.

- **PENDING**

- Key exists but cannot be used.

- Allowed:

```js
PENDING → ACTIVE
PENDING → DISABLED
```

- **ACTIVE**

- Used for new encryption/signing operations.

- Allowed:

```js
ACTIVE → DECRYPT_ONLY
ACTIVE → DISABLED
DECRYPT_ONLY
```

- Old version.

- Allowed:

`DECRYPT_ONLY → DISABLED`

- **DISABLED**

- No cryptographic operations.

- Allowed:

`DISABLED → DESTROYED`

- **DESTROYED**

- Terminal.

`DESTROYED → nothing`

- **8. Critical rule: status is not enough**

- A key's status doesn't alone determine whether an operation is allowed.

- We also need:

```js
Operation
+
Key Purpose
+
Key Status
+
Security Context
```

- For example:

```js
ENCRYPT
    +
ACTIVE
    +
ENCRYPTION key
    =
allowed
```

- But:

```js
ENCRYPT
    +
DECRYPT_ONLY
    =
rejected
```

- while:

```js
DECRYPT
    +
DECRYPT_ONLY
    =
potentially allowed
```

- This distinction is essential for rotation.

- **9. Key reference**

- We need an abstraction that can travel between CryptoProvider and KeyProvider.

- Later we may add:

```js
provider;
purpose;
scope;
```

- but don't duplicate information unnecessarily.

- The `keyId + version` combination should uniquely identify a cryptographic key version.

- **10. Key provider interface**

- Now we can define the second major abstraction.

- **11. Key creation request**

- This means a key can be created for:

```js
PLATFORM;
ORGANIZATION;
PROJECT;
APPLICATION;
ENVIRONMENT;
```

- **12. Key-selection request**

- This is more important than simply getKey().

- Then:

`resolveKey(request)`

- returns:

`KeyReference`

- This gives us:

```js
Security Context
↓
Resolve Key
↓
Key Reference
```

- **13. Why resolveKey() is critical**

- Imagine IAM calls:

`security.encryptSecret(...)`

- IAM should not have to know:

```js
Which key?
Which version?
Which provider?
Where is it stored?
```

- Instead:

```js
Security Context
↓
KeyResolver
↓
KeyReference
↓
CryptoProvider
```

- This keeps key-management completely centralized.

- **14. Key selection strategy**

- For V1, I recommend deterministic logical selection:

```js
purpose

- scope
- tenant hierarchy
```

- Example:

```js
DATABASE_CREDENTIAL - APPLICATION - org_123 - app_456;
```

- resolves to:

`key_app_456_database_credential`

- But we should allow policy-based resolution later.

- For example:

```js
SECRET
→ organization-level key

SENSITIVE telemetry
→ application-level key

HIGHLY_SENSITIVE
→ environment-level key
```

- That belongs to the future Security Policy engine.

- **15. Master key vs DEK**

- We should make the relationship explicit.

```js
Provider Master Key
│
│ wraps
▼
Data Encryption Key
│
│ encrypts
▼
Application Data
```

- Security Core should never expose:

`masterKey: Buffer`

- to IAM.

- The application gets a controlled key reference.

- **16. Local provider model**

- Our local implementation later can conceptually have:

```js
Local Master Key
       │
       └── wraps
             │
             ├── DEK v1
             ├── DEK v2
             └── DEK v3
```

- The actual storage mechanism will be decided in Phase 8.

- For now, only the abstraction matters.

- **17. Key rotation**

- Rotation must create a new version, not overwrite the existing key.

- Example:

```js
key_database_credentials

v1 → ACTIVE
```

- Rotate:

```js
key_database_credentials

v1 → DECRYPT_ONLY
v2 → ACTIVE
```

- New encryption:

`→ v2`

- Existing ciphertext:

`→ v1`

- remains decryptable.

- **18. Rotation API**

- Conceptually:

```js
rotateKey({
  keyId: "key_123",
});
```

- returns:

```js
{
keyId: "key_123",
version: 2,
status: "ACTIVE"
}

```

- The old version becomes:

`v1 = DECRYPT_ONLY `

- **19. Key destruction**

- We should not implement automatic destruction.

- There is a major difference between:

`rotation`

- and:

`destruction`

- Rotation is normal.

- Destruction can make historical data permanently unreadable.

- Therefore:

`destroyKey()`

- will eventually require:

```js
explicit authorization
audit event
policy check
retention check
confirmation
```

- The API should exist conceptually, but actual destructive workflow belongs to the later Security Product.

- **20. Provider abstraction vs key repository**

- Another important distinction.

- Eventually we may have:

```js
KeyRepository
      │
      └── stores key metadata

KeyProvider
      │
      └── performs cryptographic key operations
```

- Don't confuse them.

- For example:

```js
MySQL
 └── key metadata

AWS KMS
 └── actual cryptographic key operations
```

- This separation will be extremely useful for customer-managed KMS.

- **21. Recommended domain model**

- Our final conceptual model becomes:

```js
SecurityKey
│
├── id
├── purpose
├── scope
├── organizationId
├── projectId
├── applicationId
├── environmentId
├── provider
├── status
└── currentVersion
│
▼
SecurityKeyVersion
│
├── id
├── keyId
├── version
├── status
├── providerKeyReference
├── createdAt
├── activatedAt
├── rotatedAt
├── disabledAt
└── destroyedAt
```

- **22. Security Core dependency model after Phase 2**

```js
                 SecurityService
                       │
          ┌────────────┴────────────┐
          │                         │
    CryptoProvider             KeyProvider
          │                         │
          │                    Key Resolver
          │                         │
          └────────────┬────────────┘
                       │
                Security Context

```

- This is the architecture we want before touching AES.

- **23. Phase 2 implementation order**

- We'll implement this phase in smaller checkpoints:

```js
2.1 Key domain models
↓
2.2 Key status lifecycle
↓
2.3 Key reference types
↓
2.4 Create/resolve key contracts
↓
2.5 KeyProvider interface
↓
2.6 Key lifecycle validation
↓
2.7 Key resolution rules
↓
2.8 Provider-independent tests
↓
2.9 Build + existing API regression check
```

- We should not implement LocalKeyProvider yet.

- **24. Phase 2 definition of done**

```js
    PHASE 2 — KEY ABSTRACTION & LIFECYCLE

[ ] SecurityKey model
[ ] SecurityKeyVersion model
[ ] KeyReference
[ ] CreateKeyRequest
[ ] ResolveKeyRequest
[ ] KeyProvider interface
[ ] Key lifecycle rules
[ ] ACTIVE behavior
[ ] DECRYPT_ONLY behavior
[ ] DISABLED behavior
[ ] DESTROYED terminal behavior
[ ] Key versioning
[ ] Key rotation contract
[ ] Key resolution contract
[ ] Provider reference abstraction
[ ] No raw master key exposed
[ ] No direct KMS implementation
[ ] No database credential migration
[ ] No IAM dependency
[ ] Build passes
[ ] Existing Tenant APIs unaffected

```

- **25. One architectural decision to keep in mind**

- There is a subtle but important relationship between Phase 2 and Phase 3.

- We currently have:

```js
SecurityContext
↓
ResolveKey()
↓
KeyReference
↓
CryptoProvider

```

- Then Phase 3 will turn the result into:

```js
Plaintext
↓
SecurityContext
↓
KeyReference
↓
KeyVersion
↓
DEK
↓
AES-256-GCM
↓
Encryption Envelope

```

- So Phase 2 determines the identity and lifecycle of the key; Phase 3 determines how that key is represented in encrypted data.

- That separation is exactly what will let us support key rotation and customer-managed KMS later without breaking encrypted data.

- Phase 2 is therefore the next implementation checkpoint.

### Phase 3 — Encryption / Decryption Envelope plan

- **1. Phase objective**

- We want this flow:

```js
                    Encrypt
                       │
                       ▼
                Security Context
                       │
                       ▼
                  Key Resolver
                       │
                       ▼
                  Key Version
                       │
                       ▼
                  Encryption Key
                       │
                       ▼
                 AES-256-GCM
                       │
                       ▼
              Versioned Envelope
                       │
                       ▼
                   Database

```

- And decryption:

```js
                    Envelope
                       │
                       ▼
              Parse + Validate
                       │
                       ▼
              Resolve Key Version
                       │
                       ▼
           Validate Security Context
                       │
                       ▼
                 AES-256-GCM
                       │
                       ▼
                    Plaintext
```

- **2. What we are implementing**

- Phase 3 includes:

```js
[✓] AES-256-GCM
[✓] Encryption
[✓] Decryption
[✓] Random IV/nonce
[✓] Authentication tag
[✓] Versioned envelope
[✓] Key ID
[✓] Key version
[✓] Authenticated encryption context
[✓] Envelope serialization
[✓] Envelope validation
[✓] Tamper detection
[✓] Wrong-context detection
[✓] Key rotation compatibility
[✓] Comprehensive tests

```

- Still not included:

```js
[ ] AWS KMS
[ ] Azure Key Vault
[ ] GCP KMS
[ ] Customer-managed KMS
[ ] Security UI
[ ] Automatic key rotation scheduler
[ ] Secret-management UI

```

- Those remain future phases.

- **3. Critical architecture decision: AES-GCM key**

- There is one important implementation detail we need to preserve.

- AES-256-GCM requires a `256-bit encryption key.`

- That key should ultimately come from the KeyProvider architecture we designed in Phase 2.

- Conceptually:

```js
SecurityKey
│
▼
SecurityKeyVersion
│
▼
KeyProvider
│
▼
DEK
│
▼
AES-256-GCM
```

- We should not do:

```js
organizationId
↓
SHA256
↓
AES key

```

- That violates the key architecture we already agreed on.

- **4. Encryption envelope**

- We need a durable envelope.

- I recommend the first format:

```js
interface EncryptionEnvelope {
version: number;

algorithm: EncryptionAlgorithm;
encoding: CryptoEncoding;

keyId: string;
keyVersion: number;

iv: string;
authTag: string;
ciphertext: string;
}

```

- Serialized example:

```js
{
"version": 1,
"algorithm": "AES-256-GCM",
"encoding": "BASE64",
"keyId": "key_123",
"keyVersion": 2,
"iv": "....",
"authTag": "....",
"ciphertext": "...."
}
```

- **5. Why the envelope needs its own version**

- Do not confuse:

`envelope version`

- with:

`key version`

- They solve different problems.

**Envelope version**

- Controls the serialization/cryptographic format.

```js
Envelope v1
Envelope v2
Envelope v3
```

**Key version**

- Controls which cryptographic key was used.

```js
Key v1
Key v2
Key v3
```

- So we could have:

```js
Envelope v1
    +
Key v7
```

- This distinction is extremely important for long-term compatibility.

- **6. IV / nonce**

- AES-GCM requires a unique nonce/IV for every encryption operation under the same key.

- For V1 we should use a 12-byte randomly generated IV.

- Conceptually:

`randomBytes(12)`

- Every encryption gets a fresh IV:

```js
Encryption #1 → IV A
Encryption #2 → IV B
Encryption #3 → IV C
```

- Never reuse the IV with the same AES-GCM key.

- The IV is not secret, so it can safely be stored inside the envelope.

- **7. Authentication tag**

- AES-GCM generates an authentication tag.

- This protects against:

```js
ciphertext modification
IV modification
AAD/context modification
```

- If anything authenticated has changed:

```js
decrypt()
↓
authentication failure
↓
reject
```

- Never return partially decrypted plaintext.

- **8. Authenticated Encryption Context**

- This is one of the most important decisions in Phase 3.

- AES-GCM supports `Additional Authenticated Data (AAD).`

- We should use it.

- Conceptually:

```js
                    AES-256-GCM
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     plaintext       key            AAD
                                      │
                              Security Context

```

- The context is authenticated but not encrypted.

- For example:

```js

{
"scope": "APPLICATION",
"organizationId": "org_123",
"projectId": "project_456",
"applicationId": "app_789",
"environmentId": "env_001",
"classification": "SECRET",
"purpose": "DATABASE_CREDENTIAL"
}

```

- This gets canonicalized and passed as AAD.

- **9. Why AAD matters**

- Suppose ciphertext belongs to:

```js
Organization A
Application A
```

- Someone attempts:

`decrypt(ciphertext, Organization B context)`

- The context doesn't match.

- AES-GCM authentication fails.

- Result:

`DECRYPTION FAILED`

- This provides cryptographic binding between the ciphertext and its intended security context.

- **10. Important security boundary**

- AAD is not authorization.

- The correct sequence remains:

```js
Request
↓
Authentication
↓
IAM Authorization
↓
Security Policy
↓
Context validation
↓
Key resolution
↓
Decrypt

```

- AAD gives us an additional cryptographic guarantee.

- It does not replace IAM.

- **11. Canonical security context**

- We cannot simply do:

`JSON.stringify(context)`

- and assume the result is always canonical.

- Object property ordering can become an accidental compatibility issue.

- Instead, define a canonical representation.

- Conceptually:

```js
scope;
organizationId;
projectId;
applicationId;
environmentId;
classification;
purpose;
```

- in a fixed order.

- Example:

```js
APPLICATION |
  org_123 |
  project_456 |
  app_789 |
  env_001 |
  SECRET |
  DATABASE_CREDENTIAL;
```

- Then:

```js
canonicalContext
↓
UTF-8 bytes
↓
AES-GCM setAAD()
```

- We'll implement this through a dedicated utility/value object rather than scattered string concatenation.

- **12. Do not encrypt the context into the ciphertext**

- The context should generally be:

```js
authenticated
     +
available for validation
```

- not:

`encrypted inside ciphertext`

- The envelope already contains the necessary key/envelope metadata.

- This also makes debugging and key migration much easier.

- **13. Context information and sensitive data**

- One caution:

- Don't put secret values into the context.

- Bad:

```js
{
"databasePassword": "..."
}

```

- Good:

```js
{
"purpose": "DATABASE_CREDENTIAL",
"classification": "SECRET",
"applicationId": "app_123"
}
```

- Context is metadata, not secret data.

- **14. Encryption flow**

- The final intended implementation is:

```js
plaintext
    │
    ▼
Validate input
    │
    ▼
Validate SecurityContext
    │
    ▼
Resolve active key
    │
    ▼
Generate random 12-byte IV
    │
    ▼
Canonicalize context
    │
    ▼
AES-256-GCM
    │
    ├── plaintext
    ├── key
    ├── IV
    └── AAD
    │
    ▼
ciphertext + authTag
    │
    ▼
Create envelope
    │
    ▼
Serialize
```

- **15. Decryption flow**

```js
serialized envelope
        │
        ▼
parse
        │
        ▼
validate envelope version
        │
        ▼
validate algorithm
        │
        ▼
resolve keyId + keyVersion
        │
        ▼
validate key state
        │
        ▼
canonicalize requested context
        │
        ▼
AES-256-GCM
        │
        ├── ciphertext
        ├── key
        ├── IV
        ├── authTag
        └── AAD
        │
        ▼
authentication
        │
   ┌────┴────┐
   │         │
 valid     invalid
   │         │
   ▼         ▼
plain       error
text

```

- **16. Envelope should be immutable**

- Once created:

`ciphertext envelope`

- should never be modified in-place.

- Rotation produces a new envelope:

```js
Old:
key v1

New:
key v2
```

- This gives us reliable historical decryption.

- **17. Key rotation behavior**

- Suppose:

`Key v1 = ACTIVE`

- We encrypt:

```js
Envelope;
keyVersion = 1;
```

- Then rotate:

```js
Key v1 = DECRYPT_ONLY
Key v2 = ACTIVE
```

- New encryption:

```
Envelope
keyVersion = 2
```

- Old envelope:

`keyVersion = 1`

- still decrypts.

- That is the behavior we must test.

- **18. Envelope validation**

- Create a dedicated validator.

- It should reject:

```js
missing version
missing algorithm
unsupported algorithm
missing keyId
invalid keyVersion
missing IV
invalid IV length
missing authTag
invalid authTag length
missing ciphertext
invalid encoding
```

- Don't let malformed encrypted data reach the crypto implementation.

- **19. Encryption envelope types**

- I'd now organize:

```js
src/modules/security-core/domain/models/
└── encryption-envelope.ts
```

- and:

```js
src/modules/security-core/types/
└── encryption.types.ts
```

- The domain model represents the durable envelope.

- The request/result types represent application operations.

- This keeps those concerns separate.

- **20. Recommended EncryptionEnvelope**

- Conceptually:

```js
export interface EncryptionEnvelope {
version: number;

algorithm: EncryptionAlgorithm;
encoding: CryptoEncoding;

keyId: string;
keyVersion: number;

iv: string;
authTag: string;
ciphertext: string;
}
```

- Later, we can extend this with additional authenticated metadata if required.

- But do not add unnecessary fields now.

- **21. Serialization strategy**

- We need two operations:

```js
serializeEnvelope();
deserializeEnvelope();
```

- Conceptually:

`const serialized = serializeEnvelope(envelope);`

- and:

`const envelope = deserializeEnvelope(serialized);`

- For database storage, I recommend initially storing the serialized envelope as a single `TEXT`/appropriate string value.

- Later, if telemetry requires a more efficient binary representation, we can optimize without changing the logical envelope contract.

- **22. Don't expose Node.js crypto**

- Even in Phase 3, this should remain hidden.

- Bad:

`import crypto from "node:crypto";`

- throughout the application.

- Only the concrete cryptographic provider/implementation should depend on Node's crypto API.

- Architecture:

```js
Application
↓
Security Core
↓
CryptoProvider
↓
Local crypto implementation
↓
Node crypto
```

- **23. Error handling**

- We need dedicated errors for this phase.

- Recommended:

```js
InvalidEncryptionEnvelopeError;
EncryptionFailedError;
DecryptionFailedError;
AuthenticationTagMismatchError;
EncryptionContextMismatchError;
InvalidInitializationVectorError;
```

- However, there is an important security consideration:

**Don't leak cryptographic details to external API consumers.**

- Internally we may distinguish:

```js
context mismatch
bad tag
invalid ciphertext
```

- but an external API shouldn't necessarily receive:

`"authentication tag mismatch for key version 3"`

- That can leak implementation information.

- Our later API error mapper can convert sensitive crypto failures into controlled errors.

- **24. Important: don't log plaintext**

- This needs to be an explicit rule.

- Never:

```js
logger.error("Decryption failed", {
  plaintext,
  password,
  secret,
});
```

- Likewise never log:

```js
raw encryption key
DEK
master key
password
API key
refresh token
```

- Security Core should treat these values as sensitive by default.

- **25. Tests we need**

- Phase 3 needs much stronger tests than ordinary business code.

**Basic**

```js
encrypt("hello")
decrypt(...)
→ "hello"
```

**Empty plaintext**

- Decide and test whether:

`""`

- is supported.

- I recommend yes, unless our application layer explicitly forbids empty secrets.

**Unicode**

```js
"नमस्ते";
"こんにちは";
"🔐";
```

- must round-trip correctly.

**Large plaintext**

- Test reasonably large values to verify the implementation isn't accidentally imposing an arbitrary small limit.

- **26. Tampering tests**

- We must modify each component independently:

```js
ciphertext
IV
authTag
keyId
keyVersion
context
algorithm
envelope version
```

- Expected:

`DECRYPTION FAILURE`

- **27. Wrong tenant test**

- This is especially important for TraceMind.

- Encrypt:

```js
org_A;
project_A;
application_A;
```

- Decrypt with:

```js
org_B;
project_B;
application_B;
```

- Expected:

`REJECTED`

- This becomes a critical security regression test.

- **28. Rotation test**

- Test:

```js
Key v1
↓
encrypt
↓
rotate
↓
Key v2
```

- Then:

```js
old envelope → decrypt successfully
new encryption → uses v2
```

- This proves our envelope design works with the Phase 2 lifecycle.

- **29. Provider abstraction test**

- The encryption service shouldn't care whether:

`LocalProvider`

- or:

`FutureAwsKmsProvider`

- is being used.

- The same contract tests should run against every provider.

- This will be extremely useful later.

- **30. What Phase 3 does NOT solve yet**

- There are still some intentionally unresolved implementation details:

**DEK wrapping**

- We know the architecture:

```js
Master key
↓
wrap
↓
DEK
```

- but the exact local-provider implementation belongs to the provider phase.

**Customer KMS**

- Later.

**Automatic rotation**

- Later.

**Key migration**

- Later.

**Secret management**

- Later.

- This prevents Phase 3 from becoming too large.

- **31. Phase 3 implementation checkpoints**

- We'll implement it in this order:

```js
3.1  EncryptionEnvelope model
       ↓
3.2  Envelope serializer/deserializer
       ↓
3.3  Envelope validation
       ↓
3.4  Canonical SecurityContext
       ↓
3.5  AES-256-GCM implementation
       ↓
3.6  AAD integration
       ↓
3.7  Encryption operation
       ↓
3.8  Decryption operation
       ↓
3.9  Key version integration
       ↓
3.10 Error handling
       ↓
3.11 Security tests
       ↓
3.12 Regression tests
```

- **32. Phase 3 definition of done**

```js
    PHASE 3 — ENCRYPTION / DECRYPTION ENVELOPE

Envelope
[ ] Versioned envelope
[ ] Algorithm identifier
[ ] Encoding identifier
[ ] Key ID
[ ] Key version
[ ] IV
[ ] Authentication tag
[ ] Ciphertext
[ ] Serialization
[ ] Deserialization
[ ] Strict validation

AES-GCM
[ ] AES-256-GCM
[ ] 12-byte random IV
[ ] Authentication tag
[ ] Authenticated encryption
[ ] No IV reuse

Security Context
[ ] Canonical context
[ ] Context used as AAD
[ ] Wrong context rejected
[ ] Cross-tenant test

Key lifecycle
[ ] Active key used for encryption
[ ] Key version stored
[ ] Old version decrypts
[ ] Rotation compatibility tested

Security
[ ] Tampered ciphertext rejected
[ ] Tampered IV rejected
[ ] Tampered tag rejected
[ ] Invalid key rejected
[ ] Invalid envelope rejected
[ ] No sensitive logging


Compatibility
[ ] Crypto implementation behind abstraction
[ ] No IAM dependency
[ ] No Tenant module changes
[ ] Existing APIs continue working
[ ] npm build passes

```

- **33. Final architecture after Phase 3**

- At this point our Security Core will look like:

```js


                         Security Core
                              │
             ┌────────────────┼────────────────┐
             │                │                │
       SecurityContext     CryptoProvider    KeyProvider
             │                │                │
             │                │                │
             └────────────────┼────────────────┘
                              │
                       Encryption Service
                              │
                       ┌──────▼──────┐
                       │ AES-256-GCM │
                       └──────┬──────┘
                              │
                    ┌─────────▼─────────┐
                    │ EncryptionEnvelope│
                    │                   │
                    │ version           │
                    │ algorithm         │
                    │ keyId              │
                    │ keyVersion         │
                    │ IV                 │
                    │ authTag            │
                    │ ciphertext         │
                    └───────────────────┘
```

- And the dependency direction remains:

```js
IAM
│
Telemetry
│
Integrations
│
Tenant
│
▼
Security Core
│
├── CryptoProvider
│
└── KeyProvider
```

- One thing I would explicitly freeze before coding

- The envelope format should be treated as a public internal protocol.

- Once we start storing encrypted values in MySQL, changing:

```js
version;
algorithm;
keyId;
keyVersion;
IV;
authTag;
ciphertext;
AAD / context;
```

- carelessly can make old data unreadable.

- Therefore, when we implement Phase 3, we'll build the envelope and its tests before wiring it into any existing Tenant/IAM data.

#### Encryption / Decryption Envelope plan Architecture + implementation planning only.

- The sequence is:

```js
Phase 0 — Security Core Foundation
        ↓
     PLANNED
        ↓
Phase 1 — Crypto Abstraction
        ↓
     PLANNED
        ↓
Phase 2 — Key Abstraction & Lifecycle
        ↓
     PLANNED
        ↓
Phase 3 — Encryption/Decryption Envelope
        ↓
     PLANNED
        ↓
Actual coding
```

- So when you said "proceed next", I interpreted that as proceed to the next phase's design/planning, not start writing the implementation code. That's why you don't see actual Phase 3 implementation in your project.

- More precisely

- We have discussed and designed:

- Phase 0

```js
Security Core module structure
Security enums
Security context
Security errors
module boundary
```

- Phase 1

```js
CryptoProvider
encryption/decryption contracts
hashing contracts
signing contracts
HMAC contracts
request/result types
```

- Phase 2

```js
SecurityKey
SecurityKeyVersion
KeyReference
KeyProvider
key lifecycle
key rotation model
key resolution
```

- Phase 3

```js
AES-256-GCM design
encryption envelope
IV
authentication tag
key ID/version
authenticated context/AAD
serialization
decryption/tamper behavior
```

- But these were design discussions, not actual implementation.

- **Where we are now**

- The important question is whether we should start coding Phase 3 directly.

- I would say no—not yet, because we have another issue:

- We need to confirm that Phase 0, Phase 1, and Phase 2 have actually been implemented in your codebase, not merely planned.

- The conversation history tells me what we designed, but I don't have the current contents of your repository in this chat.

- So we should distinguish:

```js
Architecture completed?
YES

Implementation completed?
UNKNOWN
```

- And I don't want to assume that the earlier code snippets were actually added to your project.

- **Therefore the safe workflow is:**

```js
CHECK CURRENT CODEBASE
↓
Phase 0 implemented?
↓
Phase 1 implemented?
↓
Phase 2 implemented?
↓
If all green
↓
IMPLEMENT PHASE 3
```

- This is particularly important because Phase 3 depends directly on Phase 1 and Phase 2 contracts.

- If we implement AES now against assumptions and later discover that your CryptoProvider or KeyProvider differs, we'll have to rewrite it.

- So, to answer your question clearly:

`We have only created the plan/design for Phase 3. We have not implemented Phase 3 yet.`

- And going forward, I suggest we explicitly label each response as either:

`ARCHITECTURE / PLAN`

- or
  `IMPLEMENTATION`

- so there is no ambiguity.

- For the next step, we should verify what Phase 0–2 actually exist in your code, then begin the real Phase 3 implementation one file at a time.

- **Phase 3 goal**

- Implement:

```js
Plaintext
↓
Security Context
↓
Active Key
↓
AES-256-GCM
↓
IV + Auth Tag + Ciphertext
↓
Versioned Encryption Envelope
```

- And:

```js
Encryption Envelope
↓
Validate
↓
Resolve Key + Version
↓
Validate Security Context
↓
AES-256-GCM decrypt
↓
Plaintext
```

- **3.1 Directory structure**

- **Phase 3 architecture**

- The final flow is:

```js

                    EncryptionService
                           │
                           │
                 Resolve active key
                           │
                           ▼
                     KeyProvider
                           │
                    Key ID + Version
                           │
                           ▼
                  KeyMaterialProvider
                           │
                     32-byte key
                           │
                           ▼
                  LocalCryptoProvider
                           │
                    AES-256-GCM
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
             IV         Auth Tag     Ciphertext
              │            │            │
              └────────────┼────────────┘
                           ▼
                  Encryption Envelope
```

- For decryption:

```js
Encryption Envelope
        │
        ▼
Validate envelope
        │
        ▼
Resolve keyId + keyVersion
        │
        ▼
Get key material
        │
        ▼
Recreate AAD from SecurityContext
        │
        ▼
AES-256-GCM authentication
        │
        ├── valid → plaintext
        │
        └── invalid → reject
```

- The important architectural rule is:

```js
SecurityKey
      ↓
metadata

KeyMaterialProvider
      ↓
actual secret key
```

- `SecurityKey` should never contain raw key material.

- Therefore our Phase 3 architecture should be

```js

                 EncryptionService
                        │
                        ▼
                Key Selection
                        │
                 keyId = key_x
                        │
                        ▼
          KeyProvider.getActiveVersion(key_x)
                        │
                        ▼
                 version = 3
                        │
                        ▼
       KeyMaterialProvider.getKeyMaterial(
                    key_x, 3
       )
                        │
                        ▼
             LocalCryptoProvider
                        │
                        ▼
                  AES-256-GCM
```

- **So the current Phase 3 position is:**

```js
Phase 3
│
├── AES-256-GCM                    ✅
├── Encryption                     ✅
├── Decryption                     ✅
├── Random IV                      ✅
├── Authentication Tag             ✅
├── Versioned Envelope             🟡
├── Key ID                         🟡
├── Key Version                    🟡
├── Authenticated Context/AAD      ✅
├── Envelope Serialization         ✅
├── Envelope Validation            ✅
├── Tamper Detection               🟡 TESTING
├── Wrong Context Detection        🟡 TESTING
├── Key Rotation Compatibility     🟡 TESTING
└── Comprehensive Tests             ❌
```

- The remaining work is primarily the integration + verification layer:

```js
Phase 3 remaining
        │
        ├── 1. Complete EncryptionService
        │       └── keyId → getActiveVersion(keyId)
        │
        ├── 2. Complete envelope integration
        │
        ├── 3. Test tampering
        │
        ├── 4. Test wrong SecurityContext
        │
        ├── 5. Test key v1 → v2 rotation
        │
        └── 6. Run complete Phase 3 test suite

```

### Phase 4: Encryption / Decryption Hashing.

- **Phase 4 objective**

- The goal is to add hashing capabilities to Security Core without coupling them to IAM.

```js
Security Core
│
├── Encryption ✅ Phase 3
│
└── Hashing ← Phase 4
├── Password hashing
├── Hash verification
├── Secure salt handling
├── Algorithm abstraction
└── Provider independence
```

- What we will implement

- **1. Hashing abstraction**

- Use the existing crypto abstraction rather than calling Node `crypto` directly from business modules.

- **2. Password hashing**

- Use `Argon2id` for passwords.

- Important distinction:

```js
Password → Argon2id
General deterministic fingerprint/integrity use cases → SHA-256 where appropriate
Passwords should never use plain SHA-256.
```

- **3. Hash result**

- The hash needs to retain the information required for verification, including the algorithm/configuration parameters through the standard encoded Argon2 representation.

- **4. Verification**

```js
Plain password
↓
Hash
↓
Stored hash
↓
Verify(password, storedHash)
↓
true / false
```

- **5. Security rules**

```js
Never log plaintext passwords.
Never decrypt a password hash.
Hashing is one-way.
Different password hashes should normally differ because of unique salts.
Verification must use the parameters embedded in the stored hash.
IAM will consume this capability later.
```

- **Phase 4 boundary**

- We should not implement yet:

```js
Login/authentication
User registration
IAM password policies
MFA
JWT
Sessions
Signing
HMAC
Key management changes
```

- Those belong to later phases.

- **Phase 4 implementation sequence**

```js
4.1 → Hashing types/contracts
4.2 → Hash provider implementation
4.3 → Argon2id password hashing
4.4 → Hash verification
4.5 → Provider integration
4.6 → Security Core public API
4.7 → Manual verification test
4.8 → Automated tests
```

- **Phase 4 implementation we will build**

```js
Phase 4 — Hashing
│
├── 4.1 Hashing types/contracts
│   ├── HashAlgorithm
│   ├── HashRequest
│   └── HashResult
│
├── 4.2 Hash provider implementation
│   └── HashProvider / LocalHashProvider
│
├── 4.3 Argon2id password hashing
│   ├── random salt
│   ├── Argon2id
│   └── secure parameters
│
├── 4.4 Hash verification
│   └── verify plaintext against stored hash
│
├── 4.5 Provider integration
│   └── Security Core provider wiring
│
├── 4.6 Security Core public API
│   └── exports
│
├── 4.7 Manual verification test
│   ├── hash
│   ├── verify
│   └── different hashes for same password
│
└── 4.8 Automated tests
    ├── valid password
    ├── invalid password
    ├── unique salt
    ├── malformed hash
    └── algorithm validation

```

- **Important architectural decision**

- We will not modify or replace your existing CryptoProvider contract.

Instead:

```js
CryptoProvider
      │
      ├── Encryption       ✅ Phase 3
      ├── Hashing          ← Phase 4
      ├── Signing          → Phase 5
      └── HMAC             → Phase 5
```

- For password hashing:

```js
Password
   ↓
Argon2id
   ↓
Salt + parameters
   ↓
Encoded password hash
   ↓
Database later
```

And later IAM will simply consume Security Core:

```js
IAM
 ↓
Security Core
 ↓
hash / verifyHash
```

**Phase 4 architecture**

```js
CryptoProvider
│
├── encrypt()          ✅ Phase 3
├── decrypt()          ✅ Phase 3
│
├── hash()             ← Phase 4
├── verifyHash()       ← Phase 4
│
├── sign()             ← Phase 5
├── verifySignature()  ← Phase 5
├── createHmac()       ← Phase 5
└── verifyHmac()       ← Phase 5
```

And the implementation will be:

```js
EncryptionService
       ↓
CryptoProvider
       ↓
LocalCryptoProvider
       ↓
Argon2id
```

- **Phase 4 implementation plan**

- We will implement all 4.1 → 4.8:

```js
Phase 4 — Hashing
│
├── 4.1 Hashing contracts/types        ✅ Already available
│
├── 4.2 Hash implementation
│   └── LocalCryptoProvider.hash()
│
├── 4.3 Argon2id password hashing
│   └── argon2 package
│
├── 4.4 Hash verification
│   └── LocalCryptoProvider.verifyHash()
│
├── 4.5 Provider integration
│   └── security-core.container.ts
│
├── 4.6 Public API
│   └── index.ts exports
│
├── 4.7 Manual test
│   └── hash → verify
│
└── 4.8 Automated tests
    └── Vitest
```

#### Phase 4 — Hashing Implementation

4.1 Hashing Types/Contracts
4.2 + 4.3 — Implement Hashing in LocalCryptoProvider
4.4 — Implement verifyHash()
4.5 — Provider Integration
4.6 — Security Core Public API
4.7 — Manual Hash Test
4.8 — Automated Tests

### Phase 5 → Signing & HMAC

```js
5.1 Signing types/contracts
5.2 Signature provider implementation
5.3 Ed25519 signing
5.4 Signature verification
5.5 HMAC types/contracts
5.6 HMAC creation
5.7 HMAC verification
5.8 Provider integration
5.9 Security Core public API
5.10 Manual verification
5.11 Automated tests
```

- **Phase 5 goal**: secure digital signatures + HMAC, while keeping the architecture provider-agnostic for future KMS/HSM integration.

- **Goal**

- Build a provider-agnostic cryptographic layer for:

```js
Digital signatures → Ed25519
Signature verification
HMAC generation → HMAC-SHA-256
HMAC verification
Secure encoding and validation
Integration with the existing CryptoProvider
Tests and manual verification
```

##### Phase 5 Implementation Plan

- **5.1 — Signing Types / Contracts**

- Create/verify:

```js
types/
├── signing.types.ts
└── hmac.types.ts
```

- Signing

```js
SignRequest;
SignResult;
VerifySignatureRequest;
VerifySignatureResult;
```

- HMAC

```js
CreateHmacRequest;
CreateHmacResult;
VerifyHmacRequest;
VerifyHmacResult;
```

We'll define exactly what goes into each request/result before implementation.

- **5.2 — Cryptographic Constants**

- Add:

```js
constants/
└── signing.constants.ts
```

- Define:

```js
ED25519
HMAC-SHA-256
signature encoding
HMAC encoding
```

We should avoid hardcoding algorithm names throughout the provider.

- **5.3 — Signing Algorithm**

- Implement `Ed25519` using Node's native:

`node:crypto`

Flow:

```js

Message
   ↓
Private Key
   ↓
Ed25519 Sign
   ↓
Signature
```

Verification:

```js
Message
   ↓
Public Key + Signature
   ↓
Ed25519 Verify
   ↓
true / false
```

Important:

- Ed25519 signing is different from hashing.

- Hashing:

`password → hash`

- Signing:

`message + privateKey → signature`

- Architecture

```js
SignRequest
    ↓
LocalCryptoProvider
    ↓
Signing Key Provider
    ↓
Private Key
    ↓
Ed25519
    ↓
SignResult
```

- system different cryptographic purposes:

```js
AES-256-GCM
    → symmetric encryption key

HMAC
    → symmetric secret

Ed25519
    → asymmetric private/public key pair
```

This separation will make future KMS/HSM integration much cleaner.

- **5.4 — Signing Key Handling**

- We need to decide how Phase 5 obtains keys.

For the current Security Core:

```js
LocalCryptoProvider
       ↓
KeyMaterialProvider
       ↓
Local implementation
```

However, private/public signing keys must not be treated exactly like AES encryption keys.

We'll introduce the appropriate abstraction rather than putting private keys directly inside `LocalCryptoProvider`.

For development:

`Local Signing Key Provider`

Later:

```js
AWS KMS
Azure Key Vault
GCP KMS
HashiCorp Vault
HSM
```

- **5.5 — Signature Verification**

Implement:

`verifySignature()`

Test cases will include:

```js
Correct message + correct signature       → true
Modified message + signature              → false
Wrong public key                           → false
Malformed signature                        → false
```

```js
Sign
  ↓
Signature
  ↓
Verify
  ↓
true

Modified payload
  ↓
Verify
  ↓
false

Wrong key
  ↓
Verify
  ↓
false
```

- **5.6 — HMAC Types / Contracts**

Implement:

```js
CreateHmacRequest;
CreateHmacResult;

VerifyHmacRequest;
VerifyHmacResult;
```

Algorithm:

`HMAC-SHA-256`

- Flow:

```js
Message + Secret
      ↓
   HMAC-SHA-256
      ↓
    HMAC

```

```js
CreateHmacRequest
       │
       ├── payload
       ├── algorithm
       └── SecurityContext
              │
              ▼
       HmacKeyProvider
              │
              ├── secret
              ├── keyId
              └── keyVersion
              │
              ▼
        HMAC-SHA-256
              │
              ▼
       CreateHmacResult
```

- **5.7 — HMAC Implementation**

Use Node:

`createHmac()`

For verification, use:

`timingSafeEqual()`

This is important because HMAC comparison should not use a normal string comparison for security-sensitive verification.

```js
VerifyHmacRequest
       │
       ├── keyId
       └── keyVersion
              ↓
     HmacKeyProvider
              ↓
       exact HMAC key
              ↓
       HMAC-SHA-256
              ↓
       timingSafeEqual
              ↓
        true / false
```

- **5.8 — Update LocalCryptoProvider**

After all Phase 5 operations exist:

`export class LocalCryptoProvider implements CryptoProvider`

will finally become valid.

Complete provider:

```js
LocalCryptoProvider
│
├── encrypt() ✅
├── decrypt() ✅
├── hash() ✅
├── verifyHash() ✅
├── sign() 🆕
├── verifySignature() 🆕
├── createHmac() 🆕
└── verifyHmac() 🆕
```

- **5.9 — Security Core Public API**

Update:

`security-core/index.ts`

to expose the Phase 5 contracts/enums/providers that are intended to be public.

- **5.10 — Manual Verification**

Create:

```js
__tests__/
└── phase-5/
    └── manual-signing-hmac-test.ts
```

Verify:

**Ed25519**

```js
Generate keys
↓
Sign message
↓
Verify signature
↓
Modify message
↓
Verification fails
```

**HMAC**

```js
Create HMAC
↓
Verify correct message
↓
true

Modify message
↓
false

```

- **5.11 — Automated Tests**

- Create separate tests:

```js
__tests__/
└── phase-5/
    ├── local-signing.spec.ts
    └── local-hmac.spec.ts
```

Expected coverage:

**Signing**

```js
1. Sign message
2. Signature is generated
3. Same message can be verified
4. Modified message fails
5. Wrong public key fails
6. Malformed signature fails
7. Different messages produce different signatures
8. Unsupported algorithm fails
```

**HMAC**

```js
1. Create HMAC
2. Correct value verifies
3. Incorrect value fails
4. Modified message fails
5. Same message + same secret produces same HMAC
6. Different secret produces different HMAC
7. HEX encoding
8. BASE64 encoding
9. Malformed HMAC fails
10. Unsupported algorithm fails
```

- **Final Phase 5 Structure**

After completion, the Security Core should look approximately like:

```js
security-core/
│
├── application/
│ ├── interfaces/
│ │ ├── crypto.provider.interface.ts
│ │ ├── key.provider.interface.ts
│ │ └── signing-key.provider.interface.ts
│ │
│ └── services/
│ └── encryption.service.ts
│
├── constants/
│ ├── encryption.constants.ts
│ └── signing.constants.ts
│
├── domain/
│ ├── enums/
│ │ ├── encryption-algorithm.enum.ts
│ │ ├── hash-algorithm.enum.ts
│ │ ├── signing-algorithm.enum.ts
│ │ └── hmac-algorithm.enum.ts
│ │
│ └── models/
│
├── providers/
│ ├── interfaces/
│ │ ├── key-material.provider.interface.ts
│ │ └── signing-key.provider.interface.ts
│ │
│ └── local/
│ ├── local-key.provider.ts
│ ├── local-key-material.provider.ts
│ └── local-crypto.provider.ts
│
├── types/
│ ├── encryption.types.ts
│ ├── encryption-envelope.types.ts
│ ├── hashing.types.ts
│ ├── signing.types.ts
│ └── hmac.types.ts
│
├── errors/
│
├── utils/
│
├── **tests**/
│ └── phase-5/
│ ├── local-signing.spec.ts
│ ├── local-hmac.spec.ts
│ └── manual-signing-hmac-test.ts
│
└── index.ts
```

```js
                    securityCore
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
 KeyProvider      SigningKeyProvider   HmacKeyProvider
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                 LocalCryptoProvider
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      Encryption       Hashing       Signing/HMAC
```

### PHASE 6 → Security Context

- **1. Phase Objective**

The objective of Phase 6 is to make SecurityContext a strong, validated security boundary for the entire Security Core.

After Phase 6, every security-sensitive operation should be able to answer:

`Which tenant/resource does this operation belong to, what sensitivity level does the data have, and what security purpose is the operation serving?`

The target architecture is:

```js
                          SecurityContext
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
       Scope         Classification      Purpose
          │                │                │
          ↓                ↓                ↓
 Organization       SENSITIVE          DATABASE_CREDENTIAL
 Project             SECRET            API_KEY
 Application         HIGHLY_SENSITIVE   REFRESH_TOKEN
 Environment         CONFIDENTIAL       SIGNING
```

This context will eventually be consumed by:

```js
Encryption
Hashing
Signing
HMAC
Key Management
Secrets
Security Policies
Audit
KMS
Telemetry Security
```

- **2. Phase 6 Architecture**

The architecture we want is:

```js
                    ┌─────────────────────┐
                    │   SecurityContext   │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │ Context Validator   │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │ Context Normalizer  │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │ Canonical Context   │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ↓                 ↓                 ↓
        Encryption          Signing            HMAC

```

The important principle:

- Security Context should be centralized.

We don't want individual services doing their own validation like:

```js
if (!organizationId) ...
if (!projectId) ...
```

Instead:

```js
SecurityContext
↓
SecurityContextValidator
↓
Validated SecurityContext
↓
Security operation
```

- **3. Phase 6 Detailed Roadmap**

Here is the complete trackable plan.

- **PHASE 6.1 → SecurityContext Contract Review**

- Objective

Review and freeze the existing `SecurityContext` contract before introducing validation.

- Existing model

```js
interface SecurityContext {
scope: SecurityScope;

organizationId?: string;
projectId?: string;
applicationId?: string;
environmentId?: string;

classification: DataClassification;
purpose: SecurityPurpose;
}
```

- Tasks

```js
- Review current interface.
- Review SecurityScope.
- Review DataClassification.
- Review SecurityPurpose.
- Check existing Phase 3–5 usage.
- Identify backward-compatibility requirements.
- Confirm whether fields should remain optional at the raw contract level.
- Define the difference between:
       - raw context
       - validated context
       - normalized context.
```

- Deliverable

Frozen SecurityContext contract.

- Status

`6.1 ⬜ Not Started`

- **PHASE 6.2 → Security Scope Rules**
  Objective

Define exactly what each scope means.

- Expected scopes:

```js
PLATFORM;
ORGANIZATION;
PROJECT;
APPLICATION;
ENVIRONMENT;
FIELD;
```

Conceptually:

```js
PLATFORM
   │
   └── Organization
          │
          └── Project
                 │
                 └── Application
                        │
                        └── Environment
                               │
                               └── Field
```

- Define rules

For example:

- PLATFORM

```js
organizationId → not required
projectId → not required
applicationId → not required
environmentId → not required
```

- ORGANIZATION

```js
organizationId → required
projectId → absent
applicationId → absent
environmentId → absent
```

- PROJECT

```js
organizationId → required
projectId → required
applicationId → absent
environmentId → absent
```

- APPLICATION

```js
organizationId → required
projectId → required
applicationId → required
environmentId → optional
```

- ENVIRONMENT

```js
organizationId → required
projectId → required
applicationId → required
environmentId → required
```

- FIELD

Field scope needs special consideration because field-level security may eventually require additional information such as:

```js
resource;
entity;
field;
```

We should not invent those fields yet without reviewing the existing model.

- Deliverable

Formal scope matrix.

- Status
  `6.2 ⬜ Not Started`

- **PHASE 6.3 → Hierarchy Validation Rules**

- Objective

Ensure the context cannot represent an invalid hierarchy.

Example:

```js
projectId exists
BUT
organizationId missing
```

should be invalid.

Similarly:

```js
environmentId exists
BUT
applicationId missing
```

should be invalid.

Expected hierarchy:

```js
Environment
↓ requires
Application
↓ requires
Project
↓ requires
Organization
```

- Validate

```js
Parent IDs.
Child IDs.
Scope consistency.
No orphan context.
No invalid combinations.
```

- Example invalid context

```js
{
scope: SecurityScope.PROJECT,
projectId: "project-123",
classification: ...,
purpose: ...
}
```

if `organizationId` is mandatory for project scope.

- Deliverable

Hierarchy validation rules.

- Status
  `6.3 ⬜ Not Started`

- **PHASE 6.4 → Required/Forbidden Context Fields**

This is related to 6.3 but should be explicitly defined.

For every scope we determine:

```js
Required fields
Optional fields
Forbidden fields
```

Example:

| Scope        | Organization | Project  | Application | Environment |
| ------------ | ------------ | -------- | ----------- | ----------- |
| PLATFORM     | —            | —        | —           | —           |
| ORGANIZATION | Required     | —        | —           | —           |
| PROJECT      | Required     | Required | —           | —           |
| APPLICATION  | Required     | Required | Required    | Optional    |
| ENVIRONMENT  | Required     | Required | Required    | Required    |

This matrix becomes the source of truth for validation.

- Deliverable

Scope-field policy matrix.

- Status
  `6.4 ⬜ Not Started`

- **PHASE 6.5 → SecurityContext Zod Schema**

- Objective

Introduce runtime validation.

Because TypeScript only validates at compile time.

Security Context can come from:

```js
API requests
SDKs
background jobs
event consumers
internal services
configuration
future plugins
```

Therefore runtime validation is necessary.

Expected location:

```js
src/modules/security-core/schemas/
└── security-context.schema.ts
```

Potential structure:

```js
const securityContextSchema = z.object({
scope: ...,
organizationId: ...,
projectId: ...,
applicationId: ...,
environmentId: ...,
classification: ...,
purpose: ...,
});
```

But scope-dependent validation should not be handled only by a static schema.

We will combine:

```js
Zod structural validation
       +
Business/security validation
```

- Deliverable

Runtime SecurityContext schema.

- Status
  `6.5 ⬜ Not Started`

- **PHASE 6.6 → SecurityContextValidator**

- Objective

Create the central validator.

Expected location:

```js
src/modules/security-core/application/services/
└── security-context-validator.service.ts
```

Responsibilities:

```js
Validate structure
↓
Validate scope
↓
Validate hierarchy
↓
Validate required IDs
↓
Validate forbidden IDs
↓
Validate classification
↓
Validate purpose
↓
Return validated context

```

- Example API:

```js
validate(
context: SecurityContext,
): ValidatedSecurityContext
```

Potentially:

`validateOrThrow(...)`

depending on the existing error architecture.

Important

This service should not:

```js
authenticate users
check IAM permissions
query organizations
check database ownership
```

Those belong to later layers.

Phase 6 validates the shape and security semantics of the context, not authorization.

- Deliverable

Central context validator.

- Status
  `6.6 ⬜ Not Started`

- **PHASE 6.7 → Context Normalization**

- Objective

Make equivalent contexts produce the same normalized representation.

For example:

`" org-123 "`

should not behave differently from:

`"org-123"`

if our contract allows trimming.

We need to define normalization rules carefully.

Potential rules:

```js
Trim IDs
Normalize empty values
Normalize optional fields
Preserve enum values
Avoid accidental case transformation
```

Important:

We should not blindly lowercase IDs.

IDs may be case-sensitive depending on the future implementation.

Example

Input:

```js
{
scope: ORGANIZATION,
organizationId: " org-123 ",
projectId: undefined,
...
}
```

Normalized:

```js
{
scope: ORGANIZATION,
organizationId: "org-123",
...
}
```

- Deliverable

`normalizeSecurityContext().`

- Status

`6.7 ⬜ Not Started`

- **PHASE 6.8 → Canonical Context**

We already have:

`canonicalizeSecurityContext()`

Currently:

```js
[
  context.scope,
  context.organizationId ?? "",
  context.projectId ?? "",
  context.applicationId ?? "",
  context.environmentId ?? "",
  context.classification,
  context.purpose,
].join("|");
```

Phase 6 should formally define this behavior.

- Objective

Guarantee deterministic representation.

For example:

`ORGANIZATION|org-123||||SENSITIVE|API_KEY`

must always produce the same canonical value.

This is important because canonical context is used by:

```js
AES-GCM AAD
↓
Integrity binding
```

and eventually:

```js
Signing
HMAC
Audit correlation
Security policy evaluation
```

- Tasks

```js
Review delimiter safety.
Normalize before canonicalization.
Define field ordering.
Define null/undefined behavior.
Test deterministic output.
Test equivalent normalized contexts.
```

- Deliverable

Stable canonicalization utility.

- Status
  `6.8 ⬜ Not Started`

- **PHASE 6.9 → Context Equality / Comparison**

- Objective

Provide a reliable way to determine whether two security contexts represent the same security boundary.

Potential utility:

```js
areSecurityContextsEqual(contextA, contextB);
```

Conceptually:

```js
Context A
↓
normalize
↓
canonicalize

Context B
↓
normalize
↓
canonicalize

       ↓

compare

```

This will be useful later for:

```js
Cache keys
Security policies
Encryption context checks
Audit
Key selection
Request context
Multi-tenant isolation
```

- Deliverable

Context comparison utility.

- Status

`6.9 ⬜ Not Started`

- **PHASE 6.10 → Security Boundary Validation**

This is one of the most important parts.

- Objective

Ensure a context cannot accidentally cross security boundaries.

Example:

```js
Organization A
↓
Project A
```

must never accidentally become:

```js
Organization B
↓
Project A
```

At this phase we can validate context consistency, but not ownership from DB.

There are two levels:

- Level 1 — Structural

`PROJECT requires organizationId`

- Level 2 — Resource ownership

`Does projectId actually belong to organizationId?`

The second requires persistence/repository access and should `not be implemented inside Security Core Phase 6.`

It belongs later when Security Services integrate with the Multi-Tenant foundation.

- Deliverable

Security boundary rules and clear responsibility separation.

- Status
  `6.10 ⬜ Not Started`

- **PHASE 6.11 → Integrate Context With Crypto Operations**

Now we connect the validated context to the existing crypto system.

- Current:

```js
EncryptionService
↓
CryptoProvider
↓
SecurityContext
```

We want:

```js
Raw Context
↓
Validator
↓
Normalizer
↓
Validated Context
↓
Crypto Operation
```

- Operations:

```js
Encryption
Decryption
Signing
Signature Verification
HMAC
HMAC Verification
```

Important

We should avoid unnecessarily changing the public contracts created in Phases 3–5.

Instead, introduce the context validation at the appropriate service/provider boundary.

We will inspect the actual current implementation before deciding exactly where.

- Deliverable

All Security Core security-sensitive operations use validated context.

- Status

`6.11 ⬜ Not Started`

- **PHASE 6.12 → Automated Tests**

This phase needs comprehensive testing.

I recommend approximately 25–35 test cases.

- A. Scope tests

```js
PLATFORM context valid
ORGANIZATION context valid
PROJECT context valid
APPLICATION context valid
ENVIRONMENT context valid
```

- B. Missing parent tests

```js
PROJECT without organization → false
APPLICATION without project → false
ENVIRONMENT without application → false
```

- C. Invalid extra fields

```js
ORGANIZATION + projectId → false
PROJECT + applicationId → false
APPLICATION + invalid environment combination → false
```

- D. Classification tests

```js
valid classification
invalid classification
```

- E. Purpose tests

```js
valid purpose
invalid purpose
```

- F. Normalization tests

```js
trim IDs
empty values
undefined values

```

- G. Canonicalization tests

```js
same context → same canonical string
different context → different canonical string
```

- H. Equality tests

```js
same context → true
different organization → false
different project → false
different classification → false
different purpose → false
```

- I. Crypto integration tests

Verify that Phase 6 doesn't break:

```js
Encryption
Decryption
Signing
Verification
HMAC
HMAC verification
```

- Deliverable

Full Phase 6 automated suite.

- Status
  `6.12 ⬜ Not Started`

- **PHASE 6.13 → Manual Verification**

Create:

```js
src/modules/security-core/**tests**/phase-6/
└── manual-security-context-test.ts
```

Verify real-world scenarios.

Example:

```js
Organization API key
Project database credential
Application OAuth secret
Production refresh token
Platform signing operation
```

Then verify invalid scenarios.

- Deliverable

Manual verification script.

- Status

`6.13 ⬜ Not Started`

- **PHASE 6.14 → Hardening & Architecture Review**

Final review before moving forward.

We verify:

- Architecture

```js
No circular dependency
No IAM dependency
No database dependency
No direct Node crypto dependency from business modules
```

- Security

```js
Default deny
Invalid context rejected
No accidental tenant crossing
Canonicalization deterministic
No secret values logged
```

- Compatibility

```js
Phase 3 → PASS
Phase 4 → PASS
Phase 5 → PASS
Phase 6 → PASS
```

- TypeScript
  `npm run type-check`

- Security tests

`npm run test:security`

- Build

`npm run build`

- Deliverable

Phase 6 sign-off.

- Status
  `6.14 ⬜ Not Started`

- **4. Complete Phase 6 Tracking Sheet**

- You can keep this as your master checklist:

```js
╔══════════════════════════════════════════════════════════╗
║ PHASE 6 — SECURITY CONTEXT ║
╚══════════════════════════════════════════════════════════╝

6.1 SecurityContext Contract Review
⬜

6.2 Security Scope Rules
⬜

6.3 Hierarchy Validation Rules
⬜

6.4 Required / Forbidden Context Fields
⬜

6.5 SecurityContext Zod Schema
⬜

6.6 SecurityContextValidator
⬜

6.7 Context Normalization
⬜

6.8 Canonical Context
⬜

6.9 Context Equality / Comparison
⬜

6.10 Security Boundary Validation
⬜

6.11 Crypto Operation Integration
⬜

6.12 Automated Tests
⬜

6.13 Manual Verification
⬜

6.14 Hardening & Architecture Review

⬜
```

- **5. What Phase 6 Will NOT Do**

This is equally important.

We should not expand Phase 6 unnecessarily.

- Not in Phase 6

```js
❌ IAM
❌ Authentication
❌ Authorization
❌ RBAC
❌ UBAC
❌ User management
❌ Key Management UI
❌ Secret Management
❌ Database persistence
❌ AWS KMS
❌ Azure Key Vault
❌ GCP KMS
❌ Customer-managed KMS
❌ Security Dashboard
❌ Security policies engine
❌ Audit database
```

Those belong to later phases.

- **6. Final Security Core Architecture After Phase 6**

Once Phase 6 is finished, our Security Core should conceptually look like:

```js
                         TraceMind
                            │
                            ↓
                  ┌──────────────────┐
                  │  Security Core   │
                  └────────┬─────────┘
                           │
                           ↓
                 ┌─────────────────────┐
                 │ Security Context    │
                 │                     │
                 │ Scope               │
                 │ Classification      │
                 │ Purpose             │
                 │ Resource hierarchy  │
                 └──────────┬──────────┘
                            │
                            ↓
                 ┌─────────────────────┐
                 │ Context Validator   │
                 └──────────┬──────────┘
                            │
                            ↓
                 ┌─────────────────────┐
                 │ Normalizer          │
                 └──────────┬──────────┘
                            │
                            ↓
                 ┌─────────────────────┐
                 │ Canonicalizer       │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ↓                 ↓                 ↓
     Encryption          Signing            HMAC
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ↓
                    Provider Abstraction

```

This gives us a strong foundation for the next stages:

```js
Phase 6
Security Context
↓
Phase 7
Provider Architecture
↓
Phase 8
Local Provider
↓
Phase 9
Security Service / Public API
↓
Phase 10
Testing + Hardening
↓
Phase 11+
Full TraceMind Security Product
```

- Current overall progress

```js
PHASE 0 → Foundation ✅
PHASE 1 → Crypto Abstraction ✅
PHASE 2 → Key Abstraction ✅
PHASE 3 → Encryption Envelope ✅
PHASE 4 → Hashing ✅
PHASE 5 → Signing & HMAC ✅
PHASE 6 → Security Context 🔵 NEXT
PHASE 7 → Provider Architecture ⬜
PHASE 8 → Local Provider ⬜
PHASE 9 → Security Service/API ⬜
PHASE 10 → Hardening ⬜
```

- Recommended next action: start only with 6.1 — SecurityContext Contract Review.
