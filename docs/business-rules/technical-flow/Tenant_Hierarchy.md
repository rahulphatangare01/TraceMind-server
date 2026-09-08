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

### STEP 2.6.7 — Tenant Error Handling & Domain Exceptions

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

#### Standard API Error Response

- Eventually every API should return the same structure.

- Example:

```js
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Organization with identifier \"org_123\" was not found"
  },
  "requestId": "req_xxx",
  "traceId": "trc_xxx"
}
```

- For validation:

```js
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  },
  "requestId": "req_xxx",
  "traceId": "trc_xxx"
}
```

- This fits directly with the Request Context Foundation we already created.

#### Why This Is Important for TraceMind

- This error system will eventually integrate with your Logger/Monitoring system:

```js
Request
   ↓
Request Context
   ├── requestId
   ├── traceId
   ├── spanId
   └── sessionId
          ↓
       Service
          ↓
       Error
          ↓
 Global Error Handler
          ↓
 MonitoringLoggerService
          ↓
 API Request Logs
 Security Events
 Audit Logs
 Error Events
```

- So an error can eventually be correlated across:

```js
Trace ID
Request ID
Span ID
Session ID
Organization ID
Project ID
Application ID
Environment ID
User ID
```

- We now have the foundation for:

```js
✓ AppError
✓ ValidationError
✓ NotFoundError
✓ ConflictError
✓ UnauthorizedError
✓ ForbiddenError
✓ BusinessRuleError
✓ TenantHierarchyError
✓ LifecycleTransitionError
✓ Global Error Handler
✓ Standard API Error Response
✓ Request/Trace correlation
```

### STEP 2.6.8 — Tenant Service Refinement & Lifecycle Rules

- because we now know the four entities have different statuses:

```js
Organization → PENDING, ACTIVE, INACTIVE, SUSPENDED, ARCHIVED
Project      → DRAFT, ACTIVE, ON_HOLD, INACTIVE, ARCHIVED
Application  → entity-specific statuses
Environment  → DRAFT, ACTIVE, MAINTENANCE, INACTIVE, ARCHIVED
```

- We will make lifecycle rules:

```js
- Entity-specific
- Type-safe
- Explicit
- Easy to extend
- Consistent across services
- Compatible with soft deletion
- Protected against invalid state transitions
```

- Final lifecycle architecture

```js
Organization
    ↓
OrganizationStatus
    ↓
Organization Transition Rules

Project
    ↓
ProjectStatus
    ↓
Project Transition Rules

Application
    ↓
ApplicationStatus
    ↓
Application Transition Rules

Environment
    ↓
EnvironmentStatus
    ↓
Environment Transition Rules
```

#### Final service lifecycle flow

- After this change, every changeStatus() follows the same architecture:

```js
Controller
   │
   ▼
Service
   │
   ├── Find entity
   │
   ├── Validate hierarchy
   │
   ├── Validate lifecycle transition
   │
   ├── Validate business rules
   │
   ▼
Repository
   │
   ▼
MySQL
```

- For example:

```js
Organization ACTIVE
        │
        │ changeStatus(SUSPENDED)
        ▼
OrganizationService
        │
        ▼
validateOrganizationStatusTransition()
        │
        ├── allowed?
        │      │
        │      ├── YES → Repository
        │      │
        │      └── NO → LifecycleTransitionError
        │
        ▼
MySQL
```

#### transition matrix

- For the current TraceMind tenant foundation:
  | Entity | Current | Allowed Next |
  | ------------ | ----------- | ------------------------------- |
  | Organization | PENDING | ACTIVE, INACTIVE |
  | Organization | ACTIVE | INACTIVE, SUSPENDED, ARCHIVED |
  | Organization | INACTIVE | ACTIVE, ARCHIVED |
  | Organization | SUSPENDED | ACTIVE, INACTIVE, ARCHIVED |
  | Organization | ARCHIVED | — |
  | Project | DRAFT | ACTIVE, ARCHIVED |
  | Project | ACTIVE | ON_HOLD, INACTIVE, ARCHIVED |
  | Project | ON_HOLD | ACTIVE, INACTIVE, ARCHIVED |
  | Project | INACTIVE | ACTIVE, ARCHIVED |
  | Project | ARCHIVED | — |
  | Application | DRAFT | ACTIVE, ARCHIVED |
  | Application | ACTIVE | MAINTENANCE, INACTIVE, ARCHIVED |
  | Application | MAINTENANCE | ACTIVE, INACTIVE, ARCHIVED |
  | Application | INACTIVE | ACTIVE, ARCHIVED |
  | Application | ARCHIVED | — |
  | Environment | DRAFT | ACTIVE, ARCHIVED |
  | Environment | ACTIVE | MAINTENANCE, INACTIVE, ARCHIVED |
  | Environment | MAINTENANCE | ACTIVE, INACTIVE, ARCHIVED |
  | Environment | INACTIVE | ACTIVE, ARCHIVED |
  | Environment | ARCHIVED | — |

## STEP 2.7 — Tenant API Layer

- At this stage, our tenant domain and persistence layer are ready. The next logical step is to expose them through a clean, production-ready REST API.

- The goal is:

