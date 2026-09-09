**1. Test Project APIs**

- Your base route is:

`/api/v1/organizations/:organizationId/projects`

| Method | Endpoint                                                     | Purpose       |
| ------ | ------------------------------------------------------------ | ------------- |
| POST   | `/organizations/:organizationId/projects`                    | Create        |
| GET    | `/organizations/:organizationId/projects`                    | Get all       |
| GET    | `/organizations/:organizationId/projects/:projectId`         | Get one       |
| PATCH  | `/organizations/:organizationId/projects/:projectId`         | Update        |
| PATCH  | `/organizations/:organizationId/projects/:projectId/status`  | Change status |
| DELETE | `/organizations/:organizationId/projects/:projectId`         | Soft delete   |
| POST   | `/organizations/:organizationId/projects/:projectId/restore` | Restore       |

- **Recommended Testing Sequence**

- Don't test randomly. Use this sequence:

```js
1. Create Application
       ↓
2. Get All Applications
       ↓
3. Get Application By ID
       ↓
4. Update Application
       ↓
5. DRAFT → ACTIVE
       ↓
6. Invalid Status Transition
       ↓
7. Duplicate Code
       ↓
8. Duplicate Slug
       ↓
9. Wrong Project
       ↓
10. Wrong Organization
       ↓
11. Soft Delete
       ↓
12. Verify Not Found
       ↓
13. Restore
       ↓
14. Verify Restored
       ↓
15. Validation Tests
```

- **Environment endpoints:**

| Method | Endpoint                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| POST   | `/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments`                        |
| GET    | `/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments`                        |
| GET    | `/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments/:environmentId`         |
| PATCH  | `/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments/:environmentId`         |
| PATCH  | `/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments/:environmentId/status`  |
| DELETE | `/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments/:environmentId`         |
| POST   | `/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments/:environmentId/restore` |

- **Recommended Testing Order Environment**

- Use this exact sequence:

```js

1. Create Development
        ↓
2. Create Staging
        ↓
3. Create Production
        ↓
4. Get All
        ↓
5. Get By ID
        ↓
6. Update
        ↓
7. DRAFT → ACTIVE
        ↓
8. ACTIVE → MAINTENANCE
        ↓
9. MAINTENANCE → ACTIVE
        ↓
10. Invalid Status
        ↓
11. Duplicate Code
        ↓
12. Duplicate Slug
        ↓
13. Wrong Application
        ↓
14. Wrong Project
        ↓
15. Wrong Organization
        ↓
16. Soft Delete
        ↓
17. Verify Deleted
        ↓
18. Restore
        ↓
19. Verify Restored
        ↓
20. Validation Tests
```
