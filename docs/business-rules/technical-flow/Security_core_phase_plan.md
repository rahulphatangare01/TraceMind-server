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
