### Phase 8 Goal

- The objective is:

`Build a complete, secure, independently testable Local Security Provider implementation that satisfies all existing Security Core contracts and can be used for development, testing, CI, and controlled/self-hosted deployments without coupling TraceMind business modules to local cryptographic implementation.`

- Target architecture:

```js
                         Security Core
                              │
                              ▼
                    Provider Architecture
                              │
                              ▼
                    LocalSecurityProvider
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    LocalKeyProvider   LocalKeyMaterialProvider  LocalCryptoProvider
          │                   │                   │
          │             ┌─────┴─────┐             │
          │             │           │             │
          │             ▼           ▼             │
          │          AES Key     Key Version      │
          │                                      │
          └──────────────────┬───────────────────┘
                             ▼
                    Security Core Services
```

And for signing/HMAC:

```js
LocalSecurityProvider
        │
        ├── LocalSigningKeyProvider
        │        └── Ed25519
        │
        └── LocalHmacKeyProvider
                 └── HMAC-SHA-256
```

- Phase 8 Step Structure

I recommend 17 implementation steps:

```js
PHASE 8 — LOCAL PROVIDER

8.1  Local Provider Baseline Review
8.2  Local Provider Contract Compliance
8.3  Local Provider Dependency Wiring
8.4  Local Key Provider Hardening
8.5  Local Key Version Lifecycle
8.6  Local Key Material Management
8.7  Local Encryption Integration
8.8  Local Hashing Integration
8.9  Local Signing Integration
8.10 Local HMAC Integration
8.11 Local Provider Configuration
8.12 Local Provider Runtime Lifecycle
8.13 Local Provider Error Handling
8.14 Local Provider Security Boundaries
8.15 Local Provider Isolation & Concurrency
8.16 Local Provider Regression / Hardening
8.17 Phase 8 Documentation & Final Review
```

And every step follows your required process:

```js
Implementation
      ↓
1. Automated spec test
      ↓
2. Manual verification
      ↓
Type-check
      ↓
Build
      ↓
Review
```

- However, we should not run the complete type-check/build after every tiny sub-step if that creates unnecessary repetition. The phase-level gate can still be used, while each implementation step gets its own focused automated and manual verification.

#### 8.1 — Local Provider Baseline Review

- Objective

Before modifying anything, establish exactly what is already implemented.

Current Local Provider contains:

```js
LocalSecurityProvider;
LocalKeyProvider;
LocalKeyMaterialProvider;
LocalCryptoProvider;
LocalSigningKeyProvider;
LocalHmacKeyProvider;
```

The current `LocalSecurityProvider` implements both:

```js
SecurityProvider;
LocalProviderAdapter;
```

and exposes:

```js
keyProvider;
keyMaterialProvider;
signingKeyProvider;
hmacKeyProvider;
cryptoProvider;
```

The existing Local key provider uses in-memory maps for key metadata/version state, and the Local key material provider uses an in-memory map for generated AES material.

- Deliverables

Create a baseline review checklist/document.

No production code change initially.

- Tests

Automated:

`local-provider-baseline.spec.ts`

Manual:

`local-provider-baseline.manual.ts`

Verify:

```js
✓ Local provider exists
✓ Metadata correct
✓ Capabilities correct
✓ Provider status correct
✓ Key provider available
✓ Key material provider available
✓ Crypto provider available
✓ Signing provider available
✓ HMAC provider available
```

#### 8.2 — Local Provider Contract Compliance

Objective

Verify that Local Provider satisfies all existing provider contracts.

- Contracts:

```js
SecurityProvider;
LocalProviderAdapter;
KeyProvider;
KeyMaterialProvider;
CryptoProvider;
SigningKeyProvider;
HmacKeyProvider;
```

Important

Do not introduce a new giant interface.

Keep:

```js
SecurityProvider
    +
operation-specific providers
```

- Automated tests

Verify every required method exists and is callable.

- Manual verification

Print:

```js
✓ SecurityProvider contract
✓ LocalProviderAdapter contract
✓ KeyProvider contract
✓ KeyMaterialProvider contract
✓ CryptoProvider contract
✓ SigningKeyProvider contract
✓ HmacKeyProvider contract
```

#### 8.3 — Local Provider Dependency Wiring

- Objective

Review and harden dependency composition.

- Target:

