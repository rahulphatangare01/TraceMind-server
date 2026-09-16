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

- Add the following under src/modules/security-core:

```js
security-core/
├── application/
│ ├── interfaces/
│ │ ├── crypto.provider.interface.ts
│ │ └── key.provider.interface.ts
│ └── services/
│
├── domain/
│ ├── enums/
│ ├── models/
│ └── value-objects/
│
├── providers/
│ ├── interfaces/
│ └── local/
│ └── local-crypto.provider.ts
│
├── types/
│ ├── encryption.types.ts
│ └── crypto.types.ts
│
├── utils/
│ ├── encryption-envelope.util.ts
│ └── security-context.util.ts
│
├── errors/
│
├── constants/
│ └── encryption.constants.ts
│
├── security-core.container.ts
└── index.ts

```

3.2 AES-256-GCM constants

Create:

src/modules/security-core/constants/encryption.constants.ts
export const AES_256_GCM_IV_LENGTH = 12;

export const AES_256_GCM_AUTH_TAG_LENGTH = 16;

export const ENCRYPTION_ENVELOPE_VERSION = 1;

export const AES_256_GCM_KEY_LENGTH = 32;

Why:

AES-256 → 32-byte key
GCM recommended nonce/IV → 12 bytes
GCM authentication tag → 16 bytes
3.3 Encryption envelope

Create:

src/modules/security-core/types/encryption.types.ts
import type {
CryptoEncoding,
EncryptionAlgorithm,
} from "../domain/enums/index.js";

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

The important distinction is:

Envelope version
≠
Key version

For example:

{
"version": 1,
"keyId": "key_123",
"keyVersion": 3
}

version: 1 describes the envelope format.

keyVersion: 3 identifies the cryptographic key version.

3.4 Security Context canonicalization

This is very important for AES-GCM AAD.

We should not do:

JSON.stringify(context)

because object-property ordering can create inconsistent AAD.

Create:

src/modules/security-core/utils/security-context.util.ts
import type { SecurityContext } from "../domain/models/security-context.model.js";

export const canonicalizeSecurityContext = (
context: SecurityContext,
): string => {
const values = [
context.scope,
context.organizationId ?? "",
context.projectId ?? "",
context.applicationId ?? "",
context.environmentId ?? "",
context.classification,
context.purpose,
];

return values.join("|");
};

For example:

ORGANIZATION
org_123

CONFIDENTIAL
DATABASE_CREDENTIAL

becomes a deterministic string such as:

ORGANIZATION|org_123||||CONFIDENTIAL|DATABASE_CREDENTIAL

This value will be supplied to AES-GCM as AAD.

3.5 Why AAD?

Suppose data was encrypted for:

Organization A

and someone attempts to decrypt it using:

Organization B

The ciphertext itself hasn't necessarily changed.

But the security context changes.

Because the context is authenticated through AES-GCM AAD:

Context A → encryption
Context B → decryption
↓
Authentication failure

Therefore the encryption envelope is cryptographically bound to its intended context.

Important:

AAD is cryptographic integrity protection, not authorization.

IAM/security policy must still decide whether the caller is allowed to decrypt.

3.6 Local crypto provider

Now implement the actual Node.js crypto operation.
