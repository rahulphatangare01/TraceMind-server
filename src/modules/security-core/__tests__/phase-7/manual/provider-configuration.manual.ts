import { SecurityProviderType } from "../../../types/provider.types.js";

import { ProviderConfigurationService } from "../../../application/services/provider-configuration.service.js";

import { ProviderConfigurationSanitizerService } from "../../../application/services/provider-configuration-sanitizer.service.js";

const configurationService = new ProviderConfigurationService();

const sanitizer = new ProviderConfigurationSanitizerService();

console.log("\n=== Provider Configuration Manual Verification ===\n");

const rawConfiguration = {
  providerId: "  aws-provider  ",
  type: SecurityProviderType.AWS_KMS,
  settings: {
    region: "ap-south-1",
    keyReference: "kms-key-reference-001",
    endpoint: "https://kms.internal",
  },
};

const validated = configurationService.validate(rawConfiguration);

console.log(
  `Configuration validation: ${
    validated.providerId === "aws-provider" ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Provider type validation: ${
    validated.type === SecurityProviderType.AWS_KMS ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Settings preserved: ${
    validated.settings.region === "ap-south-1" ? "PASS" : "FAIL"
  }`,
);

const sanitized = sanitizer.sanitize(rawConfiguration);

console.log(
  `Provider id sanitized: ${
    sanitized.providerId === "aws-provider" ? "PASS" : "FAIL"
  }`,
);

console.log(
  `Settings copied: ${
    sanitized.settings !== rawConfiguration.settings ? "PASS" : "FAIL"
  }`,
);

try {
  configurationService.validate({
    providerId: "   ",
    type: SecurityProviderType.LOCAL,
    settings: {},
  });

  console.log("Invalid provider id rejection: FAIL");
} catch {
  console.log("Invalid provider id rejection: PASS");
}

try {
  configurationService.validate({
    providerId: "provider",
    type: "INVALID_PROVIDER",
    settings: {},
  } as never);

  console.log("Invalid provider type rejection: FAIL");
} catch {
  console.log("Invalid provider type rejection: PASS");
}

console.log(
  `Provider registration not required: ${
    configurationService.validate({
      providerId: "not-yet-registered",
      type: SecurityProviderType.LOCAL,
      settings: {},
    }).providerId === "not-yet-registered"
      ? "PASS"
      : "FAIL"
  }`,
);

console.log("\n=== Manual Verification Complete ===\n");