```js

                    TraceMind API
                         │
                         ▼
                  ┌──────────────┐
                  │   Router     │
                  └──────┬───────┘
                         ▼
                  ┌──────────────┐
                  │  Controller  │
                  └──────┬───────┘
                         ▼
                  ┌──────────────┐
                  │   Service    │
                  └──────┬───────┘
                         ▼
                  ┌──────────────┐
                  │  Repository  │
                  └──────┬───────┘
                         ▼
                       MySQL
```

- We should not add authentication/RBAC yet because that belongs to STEP 3. However, the API structure should be designed so IAM can be plugged in later without rewriting controllers/services.

**STEP 2.7 Breakdown**

- We'll implement this incrementally:

```js
STEP 2.7 — Tenant API Layer

2.7.1 → API Response Standard
2.7.2 → Request Validation Middleware
2.7.3 → Organization Controller
2.7.4 → Organization Routes
2.7.5 → Project Controller & Routes
2.7.6 → Application Controller & Routes
2.7.7 → Environment Controller & Routes
2.7.8 → Tenant Router Registration
2.7.9 → API Error Integration
2.7.10 → API Testing & Refinement
```

**Important controller rule**

- When we start implementing controllers, controllers should not contain business logic.

- For example, don't do this:

```js
if (organization.status === "ARCHIVED") {
  ...
}
```

- inside the controller.

Instead:

```js
Controller
    ↓
validate request
    ↓
Service
    ↓
business rules
```

- The controller's responsibility is:

```js
HTTP Request
↓
Extract params/body
↓
Call service
↓
Return HTTP response
```

- After 2.7 is complete, we'll have endpoints approximately like:

- **Target Organization API**

```js
POST /api/v1/organizations
GET /api/v1/organizations
GET /api/v1/organizations/:organizationId
PATCH /api/v1/organizations/:organizationId
PATCH /api/v1/organizations/:organizationId/status
DELETE /api/v1/organizations/:organizationId
POST /api/v1/organizations/:organizationId/restore
```

- **Projects**:

```js
POST /api/v1/organizations/:organizationId/projects
GET /api/v1/organizations/:organizationId/projects
GET /api/v1/organizations/:organizationId/projects/:projectId
PATCH /api/v1/organizations/:organizationId/projects/:projectId
PATCH /api/v1/organizations/:organizationId/projects/:projectId/status
DELETE /api/v1/organizations/:organizationId/projects/:projectId
POST /api/v1/organizations/:organizationId/projects/:projectId/restore
```

- **Applications**:

```js
POST /api/v1/organizations/:organizationId/projects/:projectId/applications
GET /api/v1/organizations/:organizationId/projects/:projectId/applications
GET /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId
PATCH /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId
PATCH /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId/status
DELETE /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId
POST /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId/restore
```

- **Environments**:

```js
POST /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments
GET /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments
GET /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments/:environmentId
PATCH /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments/:environmentId
PATCH /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments/:environmentId/status
DELETE /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments/:environmentId
POST /api/v1/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments/:environmentId/restore
```

- This hierarchy is intentional.

- It prevents APIs such as:

`GET /projects/project_123`

- from becoming ambiguous across organizations.

- **Why /api/v1**

- Use:

`/api/v1`

- from the beginning.

- Later:

`/api/v2`

- can coexist without breaking existing clients.

#### STEP 2.7.2 — Request Validation Middleware

- **1. Target architecture**

- We want:

```js
HTTP Request
     │
     ▼
Request Context Middleware
     │
     ▼
Validation Middleware
     │
     ├── Invalid → ValidationError → Global Error Handler
     │
     ▼
Controller
     │
     ▼
Service
     │
     ▼
Repository
```

- The important rule is:

- `Validate at the API boundary, enforce business rules in the service.`

- So Zod handles things like:

```js
required fields
string length
format
enum values
UUID/string structure
request body shape
```

- while services handle:

```js
duplicate organization code
parent hierarchy
archived organization restrictions
lifecycle transitions
authorization later
```

```js
Request
   │
   ▼
validateRequest()
   │
   ├── invalid
   │      ↓
   │ ValidationError
   │      ↓
   │ Global Error Handler
   │
   └── valid
          ↓
      Controller
```

**Middleware ordering**

- This is important.

- In app.ts, the order should eventually be:

```js
app.use(requestContextMiddleware);

app.use(express.json());

app.use("/api/v1", apiRouter);

app.use(errorHandlerMiddleware);
```

- Conceptually:

```js
                    HTTP Request
                         │
                         ▼
              Request Context Middleware
                         │
                         ▼
                  JSON Body Parser
                         │
                         ▼
                     API Router
                         │
                         ▼
               Request Validation
                         │
                         ▼
                    Controller
                         │
                         ▼
                     Service
                         │
                         ▼
                   Repository
                         │
                         ▼
                      MySQL
                         │
                         ▼
                Global Error Handler
```

- The request-context middleware must execute before the API routes and error handler, otherwise `requestId` and `traceId` won't reliably exist when an error occurs.

-Don't mix validation response formatting into api-response.ts.

- Responsibilities should remain:

```js
api-response.ts
    ↓
Response contracts

api-response utility
    ↓
Success response helpers

validation.middleware.ts
    ↓
Request validation

errors/
    ↓
Domain/application errors

error-handler.middleware.ts
    ↓
HTTP error conversion
```

- That's much cleaner for the long-term TraceMind architecture.
