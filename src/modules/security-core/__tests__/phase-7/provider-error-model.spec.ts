import { describe, expect, it } from "vitest";

import { ProviderErrorCode } from "../../types/provider-error.types.js";

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
} from "../../errors/index.js";

describe("Phase 7.11 - Provider Error Model", () => {
  /**
   * Test 1
   * Base ProviderError
   */
  it("Test 1 - should create a ProviderError", () => {
    const error = new ProviderError(
      "Provider operation failed",
      ProviderErrorCode.PROVIDER_ERROR,
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ProviderError);
    expect(error.name).toBe("ProviderError");
    expect(error.message).toBe("Provider operation failed");
  });

  /**
   * Test 2
   * Default error code
   */
  it("Test 2 - should use PROVIDER_ERROR as the default code", () => {
    const error = new ProviderError("Provider error");

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_ERROR);
  });

  /**
   * Test 3
   * Custom error code
   */
  it("Test 3 - should preserve the supplied provider error code", () => {
    const error = new ProviderError(
      "Provider operation failed",
      ProviderErrorCode.PROVIDER_OPERATION_FAILED,
    );

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_OPERATION_FAILED);
  });

  /**
   * Test 4
   * Provider not found
   */
  it("Test 4 - should create ProviderNotFoundError", () => {
    const error = new ProviderNotFoundError("Provider not found");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ProviderError);
    expect(error).toBeInstanceOf(ProviderNotFoundError);

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_NOT_FOUND);

    expect(error.message).toBe("Provider not found");
  });

  /**
   * Test 5
   * Provider unavailable
   */
  it("Test 5 - should create ProviderUnavailableError", () => {
    const error = new ProviderUnavailableError("Provider is unavailable");

    expect(error).toBeInstanceOf(ProviderError);

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_UNAVAILABLE);
  });

  /**
   * Test 6
   * Provider disabled
   */
  it("Test 6 - should create ProviderDisabledError", () => {
    const error = new ProviderDisabledError("Provider is disabled");

    expect(error).toBeInstanceOf(ProviderError);

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_DISABLED);
  });

  /**
   * Test 7
   * Registry error inheritance
   */
  it("Test 7 - should make ProviderRegistryError extend ProviderError", () => {
    const error = new ProviderRegistryError("Provider registry error");

    expect(error).toBeInstanceOf(ProviderError);
    expect(error).toBeInstanceOf(ProviderRegistryError);

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_REGISTRY_ERROR);
  });

  /**
   * Test 8
   * Resolver error inheritance
   */
  it("Test 8 - should make ProviderResolverError extend ProviderError", () => {
    const error = new ProviderResolverError("Provider resolution failed");

    expect(error).toBeInstanceOf(ProviderError);
    expect(error).toBeInstanceOf(ProviderResolverError);

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_RESOLUTION_ERROR);
  });

  /**
   * Test 9
   * Factory error inheritance
   */
  it("Test 9 - should make ProviderFactoryError extend ProviderError", () => {
    const error = new ProviderFactoryError("Provider factory failed");

    expect(error).toBeInstanceOf(ProviderError);
    expect(error).toBeInstanceOf(ProviderFactoryError);

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_FACTORY_ERROR);
  });

  /**
   * Test 10
   * Configuration error inheritance
   */
  it("Test 10 - should make ProviderConfigurationError extend ProviderError", () => {
    const error = new ProviderConfigurationError(
      "Provider configuration is invalid",
    );

    expect(error).toBeInstanceOf(ProviderError);
    expect(error).toBeInstanceOf(ProviderConfigurationError);

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_CONFIGURATION_ERROR);
  });

  /**
   * Test 11
   * Validation error inheritance
   */
  it("Test 11 - should make ProviderValidationError extend ProviderError", () => {
    const error = new ProviderValidationError("Provider validation failed");

    expect(error).toBeInstanceOf(ProviderError);
    expect(error).toBeInstanceOf(ProviderValidationError);

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_VALIDATION_ERROR);
  });

  /**
   * Test 12
   * Capability error inheritance
   */
  it("Test 12 - should make ProviderCapabilityError extend ProviderError", () => {
    const error = new ProviderCapabilityError(
      "Provider capability is not supported",
    );

    expect(error).toBeInstanceOf(ProviderError);
    expect(error).toBeInstanceOf(ProviderCapabilityError);

    expect(error.code).toBe(
      ProviderErrorCode.PROVIDER_CAPABILITY_NOT_SUPPORTED,
    );
  });

  /**
   * Test 13
   * Lifecycle error inheritance
   */
  it("Test 13 - should make ProviderLifecycleError extend ProviderError", () => {
    const error = new ProviderLifecycleError(
      "Invalid provider lifecycle transition",
    );

    expect(error).toBeInstanceOf(ProviderError);
    expect(error).toBeInstanceOf(ProviderLifecycleError);

    expect(error.code).toBe(ProviderErrorCode.PROVIDER_LIFECYCLE_ERROR);
  });

  /**
   * Test 14
   * All ProviderErrorCode values should be stable
   */
  it("Test 14 - should contain all defined ProviderErrorCode values", () => {
    expect(ProviderErrorCode.PROVIDER_ERROR).toBe("PROVIDER_ERROR");

    expect(ProviderErrorCode.PROVIDER_NOT_FOUND).toBe("PROVIDER_NOT_FOUND");

    expect(ProviderErrorCode.PROVIDER_ALREADY_REGISTERED).toBe(
      "PROVIDER_ALREADY_REGISTERED",
    );

    expect(ProviderErrorCode.PROVIDER_REGISTRY_ERROR).toBe(
      "PROVIDER_REGISTRY_ERROR",
    );

    expect(ProviderErrorCode.PROVIDER_RESOLUTION_ERROR).toBe(
      "PROVIDER_RESOLUTION_ERROR",
    );

    expect(ProviderErrorCode.PROVIDER_FACTORY_ERROR).toBe(
      "PROVIDER_FACTORY_ERROR",
    );

    expect(ProviderErrorCode.PROVIDER_CONFIGURATION_ERROR).toBe(
      "PROVIDER_CONFIGURATION_ERROR",
    );

    expect(ProviderErrorCode.PROVIDER_VALIDATION_ERROR).toBe(
      "PROVIDER_VALIDATION_ERROR",
    );

    expect(ProviderErrorCode.PROVIDER_CAPABILITY_NOT_SUPPORTED).toBe(
      "PROVIDER_CAPABILITY_NOT_SUPPORTED",
    );

    expect(ProviderErrorCode.PROVIDER_LIFECYCLE_ERROR).toBe(
      "PROVIDER_LIFECYCLE_ERROR",
    );

    expect(ProviderErrorCode.PROVIDER_INITIALIZATION_ERROR).toBe(
      "PROVIDER_INITIALIZATION_ERROR",
    );

    expect(ProviderErrorCode.PROVIDER_UNAVAILABLE).toBe("PROVIDER_UNAVAILABLE");

    expect(ProviderErrorCode.PROVIDER_DISABLED).toBe("PROVIDER_DISABLED");

    expect(ProviderErrorCode.PROVIDER_OPERATION_FAILED).toBe(
      "PROVIDER_OPERATION_FAILED",
    );
  });

  /**
   * Test 15
   * ProviderError should not contain secret-specific fields
   */
  it("Test 15 - should not expose secret-specific fields", () => {
    const error = new ProviderError(
      "Provider operation failed",
      ProviderErrorCode.PROVIDER_OPERATION_FAILED,
    );

    expect(error).not.toHaveProperty("secret");
    expect(error).not.toHaveProperty("credentials");
    expect(error).not.toHaveProperty("keyMaterial");
    expect(error).not.toHaveProperty("privateKey");
    expect(error).not.toHaveProperty("password");
  });

  /**
   * Test 16
   * Error should preserve stack information
   */
  it("Test 16 - should preserve error stack information", () => {
    const error = new ProviderError(
      "Provider operation failed",
      ProviderErrorCode.PROVIDER_OPERATION_FAILED,
    );

    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe("string");
  });
});
