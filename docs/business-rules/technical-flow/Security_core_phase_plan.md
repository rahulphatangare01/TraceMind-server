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
