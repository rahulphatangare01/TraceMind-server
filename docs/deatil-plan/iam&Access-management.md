#### STEP 3 → TraceMind IAM & Access Management

- Goal

- Build a secure, tenant-aware Identity and Access Management system.

- The IAM system must support:

```js
TraceMind Platform Admin
        ↓
Organization
        ↓
Organization Admin
        ↓
Custom Roles
        ↓
Users
        ↓
RBAC + UBAC
```

**3.1 User Management**

- Core entities:

```js
users;
user_profiles;
user_security;
organization_members;
```

- User information can include:

```js
User
├── id
├── email
├── password_hash
├── first_name
├── last_name
├── display_name
├── status
├── email_verified
├── last_login_at
├── password_changed_at
├── created_at
└── updated_at
```

- Important: a user should not belong directly to only one organization.

- A future customer may have:

```js
User A
├── Organization A → Admin
└── Organization B → Viewer
```

- So:

```js
users + organization_members;
```

- is better than storing one organization_id directly on the user.

**3.2 Organization Membership**

```js
organization_members
├── id
├── organization_id
├── user_id
├── membership_status
├── joined_at
├── invited_by
└── metadata
```

- Membership statuses:

```js
INVITED;
ACTIVE;
SUSPENDED;
REMOVED;
```

- This provides clean tenant isolation.

**3.3 Authentication**

- Authentication responsibilities:

```js
Registration
Login
Logout
Email Verification
Password Reset
Password Change
Refresh Token
Session Management
Device Management
```

- Recommended flow:

```js
User
↓
Login
↓
Credential Validation
↓
Account Status Check
↓
Security Checks
↓
Create Session
↓
Generate Tokens
↓
Return Access Credentials
```

- Future support:

```js
MFA / 2FA
Passkeys
SSO
SAML
OAuth
Enterprise Identity Providers
```

**3.4 Session Management**

- Separate sessions from authentication tokens.

```js
User
 ↓
Session
 ├── Device
 ├── IP
 ├── Country
 ├── Login Time
 ├── Last Activity
 ├── Token Information
 └── Session Status
```

- Future customer settings:

```js
Maximum active devices: 2
Maximum sessions: 3
Session timeout: 30 minutes
Force logout: Enabled
```

**3.5 RBAC**

- Role Based Access Control:

```js
Organization
↓
Roles
↓
Permissions
↓
Users
```

- Example:

```js
Owner
Admin
Developer
Viewer
Security Analyst
Custom Role
```

- Permissions should not be hardcoded only as:

`isAdmin = true`

- Instead:

```js
logs.read;
logs.delete;
metrics.read;
alerts.manage;
users.invite;
billing.manage;
```

- This gives us module-level permission control.

**3.6 Customer-Created Custom Roles**

- This is important for TraceMind.

```js
Customer Organization
       ↓
Create Custom Role
       ↓
Select Permissions
       ↓
Assign Users
```

- Example:

```js
Role: Production Support Engineer

✓ logs.read
✓ traces.read
✓ incidents.read
✓ incidents.update
✗ users.manage
✗ billing.manage
```

**3.7 UBAC**

- UBAC should provide permissions beyond roles.
- A user may have a role:

`Developer`

- but receive an additional direct permission:

`aiops.execute`

- or restriction:

`logs.read only for Application A`

- Therefore:

```js
Effective Access
=
Role Permissions
+
Direct User Permissions
-
Explicit User Restrictions
```

- This should also support future resource-level access.

**3.8 Permission Engine**

- The Permission Engine should centralize all authorization.

```js
Request
   ↓
Authentication
   ↓
Tenant Context
   ↓
Permission Engine
   ↓
Entitlement Check
   ↓
Resource Access Check
   ↓
Allow / Deny
```

- Eventually:

```js
Can User X
perform Action Y
on Resource Z
inside Organization A?
```

- Example:

```js
User: user_123;
Organization: org_123;
Action: logs.read;
Resource: application_app_456;
```

**3.9 Platform-Level Administration**

- TraceMind itself needs separate platform administration.

```js
Platform SuperAdmin
↓
Manage Organizations
Manage Modules
Manage Plans
Manage Global Settings
Manage Suspensions
View Platform Health
```

- Important separation:

```js
TraceMind Platform Admin
≠
Customer Organization Admin
```

#### STEP 3 Final Flow

Authentication
↓
Session
↓
User Identity
↓
Organization Membership
↓
RBAC +
UBAC
↓
Permission Engine
↓
Resource Access
