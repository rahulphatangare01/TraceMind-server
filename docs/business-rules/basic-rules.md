### 1. Business Rules

##### Organization

```js
Create Organization
↓
Check Code is unique
Check Slug is unique
↓
Create

```

##### Project

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

##### Application

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

##### Environment

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