```js
LocalSecurityProvider
│
├── LocalKeyProvider
│
├── LocalKeyMaterialProvider
│
├── LocalSigningKeyProvider
│
├── LocalHmacKeyProvider
│
└── LocalCryptoProvider
│
├── SigningKeyProvider
└── HmacKeyProvider
```

Important rule

`LocalCryptoProvider` must not instantiate a second signing/HMAC provider internally.

It should receive the providers through dependency injection, as the current implementation does.

- Test

Verify:

```js
LocalSecurityProvider.signingKeyProvider
        ===
LocalCryptoProvider signing dependency
```

and equivalent HMAC dependency behavior.

#### 8.4 — Local Key Provider Hardening

Current `LocalKeyProvider` already manages:

```js
SecurityKey;
SecurityKeyVersion;
```

including:

```js
createKey();
getKey();
getKeyVersion();
getActiveVersion();
rotateKey();
changeKeyStatus();
```

- Phase 8 objective

Harden these behaviors.

Test:

```js
Create key
↓
v1 ACTIVE

Rotate
↓
v1 DECRYPT_ONLY
v2 ACTIVE
```

Also test:

```js
Unknown key → reject
Unknown version → reject
Invalid status → reject
Duplicate active state → reject where applicable
```

Important

Do not redesign Phase 2 contracts.

#### 8.5 — Local Key Version Lifecycle

This deserves a separate step because local encryption depends heavily on correct version handling.

- Required lifecycle:

```js
v1 ACTIVE
│
│ rotate
▼
v1 DECRYPT_ONLY

v2 ACTIVE
```

New encryption:

`ACTIVE → v2`

Old encryption:

`v1 → still decryptable`

The current `LocalKeyProvider` already implements this rotation concept.

Tests

```js
8.5.1 create v1
8.5.2 encrypt with v1
8.5.3 rotate
8.5.4 verify v1 DECRYPT_ONLY
8.5.5 verify v2 ACTIVE
8.5.6 encrypt again
8.5.7 verify new operation uses v2
8.5.8 decrypt old v1 ciphertext
8.5.9 decrypt new v2 ciphertext
```

This is one of the most important Phase 8 test groups.

#### 8.6 — Local Key Material Management

Current Local Key Material Provider generates AES-256 key material and stores it in memory.

The current implementation uses:

`randomBytes(AES_256_GCM_KEY_LENGTH)`

and returns copies of the stored `Buffer`.

Phase 8 objective

Harden:

```js
keyId + version
↓
key material
```

Rules:

```js
1. Key material must never be returned through provider metadata.
2. Key material must never be logged.
3. Different key versions must have independent material.
4. Same key/version must resolve consistently during provider lifetime.
5. Returned buffers should not expose internal mutable storage.
6. Unknown key/version behavior must be explicit.
```

Tests

```js
same key/version → same material
different version → different material
different key → different material
returned Buffer mutation → internal material unaffected
unknown key/version → expected behavior
```

#### 8.7 — Local Encryption Integration

Integrate and validate:

```js
EncryptionService
↓
LocalKeyProvider
↓
LocalKeyMaterialProvider
↓
LocalCryptoProvider
↓
AES-256-GCM
```

Test matrix

```js
Plaintext
↓
Encrypt
↓
Envelope
↓
Decrypt
↓
Original plaintext
```

Test:

```js
- Empty plaintext
- Normal plaintext
- Unicode
- Large plaintext
- Repeated encryption
- Wrong context
- Tampered ciphertext
- Tampered auth tag
- Invalid key
- Invalid key version
- Invalid envelope
```

#### 8.8 — Local Hashing Integration

Validate Local Crypto Provider's:

```js
SHA - 256;
Argon2id;
```

Tests

```js
SHA-256
├── hash
├── verify correct value
└── reject wrong value

Argon2id
├── hash
├── verify correct password
└── reject wrong password
```

Also verify hashes never expose original plaintext.

#### 8.9 — Local Signing Integration

Validate:

`Ed25519`

Flow:

```js
payload
↓
LocalSigningKeyProvider
↓
private key
↓
signature
```

Verification:

```js
payload + signature
↓
public key
↓
valid / invalid
```

Test matrix

```js
Correct payload + signature → valid
Modified payload → invalid
Modified signature → invalid
Wrong key → invalid
Correct key/version → valid
```

#### 8.10 — Local HMAC Integration

