#### TraceMind Security — Complete Phase Plan

##### A. SECURITY CORE — Reusable Engine

- currently completed Phase 0–3.

| Phase    | Area                                       | Status  |
| -------- | ------------------------------------------ | ------- |
| Phase 0  | Security Core Foundation                   | ✅      |
| Phase 1  | Crypto Abstraction                         | ✅      |
| Phase 2  | Key Abstraction & Lifecycle                | ✅      |
| Phase 3  | Encryption Envelope                        | ✅      |
| Phase 4  | Hashing                                    | 🔵 Next |
| Phase 5  | Signing & HMAC                             | ⏳      |
| Phase 6  | Security Context                           | ⏳      |
| Phase 7  | Provider Architecture                      | ⏳      |
| Phase 8  | Local Provider                             | ⏳      |
| Phase 9  | Security Service / Public API              | ⏳      |
| Phase 10 | Testing, Hardening & Integration Readiness | ⏳      |

- Phase 10 completion means:

- Phase 4 Hashing Steps

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

- Phase 5 → Signing & HMAC Steps

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

- **Testing Command**

- phase 5

npx vitest run src/modules/security-core/**tests**/phase-5/local-hmac.spec.ts
npx tsx src/modules/security-core/**tests**/phase-5/manual-hmac-test.ts
npx tsx src/modules/security-core/**tests**/phase-5/manual-security-core-test.ts
npx vitest run src/modules/security-core/**tests**/phase-5/local-signing.spec.ts
npx vitest run src/modules/security-core/**tests**/phase-5/local-hmac.spec.ts
npm run type-check
npm run test:security

- **PHASE 6 → Security Context**

```js
PHASE 6 → Security Context

6.1  → Review SecurityContext model
6.2  → Define SecurityScope rules
6.3  → Define hierarchy validation
6.4  → Define required IDs per scope
6.5  → Define context validation schema
6.6  → Implement SecurityContextValidator
6.7  → Implement context normalization
6.8  → Implement canonical context generation
6.9  → Context equality / comparison
6.10 → Context security boundary validation
6.11 → Integrate Context with Crypto operations
6.12 → Automated tests
6.13 → Manual verification
6.14 → Phase 6 hardening/review
```
