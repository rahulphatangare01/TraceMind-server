### Phase 9 — Security Service / Public API

- Objective

Expose a clean, stable application-facing API over the Security Core without allowing business modules to directly access low-level crypto/key providers.

Target architecture:

```js
Application / IAM / Other Modules
              │
              ▼
      Security Service
              │
              ├── SecurityContextValidator
              ├── SecurityBoundaryValidator
              ├── KeyProvider
              ├── KeyMaterialProvider
              └── CryptoProvider
                       │
                       ▼
              Local Security Provider
```

The important boundary is:

```js
Business Module
      ❌ → LocalCryptoProvider
      ❌ → LocalKeyProvider
      ❌ → Node crypto

Business Module
      ✅ → SecurityService
```

- **Phase 9 Roadmap**

```js
9.1 Security Service Contract
9.2 Security Service Types
9.3 Security Service Validation
9.4 Security Service Encryption API
9.5 Security Service Decryption API
9.6 Security Service Hashing API
9.7 Security Service Hash Verification API
9.8 Security Service Signing API
9.9 Security Service Signature Verification API
9.10 Security Service HMAC API
9.11 Security Service HMAC Verification API
9.12 Key Management API
9.13 Security Context Integration
9.14 Provider Resolution Integration
9.15 Security Service Error Handling
9.16 Security Service Container / Dependency Wiring
9.17 Public API Facade
9.18 API Contract & Regression Tests
9.19 Security Boundary Review
9.20 Documentation
9.21 Final Type-check / Build / Review
```

**Detailed Implementation Plan**

#### 9.1 — Security Service Contract

Define the public contract first.

Example conceptual API:

```js
interface SecurityService {
encrypt(...): Promise<...>;
decrypt(...): Promise<...>;

hash(...): Promise<...>;
verifyHash(...): Promise<...>;

sign(...): Promise<...>;
verifySignature(...): Promise<...>;

createHmac(...): Promise<...>;
verifyHmac(...): Promise<...>;
}
```

Tests

```js
- Contract existence
- Method availability
- Return contract
- No provider leakage
```

#### 9.2 — Security Service Types

Create public request/result types without exposing internal provider implementation details.

Example:

```js
SecurityEncryptRequest;
SecurityEncryptResult;

SecurityDecryptRequest;
SecurityDecryptResult;

SecurityHashRequest;
SecurityHashResult;

SecurityVerifyHashRequest;
SecurityVerifyHashResult;

SecuritySignRequest;
SecuritySignResult;

SecurityVerifySignatureRequest;
SecurityVerifySignatureResult;

SecurityHmacRequest;
SecurityHmacResult;

SecurityVerifyHmacRequest;
SecurityVerifyHmacResult;
```

- Important

The public API should not expose:

```js
LocalCryptoProvider
LocalKeyProvider
KeyMaterialProvider
raw key material
private keys
```

#### 9.3 — Security Service Validation

Centralize validation before crypto operations.

Flow:

```js
Request
↓
Input Validation
↓
SecurityContext Validation
↓
SecurityBoundary Validation
↓
Provider Resolution
↓
Crypto Operation
```

Tests should cover:

```js
- Missing context
- Invalid scope
- Invalid hierarchy
- Missing required IDs
- Forbidden IDs
- Invalid request
- Valid request
```

#### 9.4 — Encryption API

- Implement:

`securityService.encrypt(...)`

- Responsibilities:

```js
Validate request
↓
Validate SecurityContext
↓
Resolve provider
↓
Resolve key
↓
Perform encryption
↓
Return public encryption result
```

- Tests:

```js
- Successful encryption
- Unicode
- Empty/invalid input
- Context validation
- Provider resolution
- Key resolution
```

No raw key leakage

#### 9.5 — Decryption API

Implement:

`securityService.decrypt(...)`

Tests:

```js
- Valid decryption
- Wrong key
- Wrong context
- Tampered ciphertext
- Invalid envelope
- Unknown key
- Old key version after rotation
```

#### 9.6 — Hashing API

Implement:

`securityService.hash(...)`

Support existing:

```js
SHA - 256;
Argon2id;
```

Tests:

```js
- SHA-256
- Argon2id
- encoding behavior
- invalid algorithm
- no plaintext leakage
```

#### 9.7 — Hash Verification API

Implement:

`securityService.verifyHash(...)`

Tests:

```js
- valid hash → true
- invalid value → false
- tampered hash → false
- wrong algorithm → rejected
```

#### 9.8 — Signing API

Implement:

`securityService.sign(...)`

Current algorithm:

`Ed25519`

Tests:

```js
Successful signing
Signature metadata
Key identity
Invalid request
Provider resolution
No private-key exposure
```

#### 9.9 — Signature Verification API

Implement:

