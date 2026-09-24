import {
  ProviderError,
  ProviderNotFoundError,
  ProviderUnavailableError,
  ProviderDisabledError,
  ProviderRegistryError,
  ProviderResolverError,
  ProviderFactoryError,
  ProviderConfigurationError,
  ProviderValidationError,
  ProviderCapabilityError,
  ProviderLifecycleError,
} from "../../../errors/index.js";

import { ProviderErrorCode } from "../../../types/provider-error.types.js";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
};

console.log("==============================================");

console.log("Phase 7.11 - Provider Error Model");

console.log("==============================================");

/**
 * 1. Base ProviderError
 */
const providerError = new ProviderError(
  "Provider operation failed",
  ProviderErrorCode.PROVIDER_OPERATION_FAILED,
);

assert(providerError instanceof Error, "ProviderError should extend Error");

assert(
  providerError instanceof ProviderError,
  "ProviderError instance should be created",
);

assert(
  providerError.code === ProviderErrorCode.PROVIDER_OPERATION_FAILED,
  "ProviderError code should be preserved",
);

console.log("✓ ProviderError");

/**
 * 2. ProviderNotFoundError
 */
const notFoundError = new ProviderNotFoundError("Provider not found");

assert(
  notFoundError instanceof ProviderError,
  "ProviderNotFoundError should extend ProviderError",
);

assert(
  notFoundError.code === ProviderErrorCode.PROVIDER_NOT_FOUND,
  "ProviderNotFoundError code should be correct",
);

console.log("✓ ProviderNotFoundError");

/**
 * 3. ProviderUnavailableError
 */
const unavailableError = new ProviderUnavailableError(
  "Provider is unavailable",
);

assert(
  unavailableError instanceof ProviderError,
  "ProviderUnavailableError should extend ProviderError",
);

assert(
  unavailableError.code === ProviderErrorCode.PROVIDER_UNAVAILABLE,
  "ProviderUnavailableError code should be correct",
);

console.log("✓ ProviderUnavailableError");

/**
 * 4. ProviderDisabledError
 */
const disabledError = new ProviderDisabledError("Provider is disabled");

assert(
  disabledError instanceof ProviderError,
  "ProviderDisabledError should extend ProviderError",
);

assert(
  disabledError.code === ProviderErrorCode.PROVIDER_DISABLED,
  "ProviderDisabledError code should be correct",
);

console.log("✓ ProviderDisabledError");

/**
 * 5. ProviderRegistryError
 */
const registryError = new ProviderRegistryError("Provider registry error");

assert(
  registryError instanceof ProviderError,
  "ProviderRegistryError should extend ProviderError",
);

assert(
  registryError.code === ProviderErrorCode.PROVIDER_REGISTRY_ERROR,
  "ProviderRegistryError code should be correct",
);

console.log("✓ ProviderRegistryError");

/**
 * 6. ProviderResolverError
 */
const resolverError = new ProviderResolverError("Provider resolution failed");

assert(
  resolverError instanceof ProviderError,
  "ProviderResolverError should extend ProviderError",
);

assert(
  resolverError.code === ProviderErrorCode.PROVIDER_RESOLUTION_ERROR,
  "ProviderResolverError code should be correct",
);

console.log("✓ ProviderResolverError");

/**
 * 7. ProviderFactoryError
 */
const factoryError = new ProviderFactoryError("Provider factory failed");

assert(
  factoryError instanceof ProviderError,
  "ProviderFactoryError should extend ProviderError",
);

assert(
  factoryError.code === ProviderErrorCode.PROVIDER_FACTORY_ERROR,
  "ProviderFactoryError code should be correct",
);

console.log("✓ ProviderFactoryError");

/**
 * 8. ProviderConfigurationError
 */
const configurationError = new ProviderConfigurationError(
  "Provider configuration is invalid",
);

assert(
  configurationError instanceof ProviderError,
  "ProviderConfigurationError should extend ProviderError",
);

assert(
  configurationError.code === ProviderErrorCode.PROVIDER_CONFIGURATION_ERROR,
  "ProviderConfigurationError code should be correct",
);

console.log("✓ ProviderConfigurationError");

/**
 * 9. ProviderValidationError
 */
const validationError = new ProviderValidationError(
  "Provider validation failed",
);

assert(
  validationError instanceof ProviderError,
  "ProviderValidationError should extend ProviderError",
);

assert(
  validationError.code === ProviderErrorCode.PROVIDER_VALIDATION_ERROR,
  "ProviderValidationError code should be correct",
);

console.log("✓ ProviderValidationError");

/**
 * 10. ProviderCapabilityError
 */
const capabilityError = new ProviderCapabilityError(
  "Provider capability is not supported",
);

assert(
  capabilityError instanceof ProviderError,
  "ProviderCapabilityError should extend ProviderError",
);

assert(
  capabilityError.code === ProviderErrorCode.PROVIDER_CAPABILITY_NOT_SUPPORTED,
  "ProviderCapabilityError code should be correct",
);

console.log("✓ ProviderCapabilityError");

/**
 * 11. ProviderLifecycleError
 */
const lifecycleError = new ProviderLifecycleError(
  "Invalid provider lifecycle transition",
);

assert(
  lifecycleError instanceof ProviderError,
  "ProviderLifecycleError should extend ProviderError",
);

assert(
  lifecycleError.code === ProviderErrorCode.PROVIDER_LIFECYCLE_ERROR,
  "ProviderLifecycleError code should be correct",
);

console.log("✓ ProviderLifecycleError");

/**
 * 12. Error messages
 */
assert(
  providerError.message === "Provider operation failed",
  "ProviderError message should be preserved",
);

assert(
  notFoundError.message === "Provider not found",
  "ProviderNotFoundError message should be preserved",
);

console.log("✓ Error messages");

/**
 * 13. Stack
 */
assert(
  typeof providerError.stack === "string",
  "ProviderError should contain stack information",
);

console.log("✓ Error stack");

/**
 * 14. Secret safety
 */
assert(!("secret" in providerError), "ProviderError must not contain secret");

assert(
  !("credentials" in providerError),
  "ProviderError must not contain credentials",
);

assert(
  !("keyMaterial" in providerError),
  "ProviderError must not contain keyMaterial",
);

assert(
  !("privateKey" in providerError),
  "ProviderError must not contain privateKey",
);

assert(
  !("password" in providerError),
  "ProviderError must not contain password",
);

console.log("✓ Secret safety");

console.log("==============================================");

console.log("Phase 7.11 Manual Verification: PASSED");

console.log("==============================================");
