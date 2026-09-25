import { describe, expect, it } from "vitest";

import { SecurityProviderType } from "../../../types/provider.types";

import { ProviderConfigurationService } from "../../../application/services/provider-configuration.service.js";

import { ProviderConfigurationSanitizerService } from "../../../application/services/provider-configuration-sanitizer.service.js";

describe("Phase 8.11 - Local Provider Configuration", () => {
  const configurationService = new ProviderConfigurationService();

  const sanitizerService = new ProviderConfigurationSanitizerService();

  const createConfiguration = () => ({
    providerId: "local-security-provider",
    type: SecurityProviderType.LOCAL,
    settings: {
      environment: "test",
    },
  });

  it("should validate Local provider configuration successfully", () => {
    const configuration = createConfiguration();

    const result = configurationService.validate(configuration);

    expect(result).toBeDefined();
    expect(result.providerId).toBe("local-security-provider");
    expect(result.type).toBe(SecurityProviderType.LOCAL);
    expect(result.settings).toEqual({
      environment: "test",
    });
  });

  it("should accept empty Local provider settings", () => {
    const configuration = {
      providerId: "local-security-provider",
      type: SecurityProviderType.LOCAL,
      settings: {},
    };

    const result = configurationService.validate(configuration);

    expect(result.providerId).toBe("local-security-provider");
    expect(result.type).toBe(SecurityProviderType.LOCAL);
    expect(result.settings).toEqual({});
  });

  it("should normalize provider ID using the sanitizer", () => {
    const configuration = {
      providerId: "  local-security-provider  ",
      type: SecurityProviderType.LOCAL,
      settings: {
        environment: "test",
      },
    };

    const result = sanitizerService.sanitize(configuration);

    expect(result.providerId).toBe("local-security-provider");
  });

  it("should preserve Local provider type during sanitization", () => {
    const configuration = createConfiguration();

    const result = sanitizerService.sanitize(configuration);

    expect(result.type).toBe(SecurityProviderType.LOCAL);
  });

  it("should preserve provider settings during sanitization", () => {
    const configuration = createConfiguration();

    const result = sanitizerService.sanitize(configuration);

    expect(result.settings).toEqual({
      environment: "test",
    });
  });

  it("should reject an empty provider ID", () => {
    const configuration = {
      providerId: "",
      type: SecurityProviderType.LOCAL,
      settings: {},
    };

    expect(() => configurationService.validate(configuration)).toThrow();
  });

  //   it("should reject an invalid provider type", () => {
  //     const configuration = {
  //       providerId: "local-security-provider",
  //       type: "INVALID_PROVIDER",
  //       settings: {},
  //     };

  //     expect(() => configurationService.validate(configuration)).toThrow();
  //   });

  //   it("should reject missing settings", () => {
  //     const configuration = {
  //       providerId: "local-security-provider",
  //       type: SecurityProviderType.LOCAL,
  //     };

  //     expect(() => configurationService.validate(configuration)).toThrow();
  //   });
  it("should reject an invalid provider type", () => {
    const configuration = {
      providerId: "local-security-provider",
      type: "INVALID_PROVIDER" as SecurityProviderType,
      settings: {},
    };

    expect(() => configurationService.validate(configuration)).toThrow();
  });

  it("should reject missing settings", () => {
    const configuration = {
      providerId: "local-security-provider",
      type: SecurityProviderType.LOCAL,
    } as never;

    expect(() => configurationService.validate(configuration)).toThrow();
  });
  it("should not mutate the original configuration", () => {
    const configuration = {
      providerId: "  local-security-provider  ",
      type: SecurityProviderType.LOCAL,
      settings: {
        environment: "test",
      },
    };

    const originalProviderId = configuration.providerId;

    sanitizerService.sanitize(configuration);

    expect(configuration.providerId).toBe(originalProviderId);
  });

  it("should preserve arbitrary Local provider settings", () => {
    const configuration = {
      providerId: "local-security-provider",
      type: SecurityProviderType.LOCAL,
      settings: {
        environment: "test",
        region: "local",
        keyStorage: "memory",
      },
    };

    const result = configurationService.validate(configuration);

    expect(result.settings).toEqual({
      environment: "test",
      region: "local",
      keyStorage: "memory",
    });
  });

  it("should not require provider secrets during configuration validation", () => {
    const configuration = {
      providerId: "local-security-provider",
      type: SecurityProviderType.LOCAL,
      settings: {
        environment: "test",
      },
    };

    expect(() => configurationService.validate(configuration)).not.toThrow();
  });

  it("should return a sanitized configuration suitable for validation", () => {
    const configuration = {
      providerId: "  local-security-provider  ",
      type: SecurityProviderType.LOCAL,
      settings: {
        environment: "test",
      },
    };

    const sanitized = sanitizerService.sanitize(configuration);

    const validated = configurationService.validate(sanitized);

    expect(validated.providerId).toBe("local-security-provider");
    expect(validated.type).toBe(SecurityProviderType.LOCAL);
  });
});
