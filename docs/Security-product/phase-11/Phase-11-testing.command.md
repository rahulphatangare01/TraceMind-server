### Spec Testing File command

```js
npx vitest run src/modules/security-product/**tests**/security-core.port.spec.ts
npx vitest run src/modules/security-product/**tests**/tenant-resource-ownership.service.spec.ts
npx vitest run src/modules/security-product/**tests**/common-infrastructure.port.spec.ts
npx vitest run src/modules/security-product/**tests**/tenant-resource-ownership.service.spec.ts
npx vitest run src/modules/security-product/**tests**/security-core.port.spec.ts
npx vitest run src/modules/security-product/**tests**/security-product-services.spec.ts
npx vitest run src/modules/security-product/**tests**/security-product-persistence.port.spec.ts
npx vitest run src/modules/security-product/**tests**/future-iam.port.spec.ts
npx vitest run src/modules/security-product/**tests**/security-product.architecture-boundary.spec.ts
npx vitest run src/modules/security-product/**tests**/security-product.architecture-boundary.spec.ts




npx vitest run src/modules/security-product/__tests__/security-product-persistence-requirements.spec.ts
npx vitest run src/modules/security-product/__tests__/security-product-schema-design.spec.ts
npx vitest run src/modules/security-product/__tests__/security-resource-persistence-models.spec.ts
npx vitest run src/modules/security-product/__tests__/security-key.mysql.repository.spec.ts
npx vitest run src/modules/security-product/__tests__/security-key-version.mysql.repository.spec.ts
npx vitest run src/modules/security-product/__tests__/security-key.transaction.mysql.adapter.spec.ts
```

### Manual Testing File command

```js
npx tsx src/modules/security-product/**tests**/common-infrastructure.port.manual.ts
npx tsx src/modules/security-product/**tests**/tenant-resource-ownership.manual.ts
npx tsx src/modules/security-product/**tests**/security-product-services.manual.ts
npx tsx src/modules/security-product/**tests**/security-product-persistence.port.manual.ts
npx tsx src/modules/security-product/**tests**/future-iam.port.manual.ts
npx tsx src/modules/security-product/**tests**/security-product-dependency-rules.manual.ts


npx tsx src/modules/security-product/__tests__/security-product-schema-design.manual.ts
```

```js
npm run test:security
npm run test:security:manual
npm run type-check
npm run build
```