Validate:

`HMAC-SHA-256`

Test:

```js
payload
↓
HMAC
↓
signature
```

and:

```js
payload + signature
↓
verify
```

Test:

```js
Correct payload → valid
Modified payload → invalid
Modified signature → invalid
Wrong key → invalid
```

Also verify constant-time verification behavior remains inside the cryptographic implementation.

#### 8.11 — Local Provider Configuration

Phase 8 should define what "LOCAL" configuration means.

Example:

```js
{
providerId: "local-security-provider",
type: "LOCAL",
settings: {
environment: "development"
}
}
```

**Important architectural decision**

Do not make Phase 8 depend on:

`TRACE_MIND_MASTER_KEY`

as the permanent production architecture.

The original roadmap explicitly states that production TraceMind Cloud should not depend on an application `.env` master key as its long-term architecture.

Instead:

```js
Development
↓
Local Provider

Self-hosted
↓
Controlled Local Provider

TraceMind Cloud
↓
Future KMS / HSM Provider
```

#### 8.12 — Local Provider Runtime Lifecycle

Currently Local Provider status is effectively:

`READY`

Phase 8 should define how Local Provider behaves during runtime.

Conceptually:

```js
REGISTERED
↓
INITIALIZING
↓
READY
↓
UNHEALTHY
↓
DISABLED
```

For Local Provider, initialization should verify:

```js
dependencies available
key provider available
key material provider available
crypto provider available
signing provider available
HMAC provider available
```

- Do not

Make Local Provider perform IAM authorization.

#### 8.13 — Local Provider Error Handling

Ensure Local Provider errors are normalized into existing Security Core error contracts.

Test:

```js
Missing key
Missing key version
Invalid key state
Crypto failure
Invalid ciphertext
Provider unavailable
Provider disabled
Invalid configuration
```

Errors must not contain:

```js
raw key
key material
private key
secret
password
token
```

#### 8.14 — Local Provider Security Boundaries

This is the most important security step.

Validate:

```js
Business Module
↓
Security Core
↓
Local Provider
```

Never:

```js
Business Module
↓
LocalCryptoProvider
↓
Node crypto
```

Also:

```js
IAM
↓
Security Core
```

not:

```js
Local Provider
↓
IAM
```

Local Provider should not know:

```js
User;
Role;
Permission;
RBAC;
UBAC;
Subscription;
Entitlement;
Billing;
```

#### 8.15 — Local Provider Isolation & Concurrency

The Local Provider uses in-memory Maps.

We need to test provider isolation.

Example:

```js
Provider A
↓
Key A

Provider B
↓
Key B
```

Ensure:

`Key A ≠ Key B`

and:

`Provider A cannot resolve Provider B's key state.`

- **Concurrency tests**

Run multiple operations simultaneously:

```js
Promise.all([
encrypt(...),
encrypt(...),
encrypt(...),
sign(...),
createHmac(...),
]);
```

Verify no state corruption.

Also test concurrent key creation and rotation.

#### 8.16 — Local Provider Regression / Hardening

This is the broad regression phase.

Run:

```js
Phase 1 tests
Phase 2 tests
Phase 3 tests
Phase 4 tests
Phase 5 tests
Phase 6 tests
Phase 7 tests
Phase 8 tests
```

Critical regression scenarios:

```js
Encryption
Hashing
Signing
HMAC
Context validation
Key lifecycle
Provider lifecycle
Provider resolution
Provider switching
Provider isolation
```

Also verify:

```js
wrong context → reject
wrong key → reject
wrong version → reject
tampering → reject
disabled key → reject according to defined lifecycle policy
destroyed key → reject
```

#### 8.17 — Phase 8 Documentation & Final Review

Document:

```js
Local Provider
├── Purpose
├── Supported environments
├── Architecture
├── Key lifecycle
├── Key material lifecycle
├── Encryption
├── Hashing
├── Signing
├── HMAC
├── Configuration
├── Runtime lifecycle
├── Error model
├── Security boundaries
├── Limitations
└── Future migration to KMS
```

Explicitly document:

`Local Provider is not the final TraceMind Cloud key-management architecture.`

Future:

```js
Local
│
├── Development
├── Testing
├── CI
└── Self-hosted
```

while:

```js
TraceMind Cloud
│
├── AWS KMS
├── Azure Key Vault
├── GCP KMS
└── Customer KMS/HSM
```

