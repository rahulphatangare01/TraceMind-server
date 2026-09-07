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

## Tenant Service Business Rules & Hierarchy Validation

### STEP 2.6.6 — Architecture

```js
Controller
   ↓
Zod Validation
   ↓
Service
   ├── Validate parent hierarchy
   ├── Check entity exists
   ├── Check tenant ownership
   ├── Check uniqueness
   ├── Apply business rules
   ├── Build entity
   ↓
Repository
   ↓
MySQL
```

- Our hierarchy is:

```js
Organization
     │
     └── Project
            │
            └── Application
                   │
                   └── Environment
```

-The service must never trust parent IDs blindly.

#### 1. Business Rules We Will Implement

- **Organization**

```js
Create Organization
    ↓
Check Code is unique
Check Slug is unique
    ↓
Create
```

- **Project**

```js
Create Project
    ↓
Organization exists?
Organization is deleted?
Organization status allows creation?
    ↓
Project code unique inside Organization?
Project slug unique inside Organization?
    ↓
Create
```

- **Application**

```js
Create Application
    ↓
Organization exists?
Project exists?
Project belongs to Organization?
    ↓
Application code unique inside Project?
Application slug unique inside Project?
    ↓
Create
```

- **Environment**

```js
Create Environment
    ↓
Organization exists?
Project exists?
Project belongs to Organization?
Application exists?
Application belongs to Project + Organization?
    ↓
Environment slug unique inside Application?
    ↓
Create
```

```js
ProjectService
      ↓
ProjectRepository
      ↓
OrganizationRepository
```

- The database must also enforce uniqueness:

```js
Organizations;
UNIQUE(code);
UNIQUE(slug);

Projects;
UNIQUE(organization_id, code);
UNIQUE(organization_id, slug);

Applications;
UNIQUE(project_id, code);
UNIQUE(project_id, slug);

Environments;
UNIQUE(application_id, slug);
```

- After STEP 2.6.6:

```js
✓ Parent hierarchy validated
✓ Cross-tenant access prevented
✓ Entity ownership checked
✓ Code uniqueness validated
✓ Slug uniqueness validated
✓ Archived parent restrictions enforced
✓ Services own business logic
✓ Repositories remain persistence-focused
✓ Database remains the final integrity layer
```

- centralized enterprise-level errors such as:

```js
NotFoundError;
ConflictError;
BusinessRuleError;
TenantHierarchyError;
InvalidLifecycleTransitionError;
```

#### STEP 2.6.7 — Tenant Error Handling & Domain Exceptions

##### 1. Target Architecture

```js
Controller
    ↓
Service
    ↓
Domain Exception
    ↓
Global Error Middleware
    ↓
Standard API Error Response
```

- For example:

```js
ProjectService
    ↓
Organization not found
    ↓
NotFoundError
    ↓
Global Error Handler
    ↓
HTTP 404
```
