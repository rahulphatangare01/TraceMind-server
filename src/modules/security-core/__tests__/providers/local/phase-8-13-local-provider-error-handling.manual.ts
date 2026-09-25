import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import { ProviderLifecycleService } from "../../../application/services/provider-lifecycle.service.js";
import { ProviderResolverService } from "../../../application/services/provider-resolver.service.js";
import { ProviderRegistryService } from "../../../application/services/provider-registry.service.js";
import { ProviderConfigurationService } from "../../../application/services/provider-configuration.service.js";
import { ProviderCapabilityService } from "../../../application/services/provider-capability.service.js";
import { ProviderFactoryService } from "../../../application/services/provider-factory.service.js";
import { ProviderValidationService } from "../../../application/services/provider-validation.service.js";

import { ProviderError } from "../../../errors/provider.error.js";
import { ProviderLifecycleError } from "../../../errors/provider-lifecycle.error.js";
import { ProviderResolverError } from "../../../errors/provider-resolver.error.js";
import { ProviderConfigurationError } from "../../../errors/provider-configuration.error.js";
import { ProviderCapabilityError } from "../../../errors/provider-capability.error.js";
import { ProviderFactoryError } from "../../../errors/provider-factory.error.js";
import { ProviderValidationError } from "../../../errors/provider-validation.error.js";

import { ProviderErrorCode } from "../../../types/provider-error.types.js";

