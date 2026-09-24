import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import type { SecurityProvider } from "../../../types/provider.types.js";

import { ProviderRegistryService } from "../../../application/services/provider-registry.service.js";
import { ProviderResolverService } from "../../../application/services/provider-resolver.service.js";
import { ProviderFactoryService } from "../../../application/services/provider-factory.service.js";
import { ProviderCapabilityService } from "../../../application/services/provider-capability.service.js";
import { ProviderLifecycleService } from "../../../application/services/provider-lifecycle.service.js";
import { ProviderValidationService } from "../../../application/services/provider-validation.service.js";

import { securityProviderMetadataSchema } from "../../../schemas/provider-metadata.schema.js";
import { securityProviderConfigurationSchema } from "../../../schemas/provider-configuration.schema.js";

import { ProviderConfigurationService } from "../../../application/services/provider-configuration.service.js";

// ============================================================================
// Helpers
// ============================================================================

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Security review failed: ${message}`);
  }
};

const printSection = (title: string): void => {
  console.log("");
  console.log("--------------------------------------------------");
  console.log(title);
  console.log("--------------------------------------------------");
};

const createProvider = (
  id: string,
  capabilities: SecurityProviderCapability[] = [
    SecurityProviderCapability.KEY_MANAGEMENT,
    SecurityProviderCapability.KEY_MATERIAL,
    SecurityProviderCapability.ENCRYPTION,
    SecurityProviderCapability.DECRYPTION,
    SecurityProviderCapability.HASHING,
    SecurityProviderCapability.SIGNING,
    SecurityProviderCapability.HMAC,
  ],
  status: SecurityProviderStatus = SecurityProviderStatus.READY,
): SecurityProvider => ({
  getMetadata: () => ({
    id,
    name: id,
    type: SecurityProviderType.LOCAL,
    version: "1.0.0",
    capabilities,
  }),

  getStatus: () => status,
});

// ============================================================================
// Manual Security Review
// ============================================================================

const runManualSecurityReview = async (): Promise<void> => {
  // ==========================================================================
  // 1. Provider Metadata Security
  // ==========================================================================

  printSection("1. Provider Metadata Security");

  const provider = createProvider("security-review-provider");

  const metadata = provider.getMetadata();

  assert(
    metadata.id === "security-review-provider",
    "Provider metadata ID is invalid",
  );

  assert(
    metadata.type === SecurityProviderType.LOCAL,
    "Provider metadata type is invalid",
  );

  assert(metadata.version === "1.0.0", "Provider metadata version is invalid");

  assert(!("privateKey" in metadata), "Provider metadata exposes private key");

  assert(!("secretKey" in metadata), "Provider metadata exposes secret key");

  assert(
    !("keyMaterial" in metadata),
    "Provider metadata exposes raw key material",
  );

  assert(!("password" in metadata), "Provider metadata exposes password");

  assert(!("token" in metadata), "Provider metadata exposes token");

  const metadataValidation = securityProviderMetadataSchema.safeParse(metadata);

  assert(
    metadataValidation.success,
    "Provider metadata schema validation failed",
  );

  console.log("✓ Provider metadata contains no raw secrets");

  console.log("✓ Provider metadata validation passed");

  // ==========================================================================
  // 2. Provider Configuration Security
  // ==========================================================================

  printSection("2. Provider Configuration Security");

  const configuration = {
    providerId: "security-review-provider",
    type: SecurityProviderType.LOCAL,
    settings: {
      environment: "test",
      region: "local",
    },
  };

  const configurationValidation =
    securityProviderConfigurationSchema.safeParse(configuration);

  assert(
    configurationValidation.success,
    "Provider configuration validation failed",
  );

  assert(
    !("privateKey" in configuration.settings),
    "Provider configuration exposes private key",
  );

  assert(
    !("secretKey" in configuration.settings),
    "Provider configuration exposes secret key",
  );

  assert(
    !("keyMaterial" in configuration.settings),
    "Provider configuration exposes key material",
  );

  const configurationService = new ProviderConfigurationService();

  const validatedConfiguration = configurationService.validate(configuration);

  assert(
    validatedConfiguration.providerId === "security-review-provider",
    "Provider configuration service validation failed",
  );

  console.log("✓ Provider configuration contains no raw key material");

  console.log("✓ Provider configuration validation works");

  // ==========================================================================
  // 3. Provider Registry / Resolver Security
  // ==========================================================================

  printSection("3. Provider Registry / Resolver Security");

  const registry = new ProviderRegistryService();

  const resolver = new ProviderResolverService(registry);

  const providerA = createProvider("security-provider-a");

  const providerB = createProvider("security-provider-b");

  registry.register(providerA);
  registry.register(providerB);

  assert(
    resolver.resolve("security-provider-a") === providerA,
    "Provider A resolution failed",
  );

  assert(
    resolver.resolve("security-provider-b") === providerB,
    "Provider B resolution failed",
  );

  let unknownProviderRejected = false;

  try {
    resolver.resolve("unknown-provider");
  } catch {
    unknownProviderRejected = true;
  }

  assert(unknownProviderRejected, "Unknown provider was not rejected");

  console.log("✓ Exact provider resolution works");

  console.log("✓ Unknown provider is rejected");

  console.log("✓ No provider fallback is performed");

  // ==========================================================================
  // 4. Capability Security
  // ==========================================================================

  printSection("4. Provider Capability Security");

  const capabilityService = new ProviderCapabilityService();

  const encryptionProvider = createProvider("encryption-only-provider", [
    SecurityProviderCapability.ENCRYPTION,
  ]);

  const encryptionCapabilitySet = {
    capabilities: encryptionProvider.getMetadata().capabilities,
  };

  assert(
    capabilityService.supports(
      encryptionCapabilitySet,
      SecurityProviderCapability.ENCRYPTION,
    ),
    "Supported encryption capability was rejected",
  );

  let capabilityRejected = false;

  try {
    capabilityService.require(
      encryptionCapabilitySet,
      SecurityProviderCapability.KEY_MANAGEMENT,
    );
  } catch {
    capabilityRejected = true;
  }

  assert(capabilityRejected, "Unsupported capability was accepted");

  assert(
    !capabilityService.supports(
      encryptionCapabilitySet,
      SecurityProviderCapability.KEY_MANAGEMENT,
    ),
    "Provider capability escalation detected",
  );

  console.log("✓ Supported capability accepted");
  console.log("✓ Unsupported capability rejected");
  console.log("✓ Capability escalation prevented");

  // ==========================================================================
  // 5. Provider Lifecycle Security
  // ==========================================================================

  printSection("5. Provider Lifecycle Security");

  const lifecycleService = new ProviderLifecycleService();

  assert(
    lifecycleService.canTransition(
      SecurityProviderStatus.REGISTERED,
      SecurityProviderStatus.INITIALIZING,
    ),
    "REGISTERED → INITIALIZING should be allowed",
  );

  assert(
    lifecycleService.canTransition(
      SecurityProviderStatus.INITIALIZING,
      SecurityProviderStatus.READY,
    ),
    "INITIALIZING → READY should be allowed",
  );

  assert(
    !lifecycleService.canTransition(
      SecurityProviderStatus.REGISTERED,
      SecurityProviderStatus.READY,
    ),
    "REGISTERED → READY should be rejected",
  );

  assert(
    !lifecycleService.canTransition(
      SecurityProviderStatus.DISABLED,
      SecurityProviderStatus.READY,
    ),
    "DISABLED → READY should be rejected",
  );

  console.log("✓ Valid lifecycle transitions accepted");

  console.log("✓ Invalid lifecycle transitions rejected");

  // ==========================================================================
  // 6. Provider Validation Security
  // ==========================================================================

  printSection("6. Provider Validation Security");

  const validationService = new ProviderValidationService();

  const validationResult = validationService.validate(provider);

  assert(validationResult.valid, "Valid provider failed validation");

  assert(
    validationResult.metadata.id === "security-review-provider",
    "Validated provider ID is incorrect",
  );

  assert(
    validationResult.status === SecurityProviderStatus.READY,
    "Validated provider status is incorrect",
  );

  console.log("✓ Valid provider passed structural validation");

  // ==========================================================================
  // 7. Provider Isolation
  // ==========================================================================

  printSection("7. Provider Isolation Security");

  const isolatedProviderA = createProvider("isolated-a", [
    SecurityProviderCapability.ENCRYPTION,
  ]);

  const isolatedProviderB = createProvider("isolated-b", [
    SecurityProviderCapability.HMAC,
  ]);

  assert(
    isolatedProviderA
      .getMetadata()
      .capabilities.includes(SecurityProviderCapability.ENCRYPTION),
    "Provider A encryption capability missing",
  );

  assert(
    !isolatedProviderB
      .getMetadata()
      .capabilities.includes(SecurityProviderCapability.ENCRYPTION),
    "Provider A capability leaked into Provider B",
  );

  assert(
    isolatedProviderB
      .getMetadata()
      .capabilities.includes(SecurityProviderCapability.HMAC),
    "Provider B HMAC capability missing",
  );

  console.log("✓ Provider capabilities remain isolated");

  // ==========================================================================
  // 8. Provider Factory Security
  // ==========================================================================

  printSection("8. Provider Factory Security");

  const factory = new ProviderFactoryService();

  const localProvider = factory.create(SecurityProviderType.LOCAL);

  assert(localProvider !== undefined, "LOCAL provider creation failed");

  assert(
    localProvider.getMetadata().type === SecurityProviderType.LOCAL,
    "Factory created incorrect provider type",
  );

  let awsRejected = false;

  try {
    factory.create(SecurityProviderType.AWS_KMS);
  } catch {
    awsRejected = true;
  }

  assert(awsRejected, "AWS KMS silently fell back to another provider");

  let azureRejected = false;

  try {
    factory.create(SecurityProviderType.AZURE_KEY_VAULT);
  } catch {
    azureRejected = true;
  }

  assert(
    azureRejected,
    "Azure Key Vault silently fell back to another provider",
  );

  let gcpRejected = false;

  try {
    factory.create(SecurityProviderType.GCP_KMS);
  } catch {
    gcpRejected = true;
  }

  assert(gcpRejected, "GCP KMS silently fell back to another provider");

  console.log("✓ LOCAL provider factory creation works");

  console.log("✓ Unsupported cloud providers do not silently fallback");

  // ==========================================================================
  // Final Result
  // ==========================================================================

  console.log("");
  console.log("==================================================");
  console.log("Phase 7.15 Security Review Verification");
  console.log("==================================================");

  console.log("✓ Provider metadata security");

  console.log("✓ Provider configuration security");

  console.log("✓ Provider resolver security");

  console.log("✓ Provider capability security");

  console.log("✓ Provider lifecycle security");

  console.log("✓ Provider validation security");

  console.log("✓ Provider isolation security");

  console.log("✓ Provider factory security");

  console.log("==================================================");
  console.log("PHASE 7.15 SECURITY REVIEW PASSED");
  console.log("==================================================");
};

// ============================================================================
// Start Manual Verification
// ============================================================================

void runManualSecurityReview();
