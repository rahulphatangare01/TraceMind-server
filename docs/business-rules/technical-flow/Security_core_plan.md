## Security Core

- My recommendation is to make one fundamental decision:

`Do not create separate physical master keys for every organization, project, application, and environment. Use a hierarchical key-management model with provider-backed root/master keys and logically scoped data-encryption keys (DEKs).`

- This gives TraceMind strong tenant isolation without creating an unmanageable key explosion.

#### 1. Recommended Security Core architecture

```js
                    ┌───────────────────────────┐
                    │      Security Core API     │
                    │                           │
                    │ encrypt / decrypt         │
                    │ hash / verify             │
                    │ sign / verify             │
                    │ generate secret           │
                    │ key selection              │
                    └─────────────┬─────────────┘
                                  │
                         Security Provider
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
      Local Key Provider     AWS KMS Provider    Azure Key Vault
             │                    │                    │
      ┌──────┴──────┐             │              GCP KMS
      │ Root/Master │             │              HashiCorp Vault
      │    Key      │             │
      └──────┬──────┘             │
             │
        Key Encryption
             │
      ┌──────▼─────────┐
      │ Data Encryption │
      │      Keys       │
      │      (DEK)      │
      └──────┬─────────┘
             │
      ┌──────▼─────────────────────────────┐
      │ Encrypted application data         │
      │ secrets / credentials / telemetry  │
      └────────────────────────────────────┘
```

- The Security Core should not care whether the underlying provider is local, AWS, Azure, GCP, Vault, or customer-managed KMS.

- That is critical for making Security independently deployable.

#### 2. First important distinction: Master Key vs DEK

- We should not encrypt every database value directly with a master key.

- Instead:

- **Master / Root Key**

- The master key lives inside a trusted key provider.

- Examples:

```js
AWS KMS
Azure Key Vault
Google Cloud KMS
HashiCorp Vault
HSM
Local protected key store
```

- It is primarily used to protect other keys.

- **Data Encryption Key — DEK**

- A DEK performs the actual encryption of application data.

- For example:

```js
Organization secret
↓
DEK
↓
AES-256-GCM
↓
ciphertext
```

- The DEK itself is protected/wrapped by a master key.

- Conceptually:

```js
Master Key
    │
    └── wraps ──> DEK
                     │
                     ├── encrypt secret
                     ├── encrypt credentials
                     └── encrypt sensitive data
```

- This is the standard envelope-encryption pattern I would use for TraceMind.

#### 3. Where should master keys live?

- We should support three deployment modes.

- **Mode A — TraceMind-managed keys**

- For TraceMind Cloud:

```js
TraceMind
   │
   └── Cloud KMS
          │
          └── TraceMind master key
```

- The customer does not directly manage the root key.

- Good for:

```js
normal SaaS customers
simple onboarding
low operational complexity
```

#### 4. Mode B — Customer-managed KMS

- Enterprise customers may require:

```js
Customer AWS Account
        │
        ▼
Customer KMS
        │
        ▼
Customer Master Key
        │
        ▼
TraceMind Security Core
```

- or:

```js
Customer Azure
↓
Key Vault
↓
Customer Key
↓
TraceMind
```

- TraceMind never needs to possess the raw master key.

- Instead, Security Core calls the customer's KMS provider.

- This is important for enterprise compliance.

#### 5. Mode C — Self-hosted / private deployment

- For self-hosted TraceMind:

```js
Customer Infrastructure
│
├── HSM
├── Vault
└── local protected keystore
```

- The Security Core doesn't change.

- Only the provider changes.

- Therefore:

```js
interface KeyProvider {
generateKey(...): Promise<KeyReference>;
encrypt(...): Promise<EncryptedData>;
decrypt(...): Promise<Buffer>;
wrapKey(...): Promise<WrappedKey>;
unwrapKey(...): Promise<Buffer>;
}
```

- The exact interface can evolve during implementation, but provider abstraction should be a hard architectural boundary.

#### 6. How should Organization / Project / Application / Environment keys work?

- This is where I strongly recommend logical key scopes, not four independent master keys.

- Your hierarchy is:

```js
Organization
│
└── Project
│
└── Application
│
└── Environment
```

- Security Core should understand these scopes.

- For example:

```js
PLATFORM;
ORGANIZATION;
PROJECT;
APPLICATION;
ENVIRONMENT;
FIELD;
```

- But the physical key architecture should be:

```js
                    MASTER KEY
                        │
              ┌─────────┴─────────┐
              │                   │
          Key Version 1       Key Version 2
              │                   │
              ▼                   ▼
             DEKs
              │
       ┌──────┼─────────┐
       │      │         │
      Org    Project    App/Env
```

- We select keys based on security context.

- Example context:

```js
{
organizationId: "org_123",
projectId: "project_123",
applicationId: "app_123",
environmentId: "env_123",
classification: "SENSITIVE",
purpose: "DATABASE_CREDENTIAL"
}
```

- Security Core determines which key material/provider/key version applies.

#### 7. Should we derive keys cryptographically from parent IDs?

- I recommend:

- No direct deterministic key derivation from IDs in V1.

- For example, don't do:

`SHA256(masterKey + organizationId)`

- and treat that as the organization's encryption key.

- It sounds elegant, but creates unnecessary complications around:

```js
rotation
key revocation
external KMS
customer-managed keys
key destruction
compliance
key version tracking
provider interoperability
```

- Instead:

- Use IDs as key-selection context, not as the cryptographic key itself.

- So:

```js
organizationId
↓
Security Policy
↓
Key Reference
↓
KMS
↓
DEK
```

- This gives us much better control.

#### 8. Recommended key hierarchy

- I'd establish this model:

```js
                    PLATFORM ROOT
                         │
                 Provider / KMS
                         │
              ┌──────────┴──────────┐
              │                     │
        Platform Key            Tenant Key
              │                     │
              │              Organization scope
              │                     │
              │              ┌──────┴──────┐
              │              │             │
              │          Project DEK    App/Env DEK
              │
              └── platform data
```

- However, we should avoid creating thousands of permanent KMS keys.

- Instead:

- **KMS master keys**

- Relatively few.

- **DEKs**

- Potentially many, but managed by Security Core.

#### 9. Key scope should be metadata

- Every encryption operation should carry an encryption context.

- For example:

```js
interface EncryptionContext {
scope: SecurityScope;
organizationId?: string;
projectId?: string;
applicationId?: string;
environmentId?: string;

classification: DataClassification;
purpose: EncryptionPurpose;
}
```

- Example:

```js
{
"scope": "APPLICATION",
"organizationId": "org_123",
"projectId": "project_123",
"applicationId": "app_456",
"classification": "SENSITIVE",
"purpose": "DATABASE_CREDENTIAL"
}
```

- This becomes extremely valuable later for:

```js
authorization
auditing
key selection
policy enforcement
incident investigation
compliance
```

#### 10. Key versions are mandatory

- Never think:

`application_key`

- Think:
  ``js
  application_key:v1
  application_key:v2
  application_key:v3

````
- Key metadata should include something like:

```js
interface KeyVersion {
id: string;
keyId: string;
version: number;

status:
| "ACTIVE"
| "DECRYPT_ONLY"
| "DISABLED"
| "DESTROYED";

createdAt: Date;
activatedAt?: Date;
rotatedAt?: Date;
destroyedAt?: Date;
}
````

- The important statuses are:

- **ACTIVE**

- Used for new encryption.

- **DECRYPT_ONLY**

- Old data can still be decrypted, but new data cannot use it.

- **DISABLED**

- Cannot be used.

- **DESTROYED**

- Cryptographically unavailable.

#### 11. Rotation model

- Suppose:

`Credential encrypted with Key v1`

- Then we rotate:

```js
v1 → DECRYPT_ONLY
v2 → ACTIVE
```

- New data:

`v2`

- Old data:

`v1`

- still decrypts.

- Therefore:

```js
                Encryption
                    │
                    ▼
                  v2

                Decryption
                ┌────┴────┐
                │         │
               v1        v2
```

- We should not require immediate re-encryption of all historical data.

- Instead, support optional background re-encryption:

```js
v1 encrypted records
        ↓
read
        ↓
decrypt v1
        ↓
encrypt v2
        ↓
persist v2
```

- This is especially important for TraceMind because telemetry volumes could become enormous.

#### 12. Ciphertext must carry key version

- Never store:

`encrypted_value`

alone.

- We need an encryption envelope.
- For example:

```js

