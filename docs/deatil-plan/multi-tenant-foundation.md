### STEP 2 — Multi-Tenant Foundation

```js
TraceMind Platform
       ↓
Organization / Tenant
       ↓
Project
       ↓
Application
       ↓
Environment
       ↓
Telemetry Data
```

**1. Core Tenant Hierarchy**

```js
TraceMind Platform
       │
       ▼
Organization (Tenant)
       │
       ├── Organization Users
       │
       ├── Projects
       │      │
       │      ├── Applications
       │      │      │
       │      │      └── Environments
       │      │      │       ├── Local
       │      │      │       ├── Development
       │      │      │       ├── Test
       │      │      │       ├── UAT
       │      │      │       └── Production
       │      │
       │      └── Other Applications
       │
       ├── Subscription
       ├── Enabled Modules
       ├── RBAC / UBAC
       └── Organization Settings
```

Example :-

```js
TraceMind
│
├── Company A
│   ├── Project: E-Commerce
│   │   ├── Web API
│   │   │   ├── Development
│   │   │   └── Production
│   │   │
│   │   └── Mobile App
│   │       └── Production
│
└── Company B
    └── Project: Banking Platform
        └── Backend API
            ├── UAT
            └── Production
```

**Company A must never be able to access Company B's data.**

**2. Module Structure**

Add a dedicated tenant module:

```js
src/
└── modules/
    └── tenants/
        ├── models/
        ├── repositories/
        ├── services/
        ├── controllers/
        ├── routes/
        ├── types/
        └── index.ts
```

- Organization as the business-facing name and Tenant as the internal SaaS isolation concept.

- For example:

```js
Tenant = Internal isolation boundary
Organization = Customer-facing entity
```

**3. Core Database Entities**

- For STEP 2, I recommend creating these four main entities:

```js
organizations;
projects;
applications;
environments;
```

- Relationship:

```js
Organization
│
│ 1 : Many
▼
Project
│
│ 1 : Many
▼
Application
│
│ 1 : Many
▼
Environment
```

- Later, IAM will add:

```js
users;
organization_members;
roles;
permissions;
user_permissions;
```

- Not mix IAM tables into STEP 2 yet.

**4. Organization Model**

- The Organization is the top-level customer boundary.

- Suggested fields:

```js
organizations
│
├── id
├── organization_code
├── name
├── slug
├── display_name
│
├── status
│ ├── ACTIVE
│ ├── SUSPENDED
│ ├── INACTIVE
│ └── DELETED
│
├── organization_type
│ ├── CUSTOMER
│ ├── INTERNAL
│ ├── PARTNER
│ └── TRIAL
│
├── timezone
├── country_code
│
├── settings
│
├── created_at
├── updated_at
└── deleted_at
```

- Important fields

```js
id → internal UUID/unique ID
organization_code → human-friendly internal identifier
slug → URL/dashboard identifier
status → controls organization access
settings → future organization-level configuration JSON
```

- Example URL later:

```js
app.tracemind.com / acme - corp / dashboard;
```

**5. Project Model**

- A project groups related applications.

```js
projects
│
├── id
├── organization_id
│
├── project_code
├── name
├── slug
├── description
│
├── status
│
├── created_at
├── updated_at
└── deleted_at
```

- Example:

```js
Organization: Acme

Projects:
- E-Commerce
- Admin Platform
- Payment System

```

**6. Application Model**

- Each project can have multiple monitored applications.

```js
applications
│
├── id
├── organization_id
├── project_id
│
├── application_code
├── name
├── slug
├── description
│
├── application_type
│   ├── BACKEND
│   ├── FRONTEND
│   ├── MOBILE
│   ├── WORKER
│   ├── SERVICE
│   └── OTHER
│
├── status
│
├── created_at
├── updated_at
└── deleted_at

```

- Why store organization_id here?

- Even though:

`Application → Project → Organization`

- also storing:

`application.organization_id`

- This is intentional denormalization for tenant isolation and high-volume telemetry queries.

- Later:

```js
WHERE organization_id = ?
AND application_id = ?
```

- This is much faster and simpler than repeatedly joining:

```js
telemetry
→ application
→ project
→ organization
```

- For a logging platform, this matters.

**7. Environment Model**

- Each application can have environments.

```js
environments
│
├── id
├── organization_id
├── project_id
├── application_id
│
├── environment_code
├── name
├── environment_type
│   ├── LOCAL
│   ├── DEVELOPMENT
│   ├── TEST
│   ├── UAT
│   ├── STAGING
│   └── PRODUCTION
│
├── status
│
├── settings
│
├── created_at
├── updated_at
└── deleted_at

```

- Again, storing all parent IDs makes telemetry queries easier:

```js
organization_id;
project_id;
application_id;
environment_id;
```

- These will become important fields in nearly every log, trace, metric, and event.

**8. Tenant Context**

- After these entities exist, every request inside TraceMind should eventually operate with a context like:

```js
interface TenantContext {
  organizationId: string;

  projectId?: string;

  applicationId?: string;

  environmentId?: string;
}
```

- Later, this combines with Request Context:

```js
Request Context
      +
Tenant Context
      +
User Context
      ↓
TraceMind Execution Context
```

- Conceptually:

```js
interface TraceMindContext {
requestId: string;
traceId: string;
spanId: string;

organizationId?: string;
projectId?: string;
applicationId?: string;
environmentId?: string;

userId?: string;
sessionId?: string;
}
```

- This will be extremely useful for isolation.

**9. Telemetry Data Design**

- Every future telemetry record should eventually contain:

```js
organization_id     REQUIRED
project_id          optional/required by signal
application_id      REQUIRED
environment_id      REQUIRED

request_id
trace_id
span_id
```

- For example:

```js
api_logs

organization_id
project_id
application_id
environment_id

trace_id
span_id
request_id

...
```

- This allows queries like:

       - Show all production errors for Application X belonging to Organization Y.

- Without joining multiple tables.

**10. Multi-Tenant Isolation Rules**

- From day one, define these rules:

**Rule 1 — Organization is the primary isolation boundary**

- Every customer-owned record should have:

`organization_id`
**Rule 2 — Never trust client-provided organization ID blindly**

- For example, don't allow:

```js
{
"organizationId": "some-other-company-id"
}
```

- to determine access directly.

- Later:

```js
Authenticated User
↓
Organization Membership
↓
Validated Organization Context
↓
Query Database
```

**Rule 3 — Every repository query must be tenant-aware**

- Bad:

```js
SELECT \* FROM applications
WHERE id = ?
```

- Better:

```js
SELECT \* FROM applications
WHERE id = ?
AND organization_id = ?
```

- This becomes critical when multiple customers use TraceMind.
  **Rule 4 — Telemetry ingestion must validate ownership**

- When an SDK sends:

```js
applicationId;
environmentId;
```

- TraceMind must verify that the API key belongs to the correct organization/application/environment.
- Never trust IDs alone.

**11. Recommended ID Strategy**

- Since TraceMind is an external SaaS, I recommend prefixed IDs.

```js
Organization → org_xxxxx
Project      → prj_xxxxx
Application  → app_xxxxx
Environment  → env_xxxxx
```

- For example:

```js
org_8f7d...
prj_a23c...
app_c912...
env_72ef...
```

- Benefits:

```js
Easy debugging
Easier log reading
ID type is immediately visible
Better support operations
Prevents confusing IDs between resources
```

- Your existing ID generator pattern is already suitable:

```js
req_<uuid>
trc_<uuid>
spn_<uuid>
```

- We can later extend it:

```js
org_<uuid>
prj_<uuid>
app_<uuid>
env_<uuid>
```

**12.Status Design**

- Avoid using only:

`isActive: true/false`

- Use proper statuses.

**Organization**

```js
ACTIVE;
SUSPENDED;
INACTIVE;
DELETED;
```

**Project**

```
ACTIVE
ARCHIVED
INACTIVE
DELETED
```

**Application**

```
ACTIVE
INACTIVE
ARCHIVED
DELETED
```

**Environment**

```js
ACTIVE;
INACTIVE;
ARCHIVED;
DELETED;
```

- This gives us much more control for SaaS administration.