- **Phase 8 Testing Strategy**

You specifically require every phase to follow:

```js
Implementation
↓

1. Automated spec
   ↓
2. Manual verification
   ↓
   Type-check
   ↓
   Build
   ↓
   Review
```

For Phase 8, I recommend the following test organization:

```js
src/modules/security-core/**tests**/phase-8/

├── local-provider-baseline.spec.ts
├── local-provider-contract.spec.ts
├── local-provider-wiring.spec.ts
├── local-key-provider.spec.ts
├── local-key-version-lifecycle.spec.ts
├── local-key-material.spec.ts
├── local-encryption.spec.ts
├── local-hashing.spec.ts
├── local-signing.spec.ts
├── local-hmac.spec.ts
├── local-provider-configuration.spec.ts
├── local-provider-lifecycle.spec.ts
├── local-provider-errors.spec.ts
├── local-provider-security-boundary.spec.ts
├── local-provider-isolation.spec.ts
├── local-provider-concurrency.spec.ts
└── local-provider-regression.spec.ts
```

Manual:

```js
src/modules/security-core/**tests**/phase-8/manual/

├── local-provider-baseline.manual.ts
├── local-provider-contract.manual.ts
├── local-key-provider.manual.ts
├── local-key-rotation.manual.ts
├── local-encryption.manual.ts
├── local-hashing.manual.ts
├── local-signing.manual.ts
├── local-hmac.manual.ts
├── local-provider-security.manual.ts
└── local-provider-regression.manual.ts
```

- **Phase 8 Completion Gate**

At the end:

```js
PHASE 8 — LOCAL PROVIDER
│
├── 8.1 Baseline Review ✅
├── 8.2 Contract Compliance ✅
├── 8.3 Dependency Wiring ✅
├── 8.4 Key Provider Hardening ✅
├── 8.5 Key Version Lifecycle ✅
├── 8.6 Key Material Management ✅
├── 8.7 Encryption Integration ✅
├── 8.8 Hashing Integration ✅
├── 8.9 Signing Integration ✅
├── 8.10 HMAC Integration ✅
├── 8.11 Configuration ✅
├── 8.12 Runtime Lifecycle ✅
├── 8.13 Error Handling ✅
├── 8.14 Security Boundaries ✅
├── 8.15 Isolation & Concurrency ✅
├── 8.16 Regression & Hardening ✅
└── 8.17 Documentation & Review ✅
```

Every step:

```js
Implementation
│
├── Automated Spec
│ ↓
├── Manual Verification
│ ↓
├── Type-check
│ ↓
├── Build
│ ↓
└── Review
```

- **Critical Phase 8 Design Decision**

There is one thing I would not do:

`❌ Do not recreate the Local Provider from scratch.`

Your current code already has:

```js
LocalSecurityProvider;
LocalKeyProvider;
LocalKeyMaterialProvider;
LocalCryptoProvider;
LocalSigningKeyProvider;
LocalHmacKeyProvider;
```

and Phase 7 has already integrated these into the Provider Architecture. The current LocalSecurityProvider explicitly implements SecurityProvider and LocalProviderAdapter.

Therefore Phase 8 should be:

```js
Existing Local Provider
↓
Harden
↓
Complete missing guarantees
↓
Test deeply
↓
Security review
↓
Production/self-hosted readiness
```

rather than:

```js
Delete Local Provider
↓
Rebuild everything
```

That approach preserves the contracts we've already frozen in Phase 7 and avoids repeating work.

- **Recommended implementation order**

I would start actual coding with:

```js
8.1 → Baseline Review
8.2 → Contract Compliance
8.3 → Dependency Wiring
8.4 → Local Key Provider Hardening
8.5 → Key Version Lifecycle
```

Only after those are green should we move into the cryptographic integration tests:

```js
8.6 → Key Material
8.7 → Encryption
8.8 → Hashing
8.9 → Signing
8.10 → HMAC
```

Then:

```js
8.11 → Configuration
8.12 → Lifecycle
8.13 → Errors
8.14 → Security Boundary
8.15 → Isolation/Concurrency
8.16 → Regression
8.17 → Documentation
```

This gives us a clean progression from **provider structure → key infrastructure → cryptographic operations → security → production hardening, without breaking the Phase 7 architecture.**