{
"version": 1,
"algorithm": "AES-256-GCM",
"keyId": "key_xxx",
"keyVersion": 2,
"iv": "...",
"authTag": "...",
"ciphertext": "..."
}
```

- Potentially:

`encrypted_payload`

- could be serialized into one column.

- Or use separate DB columns where appropriate.

- The critical point is:

`The ciphertext must tell Security Core which key/version is required for decryption.`

#### 13. Encryption algorithm

- For application-level symmetric encryption, I'd standardize on:

- AES-256-GCM

- because it provides:

```js
confidentiality
integrity/authentication
authenticated encryption
```

- Do not invent our own encryption format.

- The Security Core should hide the crypto implementation:

```js
security.encrypt(value, context);
security.decrypt(value, context);
```

- Application code should not do:

`crypto.createCipheriv(...)`

directly.

#### 14. What should be encrypted?

- This is one of the most important boundaries.

- **Encrypt**

- Anything that must later be recovered in plaintext.

- **Credentials**

```js
Database passwords
SMTP passwords
OAuth client secrets
Webhook secrets
Cloud credentials
KMS configuration secrets
API credentials
```

- **Tokens/secrets**

```js
Refresh tokens
Provider tokens
Integration credentials
Encryption configuration
MFA recovery secrets
```

- **Sensitive configuration**

```js
Connection strings
Private endpoints
Sensitive integration configuration
```

- Potentially sensitive user information

- Depending on policy:

```js
Phone number
Address
Other customer-defined PII
```

#### 15. What should NOT be encrypted?

- Passwords.

- This is critical.

- User password:

```js
password
↓
Argon2id
↓
password hash
```

- Not:

```js
password
↓
AES
↓
encrypted password
```

- Because the system should never need to recover the original password.

#### 16. What should be hashed?

- Hash when we need to verify or compare, but don't need to recover the original value.

- Examples:

```js
User passwords
API key verification hashes
Webhook verification secrets
Password reset token hashes
Email verification token hashes
Certain lookup fingerprints
```

- For passwords:

`Argon2id`

- For high-entropy tokens/API keys:

`SHA-256/HMAC-based lookup strategy`

- depending on the use case.

- We should be careful not to blindly use SHA-256 for low-entropy secrets.

#### 17. API key architecture

- This is particularly important for TraceMind.

- Suppose the customer creates:

`tm_live_xxxxxxxxx`

- We should not store the complete API key in plaintext.

- Recommended:

```js
API key
│
├── prefix → stored plaintext
│
└── secret → hashed
```

- Database:

```js
id;
prefix;
secret_hash;
organization_id;
created_at;
expires_at;
revoked_at;
```

- Display:

`tm_live_abcd...`

- The full secret is shown once at creation.

- When presented later:

```js
incoming API key
↓
extract prefix
↓
find candidate
↓
verify hash
↓
authenticate
```

- This is much safer than decryptable API keys.

#### 18. What should be signed?

- Signing answers a different question:

`"Was this data produced by a trusted signer and has it been modified?"`

- Signing is useful for:

```js
JWTs
Security tokens
Webhooks
Signed API requests
Configuration manifests
Inter-service messages
Audit/event integrity
```

- For example:

```js
TraceMind
│
├── payload
│
└── signature
↓
Customer system
↓
verify signature
```

- Private signing keys must live inside the key provider where possible.

#### 19. Encryption vs hashing vs signing

- The Security Core should make these distinctions explicit:

| Operation | Purpose                                     | Reversible? | Example                |
| --------- | ------------------------------------------- | ----------: | ---------------------- |
| Encrypt   | Protect recoverable data                    |         Yes | DB password            |
| Hash      | Verify without recovery                     |          No | User password          |
| Sign      | Prove authenticity/integrity                |          No | Webhook                |
| HMAC      | Integrity/authentication with shared secret |          No | Internal request       |
| Tokenize  | Replace sensitive value                     |     Depends | PII/payment-style data |

- This should become part of our Security Core documentation and API design.

#### 20. Security Core API

- I would eventually expose something conceptually like:

```js
security.encrypt();
security.decrypt();

security.hash();
security.verifyHash();

security.sign();
security.verifySignature();

security.hmac();
security.verifyHmac();

security.generateSecret();

security.getKey();
security.rotateKey();
security.revokeKey();
```

- But don't expose low-level crypto primitives to normal application modules.

- For example, IAM should say:

`security.hashPassword(password)`

- rather than:

`security.hash(password, "argon2id")`

- Likewise:

`security.encryptSecret(...)`

- rather than forcing IAM to understand AES-GCM.

- This creates a clean domain boundary.

#### 21. Security Core should classify data

- I'd define:

```js
enum DataClassification {
PUBLIC = "PUBLIC",
INTERNAL = "INTERNAL",
CONFIDENTIAL = "CONFIDENTIAL",
SENSITIVE = "SENSITIVE",
HIGHLY_SENSITIVE = "HIGHLY_SENSITIVE",
SECRET = "SECRET",
}
```

- Then policies determine treatment.

- Example:

```js
PUBLIC
→ no encryption required

