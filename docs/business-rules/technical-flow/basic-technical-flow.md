#### STEP 2.6 — Tenant Database & Persistence Foundation

**1. Final Tenant Data Hierarchy**

```js
   organizations
   │
   │ 1 : N
   ▼
   projects
   │
   │ 1 : N
   ▼
   applications
   │
   │ 1 : N
   ▼
   environments
```

- However, for an enterprise observability platform, I recommend storing organization_id directly in all child tables:

```js
Organization
│
├── Project
│ organization_id
│
├── Application
│ project_id
│ organization_id
│
└── Environment
application_id
project_id
organization_id
```

- Why duplicate parent IDs?

- This is intentional tenant denormalization.

- It makes future queries much safer and faster:

```js
Telemetry Query
↓
WHERE organization_id = ?
AND project_id = ?
AND application_id = ?
AND environment_id = ?
```

- This will become extremely useful for:

```js
Logs
Metrics
Traces
Errors
Audit logs
Security events
Dashboards
Alerts
AIOps
```

- Important rule
- The hierarchy must always remain consistent:

**2. Database Table Design**

- I recommend the following tables.

```js
organizations;
projects;
applications;
environments;
```

- Future tenant-related tables:

```js
organization_members;
organization_settings;
organization_domains;
organization_api_keys;
organization_modules;
```

- We don't need to create those yet.

**3. Common Column Standard**

- All core tenant tables should follow this pattern:

```js
id
organization_id ← except organizations

status

created_at
updated_at
deleted_at
```

- I also strongly recommend audit ownership columns:

```js
created_by;
updated_by;
deleted_by;
```

- Final common audit structure

```js
created_at;
created_by;
updated_at;
updated_by;

deleted_at;
deleted_b;
```

---

**4. organizations Table**

- Recommended structure:

```js
organizations
────────────────────────────────────
id                         VARCHAR(36) PK

name                       VARCHAR(150)
display_name               VARCHAR(150)

code                       VARCHAR(50)
slug                       VARCHAR(150)

type                       VARCHAR(30)
status                     VARCHAR(30)

timezone                   VARCHAR(100)
country_code               CHAR(2)

settings                   JSON

created_at                 DATETIME(3)
updated_at                 DATETIME(3)
deleted_at                 DATETIME(3) NULL

created_by                 VARCHAR(36) NULL
updated_by                 VARCHAR(36) NULL
deleted_by                 VARCHAR(36) NULL
```

- Primary key
  `PRIMARY KEY (id)`
- Unique constraints

```js
UNIQUE(code);
UNIQUE(slug);
```

- For globally unique organization identity, this is correct.

**5. `projects` Table**

```js
projects
────────────────────────────────────
id                         VARCHAR(36) PK

organization_id            VARCHAR(36) NOT NULL

name                       VARCHAR(150)
display_name               VARCHAR(150)

code                       VARCHAR(50)
slug                       VARCHAR(150)

description                VARCHAR(1000) NULL

status                     VARCHAR(30)

settings                   JSON

created_at                 DATETIME(3)
updated_at                 DATETIME(3)
deleted_at                 DATETIME(3) NULL

created_by                 VARCHAR(36) NULL
updated_by                 VARCHAR(36) NULL
deleted_by                 VARCHAR(36) NULL
```

- Foreign key

```js
projects.organization_id
↓
organizations.id
```

- Recommended unique constraints

```js
UNIQUE(organization_id, code);
```

- and:

```js
UNIQUE(organization_id, slug);
```

- This means:

```js
Organization A → PROJECT = PAYMENT
Organization B → PROJECT = PAYMENT
```

- Both are allowed.

- But inside one organization:

```js
Organization A
├── PAYMENT ✓
└── PAYMENT ✗ 6. applications Table
```

- Recommended structure:

```js

applications
────────────────────────────────────
id                         VARCHAR(36) PK

organization_id            VARCHAR(36) NOT NULL
project_id                 VARCHAR(36) NOT NULL

name                       VARCHAR(150)
display_name               VARCHAR(150)

code                       VARCHAR(50)
slug                       VARCHAR(150)

type                       VARCHAR(50)

description                VARCHAR(1000) NULL

status                     VARCHAR(30)

settings                   JSON

created_at                 DATETIME(3)
updated_at                 DATETIME(3)
deleted_at                 DATETIME(3) NULL

created_by                 VARCHAR(36) NULL
updated_by                 VARCHAR(36) NULL
deleted_by                 VARCHAR(36) NULL
```

- Foreign keys

```js
applications.organization_id
↓
organizations.id
applications.project_id
↓
projects.id
```

- Unique constraints

- Recommended:

```js
UNIQUE(project_id, code);
```

```
UNIQUE (
project_id,
slug
)
```

- So:

```js
Project A
├── PAYMENT_API ✓
├── USER_API ✓
└── PAYMENT_API ✗
```

- But another project can have:

`PAYMENT_API ✓`
**7. environments Table**

- Recommended structure:

```js
environments
────────────────────────────────────
id                         VARCHAR(36) PK

organization_id            VARCHAR(36) NOT NULL
project_id                 VARCHAR(36) NOT NULL
application_id             VARCHAR(36) NOT NULL

name                       VARCHAR(150)
display_name               VARCHAR(150)

slug                       VARCHAR(150)

type                       VARCHAR(50)
custom_type                VARCHAR(100) NULL

description                VARCHAR(1000) NULL

status                     VARCHAR(30)

settings                   JSON

created_at                 DATETIME(3)
updated_at                 DATETIME(3)
deleted_at                 DATETIME(3) NULL

created_by                 VARCHAR(36) NULL
updated_by                 VARCHAR(36) NULL
deleted_by                 VARCHAR(36) NULL
```

