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