INTERNAL
→ normal access control

CONFIDENTIAL
→ encryption recommended

SENSITIVE
→ encryption required

HIGHLY_SENSITIVE
→ strong encryption + restricted access

SECRET
→ secret-management workflow
```

- This becomes powerful once TraceMind has customer-configurable security policies.

#### 22. Organization vs Application vs Environment isolation

- The important rule:

`A child scope must never be able to implicitly decrypt another scope's data.`

- For example:

```js
Organization A
└── Application X
```

- must not be able to decrypt:

```js
Organization B
└── Application Y
```

- even if someone somehow knows the ciphertext ID.

- Security Core should therefore bind encryption context to tenant context.

- Conceptually:

```js
decrypt(ciphertext, context);
```

- requires:

`stored context == requested context`

- and authorization must happen before decryption.

#### 23. Very important: encryption is NOT authorization

- We should not make this mistake:

`"I can decrypt it, therefore I am authorized."`

- Instead:

```js
Request
↓
Authentication
↓
IAM Authorization
↓
Security Policy
↓
Key Selection
↓
Decrypt
```

- This means IAM and Security remain independent.

- IAM decides:

`Can this principal access this secret?`

- Security decides:

`How is that secret protected? `

#### 24. Customer-managed KMS architecture

- Eventually we want:

```js
Customer
│
└── registers KMS
│
├── provider = AWS
├── key reference
├── region
└── credentials/config
```

- Security Core stores the configuration/reference, not the customer's master key.

- For example:

```js
security_key_provider;

id;
organization_id;
provider;
provider_key_reference;
status;
created_at;
updated_at;
```

- Provider credentials themselves should be handled as secrets.

#### 25. Customer KMS failure behavior

- This needs to be explicit.

- If:

`Customer KMS unavailable`

- TraceMind should not silently fall back to another key.

- Otherwise we can accidentally violate the customer's security boundary.

- Instead:

```js
KMS unavailable
↓
Security operation fails
↓
controlled error
↓
audit/security event
```

- Availability should never silently weaken security.

#### 26. Telemetry needs special treatment

- This is where we should not blindly encrypt everything.

- TraceMind may ingest:

```js
millions/billions of logs
metrics
traces
spans
events
```

- Encrypting every field individually would have enormous performance and storage implications.

- Instead, distinguish:

- **Normal telemetry**

```js
timestamp;
duration;
status;
service;
route;
trace_id;
span_id;
environment;
```

- can generally remain searchable/indexable according to customer policy.

- **Sensitive telemetry**

```js
Authorization headers
cookies
tokens
passwords
PII
request bodies
response bodies
```

- should be:

`redacted`

- or:

`encrypted`

- depending on configuration.

- This should be a Telemetry Security Policy, not a blanket encryption rule.

#### 27. Secret redaction should happen before storage

- For example:

`Authorization: Bearer eyJ...`

- should ideally become:

- Authorization: [REDACTED]

- before telemetry persistence.

- Likewise:

```js
{
"password": "secret123"
}
```

- should become:

```js
{
"password": "[REDACTED]"
}
```

- Encryption is the second line of defense.

- Redaction is the first.

#### 28. Database architecture

- I recommend a dedicated Security schema/domain.

- Conceptually:

```js
security_key;
security_key_version;
security_key_provider;
security_secret;
security_encryption_policy;
security_audit_event;
security_data_classification;
```

- Potentially:

`security_encrypted_data`

- but preferably encrypted values remain in the domain tables that own them.

- For example:

```js
iam_user;
password_hash;

iam_api_key;
secret_hash;

integration;
encrypted_credentials;

environment;
encrypted_configuration;
```

- Security Core owns the mechanism, not necessarily every encrypted business record.

- This keeps domains clean.

#### 29. What IAM will use

- Once Security Core exists:

```js
IAM
 │
 ├── Password
 │      └── Security.hashPassword()
 │
 ├── API Key
 │      └── Security.hashApiKey()
 │
 ├── Refresh Token
 │      └── Security.hashToken()
 │
 ├── MFA Secret
 │      └── Security.encryptSecret()
 │
 └── OAuth Client Secret
        └── Security.encryptSecret()
```

- IAM doesn't need to know:

```js
AES
KMS
Vault
HSM
key version
rotation
```

- That is Security's responsibility.

#### 30. What TraceMind telemetry/integrations will use

- Later:

```js
Telemetry
│
├── redaction
├── classification
└── encryption policy
```

- Credentials:

```js
Database Integration
↓
Security.encryptSecret()
```

- Webhook:

```js
Webhook secret
↓
Security.secret storage
↓
HMAC/signature
```

- API ingestion:

```js
API key
↓
hash
↓
verify
```

- Everything uses the same Security Core.

#### 31. Key lifecycle

- The complete lifecycle should be:

```js
CREATE
↓
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

- With rotation:

```js
v1 ACTIVE
↓
rotation
↓
v1 DECRYPT_ONLY
v2 ACTIVE
```

- We should never immediately destroy v1 simply because v2 exists.

- Retention policy determines when v1 can be destroyed.

#### 32. Key destruction is extremely serious

- If a key is destroyed:

```js
Key destroyed
↓
encrypted data
↓
possibly permanently unrecoverable
```

- Therefore destruction should require:

```js
authorization
audit event
explicit confirmation
retention checks
possibly waiting period
customer policy validation
```

- Especially for customer-managed KMS.

#### 33. The final architectural model

- I would freeze the following model before implementation:

```js
                         TRACE MIND
                             │
                    ┌────────▼────────┐
                    │  Security Core  │
                    └────────┬────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
          Encrypt          Hash             Sign
             │               │                │
             ▼               ▼                ▼
        Envelope         Argon2id /       Signing keys
        Encryption       SHA/HMAC          / HMAC
             │
             ▼
       Key Management
             │
       ┌─────┴──────────┐
       │                │
   TraceMind KMS    Customer KMS
       │                │
       └───────┬────────┘
               │
          Master Keys
               │
            DEKs
               │
       Encryption Context
               │
   ┌───────────┼────────────┐
   │           │            │
Organization Project   Application/
                           Environment
```

#### 34. Decisions I recommend we officially freeze

- **Key management**

| Decision                 | Recommendation                         |
| ------------------------ | -------------------------------------- |
| Master keys              | KMS/provider backed                    |
| Application encryption   | Envelope encryption                    |
| Data encryption          | AES-256-GCM                            |
| Key derivation from IDs  | **No**                                 |
| Tenant IDs               | Key-selection/context only             |
| DEKs                     | Yes                                    |
| Key versions             | Mandatory                              |
| Rotation                 | New version + old decrypt-only         |
| Immediate re-encryption  | No                                     |
| Background re-encryption | Yes, later                             |
| Customer KMS             | Supported through provider abstraction |
| Raw master key exposure  | Never                                  |
| KMS failure              | Fail closed                            |
| Cross-tenant decryption  | Never                                  |

- **Data protection**

  | Data                | Method                             |
  | ------------------- | ---------------------------------- |
  | Password            | Argon2id hash                      |
  | API key             | Hash                               |
  | Refresh token       | Hash                               |
  | Reset token         | Hash                               |
  | DB password         | Encrypt                            |
  | OAuth client secret | Encrypt                            |
  | Webhook secret      | Encrypt                            |
  | MFA secret          | Encrypt                            |
  | Private credential  | Encrypt                            |
  | JWT                 | Sign                               |
  | Webhook             | HMAC/sign                          |
  | Sensitive telemetry | Redact/encrypt according to policy |
  | Normal telemetry    | Don't blindly encrypt everything   |

#### 35. Most important architectural principle

- I would put this at the top of the Security Core README:

`Security Core owns cryptographic protection and key lifecycle. IAM owns identity and authorization. Business modules own business data. No module directly manages cryptographic keys or low-level cryptographic operations.`

- That gives us this dependency direction:

```js
                    ┌───────────────┐
                    │ Security Core │
                    └───────┬───────┘
                            ▲
                            │
                    ┌───────┴───────┐
                    │      IAM      │
                    └───────┬───────┘
                            ▲
             ┌──────────────┼──────────────┐
             │              │              │
          Tenant       Telemetry       Integrations
             │              │              │
             └──────────────┼──────────────┘
                            │
                       TraceMind
```

- **One correction to our previous roadmap:** after this architecture pass, I would treat **Security Core** as the **immediate next implementation** step, but keep the full Security Product after IAM. We should not jump directly into customer-facing KMS, secret-management UI, rotation workflows, etc. yet.

- The next implementation phase should therefore be:

- **Security Core → Crypto abstraction → Key abstraction → Encryption envelope → Hashing → Signing/HMAC → Security context → provider interface → Local provider → tests**

- Only after those contracts are stable should we build IAM on top of them.