- Foreign keys

```js
  organization_id → organizations.id
  project_id → projects.id
  application_id → applications.id
```

- Unique constraints

- Recommended:

```js
UNIQUE(application_id, slug);
```

- This allows:

```js
Payment API
├── development
├── staging
└── production
```

- But prevents:

```js
Payment API
├── production
└── production ✗
```

**8. Composite Foreign Key — Recommended Improvement**

- Because we intentionally store parent IDs for tenant isolation, I recommend using composite foreign keys where appropriate.

- For example, first ensure Project has:

`UNIQUE (id, organization_id)`

- Then Application can enforce:

```js
FOREIGN KEY (project_id, organization_id)
REFERENCES projects (id, organization_id)
```

- This guarantees an application cannot accidentally contain:

```js
project_id = Project from Organization A
organization_id = Organization B
```

- That is a major enterprise safety improvement.

- Similarly:

- Application
  `UNIQUE (id, project_id, organization_id)`

- Environment

```js
FOREIGN KEY (
application_id,
project_id,
organization_id
)
REFERENCES applications (
id,
project_id,
organization_id
)
```

- This enforces the hierarchy at the database level.

- Final relationship protection

```js
Organization A
    │
    └── Project A
           │
           └── Application A
                  │
                  └── Environment A

```

- A cross-tenant hierarchy cannot be inserted accidentally.

---

**9. Recommended Foreign Key Policy**

- I recommend:

```js
ON DELETE RESTRICT
ON UPDATE RESTRICT
```

- For all tenant hierarchy foreign keys.

- Why?

- We use soft delete:

`deleted_at = timestamp`

- So physical database deletion should not cascade.

- Avoid:

`ON DELETE CASCADE`

- because this could accidentally delete:

```js
Organization
↓
Projects
↓
Applications
↓
Environments
↓
Future telemetry data
```

- That would be dangerous.

**10. Soft Delete Strategy**

- All tenant entities use:

```js
deleted_at DATETIME(3) NULL
deleted_by VARCHAR(36) NULL
```

- Active record
  `deleted_at = NULL`
- Deleted record
  `deleted_at = 2026-09-03 10:30:00.123`

- Standard repository rule

- Every normal query automatically includes:

`WHERE deleted_at IS NULL`

-For example:

```js
findById();
findBySlug();
findAll();
findByOrganization();
```

- should never return deleted records by default.

- Only special methods may include deleted records:

```js
findDeletedById();
findAllIncludingDeleted();
restore();
```

**11. Soft Delete + Unique Constraint Problem**

- This is important.

- Suppose we have:

```js
Organization A

Project:
slug = payment
deleted_at = NULL
```

- Then the project is soft deleted:

```js
slug = payment
deleted_at = 2026...
```

- Now the user creates another:

`slug = payment`

- A normal MySQL unique constraint:

`UNIQUE (organization_id, slug)`

- will still reject it.

- Recommended solution

- For now, keep uniqueness strict:

`A deleted resource still reserves its code/slug.`

- This is safer for:

```js
Auditability
URL identity
Historical telemetry
Resource restoration
Security
```

- If reuse is needed later, create an explicit process such as:

```js
restore
rename deleted resource
purge after retention period
```

- I recommend not adding deleted_at to unique constraints.

**12. Index Strategy**

-Indexes should support the most common access patterns.

##### Organizations

```js
PRIMARY KEY (id)

INDEX (status)

INDEX (deleted_at)
```

- code and slug already have unique indexes.

##### Projects

```
PRIMARY KEY (id)

INDEX (organization_id)

INDEX (organization_id, status)

INDEX (organization_id, deleted_at)

INDEX (organization_id, created_at)
```

##### Applications

```js
PRIMARY KEY (id)

INDEX (organization_id)

INDEX (organization_id, project_id)

INDEX (project_id)

INDEX (organization_id, status)

INDEX (organization_id, project_id, status)

INDEX (organization_id, deleted_at)

```

##### Environments

```js
PRIMARY KEY (id)

INDEX (organization_id)

INDEX (organization_id, project_id)

INDEX (organization_id, project_id, application_id)

INDEX (application_id)

INDEX (organization_id, status)

INDEX (organization_id, application_id, status)

INDEX (organization_id, deleted_at)
```

- These indexes are useful for future telemetry queries.

**13. Tenant Isolation Rules**

- This is one of the most important rules in TraceMind.

- **Rule 1 — Every tenant-owned query starts with organization_id**

- For example:

`BAD`

```js
SELECT \*
FROM applications
WHERE id = ?
```

- Better:

```js
SELECT \*
FROM applications
WHERE id = ?
AND organization_id = ?
AND deleted_at IS NULL
```

- This applies to:

```js
Projects
Applications
Environments
Logs
Metrics
Traces
Errors
Alerts
Dashboards
API Keys
IAM Resources
```

- **Rule 2 — Never trust tenant IDs directly from arbitrary request body data**

- Trusted tenant identity should eventually come from:

```js
JWT / Session
↓
Authentication
↓
Tenant Context
↓
organizationId
```

- For nested resources:

```js
Route Parameter

- Tenant Context
```

- Example:

`POST /projects/:projectId/applications`

- The service must verify:

`projectId belongs to organizationId`

- before creating the Application.

- **Rule 3 — SuperAdmin is not exempt from query safety**

- Even platform SuperAdmin should explicitly select the tenant context.

- For example:

```js
SuperAdmin
↓
Select Organization
↓
Tenant Context
↓
organizationId applied to query
```

- Do not create repository methods that automatically return all tenants merely because the user is SuperAdmin.

- Instead, use explicit platform-level repository methods.

- This prevents accidental cross-tenant leakage.
