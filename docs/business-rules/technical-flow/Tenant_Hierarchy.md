## 2.5 Environment Structure

```js
Organization
    ↓
Project
    ↓
Application
    ↓
Environment
```

**1. Environment Design**

- An environment can be:

```js
DEVELOPMENT;
QA;
TEST;
UAT;
STAGING;
PRODUCTION;
CUSTOM;
```

- Example hierarchy:

```js
Organization: Acme
    │
    └── Project: Payment Platform
            │
            └── Application: Payment API
                    │
                    ├── DEVELOPMENT
                    ├── QA
                    ├── UAT
                    ├── STAGING
                    └── PRODUCTION
```

- mportant Security Decision

- The public API should not blindly accept applicationId.

- Recommended API:

`POST /applications/:applicationId/environments`

- Flow:

```js
applicationId
    ↓
Route Parameter
    ↓
Validate Application Access
    ↓
Create Environment
```

## Tenant Hierarchy

We now have validation and TypeScript models for:

```js

STEP 2.2
Organization
    ↓
STEP 2.3
Project
    ↓
STEP 2.4
Application
    ↓
STEP 2.5
Environment
```

Final request flow:

```js
HTTP Request
    ↓
Route Params
    ↓
Zod Validation
    ↓
Authentication
    ↓
Tenant Context
    ↓
Organization Validation
    ↓
Project Validation
    ↓
Application Validation
    ↓
Environment Validation
    ↓
Service
    ↓
Repository
    ↓
Database
```

**Tenant Database & Persistence Foundation**
├── Database Tables
├── Foreign Keys
├── Unique Constraints
├── Composite Unique Constraints
├── Indexes
├── Soft Delete Strategy
├── Tenant Isolation Rules
├── Repository Interfaces
└── Tenant Lifecycle Persistence Rules

```js
Application
    │
    ├── Application Settings
    │
    └── Telemetry Configuration
          ├── Sampling
          ├── Retention
          ├── PII Masking
          └── Ingestion Rules
```

#### Organization Validation Flow

```js
API Request
     ↓
createOrganizationSchema
     ↓
Validated CreateOrganizationInput
     ↓
Service Layer
     ↓
Generate ID
     ↓
Apply Default Status = PENDING
     ↓
Repository
     ↓
MySQL
```

**For updates:**

```js
API Request
     ↓
updateOrganizationSchema
     ↓
Service Validation
     ↓
Repository
     ↓
MySQL
```

**For lifecycle updates:**

```js
API Request
     ↓
updateOrganizationStatusSchema
     ↓
Fetch Current Organization
     ↓
Lifecycle Transition Validation
     ↓
Repository Update
```