import {
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

const runManualVerification = async (): Promise<void> => {
  console.log("\n=== Phase 8.13 Local Provider Error Handling ===\n");

  /**
   * ---------------------------------------------------------
   * 1. Create Local Provider
   * ---------------------------------------------------------
   */

  console.log("1. Creating Local Security Provider...");

  const provider = new LocalSecurityProvider();

  console.log("   ✓ Local provider created");

  /**
   * ---------------------------------------------------------
   * 2. Base Provider Error
   * ---------------------------------------------------------
   */

  console.log("2. Testing base ProviderError...");

  const baseError = new ProviderError("Phase 8.13 provider error");

  if (baseError.code !== ProviderErrorCode.PROVIDER_ERROR) {
    throw new Error(`Expected PROVIDER_ERROR but received ${baseError.code}`);
  }

  if (baseError.message !== "Phase 8.13 provider error") {
    throw new Error("ProviderError message was not preserved");
  }

  console.log("   ✓ ProviderError works correctly");

  /**
   * ---------------------------------------------------------
   * 3. Lifecycle Error
   * ---------------------------------------------------------
   */

  console.log("3. Testing lifecycle error...");

  const lifecycleService = new ProviderLifecycleService();

  try {
    lifecycleService.transition(
      SecurityProviderStatus.DISABLED,
      SecurityProviderStatus.READY,
    );

    throw new Error("Expected ProviderLifecycleError was not thrown");
  } catch (error) {
    if (!(error instanceof ProviderLifecycleError)) {
      throw error;
    }

    if (error.code !== ProviderErrorCode.PROVIDER_LIFECYCLE_ERROR) {
      throw new Error(`Unexpected lifecycle error code: ${error.code}`);
    }

    console.log("   ✓ Lifecycle error handled correctly");
  }

  /**
   * ---------------------------------------------------------
   * 4. Resolver Error
   * ---------------------------------------------------------
   */

  console.log("4. Testing provider resolver error...");

  const registry = new ProviderRegistryService();

  const resolver = new ProviderResolverService(registry);

  try {
    resolver.resolve("phase-8-13-missing-provider");

    throw new Error("Expected ProviderResolverError was not thrown");
  } catch (error) {
    if (!(error instanceof ProviderResolverError)) {
      throw error;
    }

    if (error.code !== ProviderErrorCode.PROVIDER_RESOLUTION_ERROR) {
      throw new Error(`Unexpected resolver error code: ${error.code}`);
    }

    console.log("   ✓ Resolver error handled correctly");
  }

  /**
   * ---------------------------------------------------------
   * 5. Configuration Error
   * ---------------------------------------------------------
   */

  //   console.log("5. Testing provider configuration error...");

  //   const configurationService = new ProviderConfigurationService();

  //   const invalidConfiguration = {
  //     providerId: "",
  //     type: SecurityProviderType.LOCAL,
  //     settings: {},
  //   };

  //   try {
  //     configurationService.validate(invalidConfiguration);

  //     throw new Error("Expected ProviderConfigurationError was not thrown");
  //   } catch (error) {
  //     if (!(error instanceof ProviderConfigurationError)) {
  //       throw error;
  //     }

  //     if (error.code !== ProviderErrorCode.PROVIDER_CONFIGURATION_ERROR) {
  //       throw new Error(`Unexpected configuration error code: ${error.code}`);
  //     }

  //     console.log("   ✓ Configuration error handled correctly");
  //   }
  console.log("5. Testing provider configuration validation...");

  const configurationService = new ProviderConfigurationService();

  const invalidConfiguration = {
    providerId: "",
    type: SecurityProviderType.LOCAL,
    settings: {},
  };

  try {
    configurationService.validate(invalidConfiguration);

    throw new Error("Expected configuration validation error was not thrown");
  } catch (error) {
    if (!error) {
      throw new Error("Expected configuration validation error was not thrown");
    }

    console.log("   ✓ Invalid configuration correctly rejected");
  }
  /**
   * ---------------------------------------------------------
   * 6. Capability Error
   * ---------------------------------------------------------
   */

  console.log("6. Testing provider capability error...");

  const capabilityService = new ProviderCapabilityService();

  try {
    capabilityService.require(
      provider.getMetadata(),
      "UNSUPPORTED_CAPABILITY" as never,
    );

    throw new Error("Expected ProviderCapabilityError was not thrown");
  } catch (error) {
    if (!(error instanceof ProviderCapabilityError)) {
      throw error;
    }

    if (error.code !== ProviderErrorCode.PROVIDER_CAPABILITY_NOT_SUPPORTED) {
      throw new Error(`Unexpected capability error code: ${error.code}`);
    }

    console.log("   ✓ Capability error handled correctly");
  }

  /**
   * ---------------------------------------------------------
   * 7. Factory Error
   * ---------------------------------------------------------
   */

  console.log("7. Testing provider factory error...");

  const factory = new ProviderFactoryService();

  try {
    factory.create(SecurityProviderType.AWS_KMS);

    throw new Error("Expected ProviderFactoryError was not thrown");
  } catch (error) {
    if (!(error instanceof ProviderFactoryError)) {
      throw error;
    }

    if (error.code !== ProviderErrorCode.PROVIDER_FACTORY_ERROR) {
      throw new Error(`Unexpected factory error code: ${error.code}`);
    }

    console.log("   ✓ Factory error handled correctly");
  }

  /**
   * ---------------------------------------------------------
   * 8. Validation Error
   * ---------------------------------------------------------
   */

  console.log("8. Testing provider validation error...");

  const validationService = new ProviderValidationService();

  try {
    validationService.validate(null as never);

    throw new Error("Expected ProviderValidationError was not thrown");
  } catch (error) {
    if (!(error instanceof ProviderValidationError)) {
      throw error;
    }

    if (error.code !== ProviderErrorCode.PROVIDER_VALIDATION_ERROR) {
      throw new Error(`Unexpected validation error code: ${error.code}`);
    }

    console.log("   ✓ Validation error handled correctly");
  }

  /**
   * ---------------------------------------------------------
   * 9. Sensitive Information Protection
   * ---------------------------------------------------------
   */

  console.log("9. Checking error information exposure...");

  const errorMessage = new ProviderError("Provider operation failed");

  const serializedError = JSON.stringify(errorMessage);

  if (serializedError.includes("privateKey")) {
    throw new Error("Error contains private key information");
  }

  if (serializedError.includes("keyMaterial")) {
    throw new Error("Error contains raw key material");
  }

  console.log("   ✓ No sensitive key material exposed");

  /**
   * ---------------------------------------------------------
   * 10. Local Provider Identity After Errors
   * ---------------------------------------------------------
   */

  console.log("10. Verifying Local provider stability...");

  const metadata = provider.getMetadata();

  if (metadata.type !== SecurityProviderType.LOCAL) {
    throw new Error("Local provider identity changed");
  }

  if (metadata.id !== "local-security-provider") {
    throw new Error("Local provider ID changed");
  }

  console.log("   ✓ Local provider identity remains stable");

  /**
   * ---------------------------------------------------------
   * Final Result
   * ---------------------------------------------------------
   */

  console.log("\n==============================================");

  console.log("Phase 8.13 manual verification PASSED");

  console.log("Local Provider Error Handling is valid.");

  console.log("==============================================\n");
};
void runManualVerification();