`securityService.verifySignature(...)`

Tests:

```js
- Valid signature
- Modified payload
- Tampered signature
- Invalid key
- Invalid key version
```

We should preserve the existing Phase 5 behavior rather than redesign signing context binding during Phase 9.

#### 9.10 — HMAC API

Implement:

`securityService.createHmac(...)`

Current algorithm:

`HMAC-SHA-256`

Tests:

```js
Valid HMAC
Unicode payload
Key identity
No secret leakage
```

#### 9.11 — HMAC Verification API

Implement:

`securityService.verifyHmac(...)`

Tests:

```js
Valid HMAC
Modified payload
Tampered signature
Invalid key
Invalid key version
```

#### 9.12 — Key Management API

Expose `safe key-management operations` where required.

Potential public operations:

```js
createKey;
getKey;
getKeyVersion;
getActiveKeyVersion;
rotateKey;
changeKeyStatus;
```

But the API must expose metadata only.

Never:

```js
getRawKey();
exportKeyMaterial();
returnPrivateKey();
```

#### 9.13 — Security Context Integration

The Security Service becomes the main integration point for:

```js
SecurityContext
↓
SecurityContextValidator
↓
SecurityBoundaryValidator
```

Every sensitive operation should use the appropriate context.

#### 9.14 — Provider Resolution Integration

The Security Service should not know whether the provider is:

```js
LOCAL;
AWS_KMS;
AZURE_KEY_VAULT;
GCP_KMS;
HASHICORP_VAULT;
CUSTOM;
```

Instead:

```js
SecurityService
↓
ProviderResolver
↓
SecurityProvider
```

No fallback behavior.

If a requested provider cannot be resolved:

`ProviderResolutionError`

#### 9.15 — Security Service Error Handling

Create a consistent service-level error strategy.

Possible errors:

```js
SecurityServiceError;
SecurityValidationError;
SecurityOperationError;
SecurityKeyError;
SecurityProviderError;
```

However, `reuse the existing Security Core error hierarchy where possible` rather than creating duplicate error systems.

Tests should verify:

```js
- Error classification
- Error propagation
- No secret leakage
- No raw key leakage
- Provider errors remain distinguishable
```

#### 9.16 — Security Service Container

Wire the service into the existing Security Core container.

Target:

```js
export const securityCore = {
  ...securityService,
};
```

So consumers can use:

`securityCore.securityService`

instead of constructing providers themselves.

#### 9.17 — Public API Facade

Create the public Security Core entry point.

Conceptually:

```js
security-core/
│
├── application/
│ ├── interfaces/
│ └── services/
│
├── providers/
├── types/
├── schemas/
├── errors/
├── utils/
│
├── security-core.container.ts
└── index.ts
```

Public consumers should import from the Security Core public entry point rather than internal provider paths.

#### 9.18 — API Contract & Regression Tests

This is the major test phase.

Test:

```js
Public API
↓
Security Service
↓
Provider Resolver
↓
Local Provider
↓
Crypto
```

Cover:

```js
Encryption
Decryption
Hashing
Hash verification
Signing
Signature verification
HMAC
HMAC verification
Key management
Provider resolution
Security context
Security boundary
Error handling
Provider isolation
Existing Phase 8 regression
```

#### 9.19 — Security Boundary Review

Review that consumers cannot bypass the Security Service accidentally.

Verify:

```js
❌ Business code → Node crypto
❌ Business code → LocalCryptoProvider
❌ Business code → raw KeyMaterialProvider
❌ Business code → private key
❌ Business code → raw secret

✅ Business code → SecurityService
```

This becomes an important architectural rule for TraceMind.

#### 9.20 — Documentation

Document:

```js
Security Service
├── Public API
├── Request/Response contracts
├── Encryption usage
├── Hashing usage
├── Signing usage
├── HMAC usage
├── Key management
├── SecurityContext
├── Provider resolution
├── Error handling
└── Security rules
```

#### 9.21 — Final Validation

Every Phase 9 step follows your standard:

```js
Implementation
↓

1. Automated Spec Test
   ↓
2. Manual Verification
   ↓
   Security Review
   ↓
   Type-check
   ↓
   Build
   ↓
   Review
```

For the final 9.21 gate:

```js
All Phase 9 tests +
All Security Core regression tests +
Security review +
Type-check +
Build +
Architecture review
```

- **Final Phase 9 Architecture**

After completion:

```js
                TraceMind Modules
                       │
                       ▼
              ┌─────────────────┐
              │ SecurityService │  ← Public API
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    Context       Provider       Key/Operation
   Validation     Resolver          Services
          │            │
          └────────────┼────────────┘
                       ▼
              Security Provider
                       │
                 ┌─────┴─────┐
                 ▼           ▼
             Local       Future KMS

```
