import { SecurityProviderType } from "../../../types/provider.types";

import { ProviderConfigurationService } from "../../../application/services/provider-configuration.service";

import { ProviderConfigurationSanitizerService } from "../../../application/services/provider-configuration-sanitizer.service";

const configurationService = new ProviderConfigurationService();

const sanitizerService = new ProviderConfigurationSanitizerService();

/**
 * ---------------------------------------------------------
 * 1. Create Local Provider Configuration
 * ---------------------------------------------------------
 */

const configuration = {
  providerId: "local-security-provider",
  type: SecurityProviderType.LOCAL,
  settings: {
    environment: "manual",
    keyStorage: "memory",
  },
};

/**
 * ---------------------------------------------------------
 * 2. Validate Configuration
 * ---------------------------------------------------------
 */

const validated = configurationService.validate(configuration);

if (validated.providerId !== "local-security-provider") {
  throw new Error("Local provider ID validation failed");
}

if (validated.type !== SecurityProviderType.LOCAL) {
  throw new Error("Local provider type validation failed");
}

console.log("✓ Local provider configuration validated");

/**
 * ---------------------------------------------------------
 * 3. Sanitize Configuration
 * ---------------------------------------------------------
 */

const configurationWithWhitespace = {
  providerId: "  local-security-provider  ",
  type: SecurityProviderType.LOCAL,
  settings: {
    environment: "manual",
  },
};

const sanitized = sanitizerService.sanitize(configurationWithWhitespace);

if (sanitized.providerId !== "local-security-provider") {
  throw new Error("Provider ID was not sanitized correctly");
}

console.log("✓ Local provider configuration sanitized");

/**
 * ---------------------------------------------------------
 * 4. Verify Settings Preservation
 * ---------------------------------------------------------
 */

if (sanitized.settings.environment !== "manual") {
  throw new Error("Provider settings were not preserved");
}

console.log("✓ Provider settings preserved");

/**
 * ---------------------------------------------------------
 * 5. Verify Empty Settings
 * ---------------------------------------------------------
 */

const emptySettingsConfiguration = {
  providerId: "local-security-provider",
  type: SecurityProviderType.LOCAL,
  settings: {},
};

const emptySettingsResult = configurationService.validate(
  emptySettingsConfiguration,
);

if (emptySettingsResult.type !== SecurityProviderType.LOCAL) {
  throw new Error("Empty settings configuration failed");
}

console.log("✓ Empty Local provider settings accepted");

/**
 * ---------------------------------------------------------
 * 6. Verify Invalid Configuration Rejection
 * ---------------------------------------------------------
 */

let invalidConfigurationRejected = false;

try {
  configurationService.validate({
    providerId: "",
    type: SecurityProviderType.LOCAL,
    settings: {},
  });
} catch {
  invalidConfigurationRejected = true;
}

if (!invalidConfigurationRejected) {
  throw new Error("Invalid Local provider configuration was accepted");
}

console.log("✓ Invalid configuration rejected");

/**
 * ---------------------------------------------------------
 * Final Result
 * ---------------------------------------------------------
 */

console.log("Phase 8.11 manual verification passed");
