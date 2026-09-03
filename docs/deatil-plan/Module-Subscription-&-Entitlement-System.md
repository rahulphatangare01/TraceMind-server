#### STEP 4 → Module, Subscription & Entitlement System

- Goal

- TraceMind should support module-based SaaS pricing without coupling business logic to subscription plans.

- This is critical:

```js
Subscription Plan
↓
Entitlements
↓
Modules / Features
↓
Access
```

- Not:

`if plan === "PREMIUM"`

- throughout the application.

**4.1 Module Registry**

- Central registry:

```js
modules
├── id
├── module_code
├── name
├── description
├── status
├── version
└── metadata
```

- Examples:

```js
LOGS;
METRICS;
TRACES;
API_MONITORING;
ERROR_TRACKING;
ALERTING;
INCIDENTS;
AIOPS;
SECURITY;
DATABASE_MONITORING;
RUM;
```

- Each module should remain decoupled.

**4.2 Feature Registry**

- A module can contain features.

```js
AIOPS
├── ROOT_CAUSE_ANALYSIS
├── ANOMALY_DETECTION
└── SOLUTION_RECOMMENDATION
```

- Database concept:

```js
modules
↓
module_features
```

- This enables granular pricing.

**4.3 Subscription Plans**

- Example:

```js
STARTER;
PROFESSIONAL;
ENTERPRISE;
CUSTOM;
```

- A plan defines a package but should not directly control application code.

```js
Plan
↓
Entitlement Definitions
↓
Organization Entitlements
```

**4.4 Organization Subscription**

- Each organization can have:

```js
Subscription
├── plan
├── status
├── start_date
├── end_date
├── billing_cycle
└── limits
```

- Statuses:

```js
TRIAL;
ACTIVE;
PAST_DUE;
SUSPENDED;
CANCELLED;
EXPIRED;
```

**4.5 Organization Modules**

- Customers may purchase individual modules.

```
Organization A
├── LOGS ✓
├── METRICS ✓
├── TRACES ✓
├── ALERTING ✓
└── AIOPS ✗
```

- This is independent of user permissions.

**4.6 Usage Limits**

- Entitlements should also support limits:

```js
Logs per month
Data ingestion GB
Retention days
Applications
Users
Projects
Alerts
Dashboards
API requests
AI analysis requests
```

- Example:

```js
Organization
↓
LOGS
↓
Max ingestion: 100 GB/month
Retention: 30 days
```

**4.7 Entitlement Engine**

- Every protected feature should eventually follow:

```js
Request
↓
Authentication
↓
RBAC / UBAC
↓
Subscription Entitlement
↓
Usage Limit
↓
Allow / Deny
```

**Important distinction:**

```js
Permission: "Can this user access Logs?";

Entitlement: "Has this organization purchased Logs?";

Usage: "Has the organization exceeded its limit?";
```

- All three are required.

**4.8 Module Lifecycle**

- Platform administrators should control:

```js
Module
├── ENABLED
├── DISABLED
├── BETA
├── DEPRECATED
└── MAINTENANCE
```

- This supports beta features and controlled rollout.
