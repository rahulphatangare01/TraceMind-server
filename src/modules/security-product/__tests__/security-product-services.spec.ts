import { describe, expect, it, vi } from "vitest";

import type { SecurityCorePort } from "../application/interfaces/security-core.port.js";

import type { SecurityProductCommonInfrastructurePort } from "../application/interfaces/common-infrastructure.port.js";

import type {
  TenantResourceOwnershipServicePort,
  SecurityProductServiceBoundaries,
} from "../application/interfaces/security-product-services.port.js";

import { createSecurityProductServiceBoundaries } from "../application/services/security-product-services.factory.js";

const createDependencies = () => {
  const securityCore = {
    operations: {},
    keyManagement: {},
  } as unknown as SecurityCorePort;

  const tenantResourceOwnership = {
    resolve: vi.fn(),
  } as unknown as TenantResourceOwnershipServicePort;

  const commonInfrastructure: SecurityProductCommonInfrastructurePort = {
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    requestContext: {
      getCurrentContext: vi.fn(() => undefined),
    },
    identifiers: {
      generateId: vi.fn(() => "id-test"),
      generateRequestId: vi.fn(() => "req-test"),
      generateTraceId: vi.fn(() => "trace-test"),
      generateSpanId: vi.fn(() => "span-test"),
    },
  };

  return {
    securityCore,
    tenantResourceOwnership,
    commonInfrastructure,
  };
};

describe("Security Product service boundaries", () => {
  it("exposes exactly the defined service capabilities", () => {
    const dependencies = createDependencies();

    const services = createSecurityProductServiceBoundaries(dependencies);

    expect(Object.keys(services).sort()).toEqual([
      "commonInfrastructure",
      "securityCore",
      "tenantResourceOwnership",
    ]);
  });

  it("preserves each injected service reference", () => {
    const dependencies = createDependencies();

    const services = createSecurityProductServiceBoundaries(dependencies);

    expect(services.securityCore).toBe(dependencies.securityCore);

    expect(services.tenantResourceOwnership).toBe(
      dependencies.tenantResourceOwnership,
    );

    expect(services.commonInfrastructure).toBe(
      dependencies.commonInfrastructure,
    );
  });

  it("does not initialize or invoke dependencies during composition", () => {
    const dependencies = createDependencies();

    createSecurityProductServiceBoundaries(dependencies);

    expect(
      dependencies.commonInfrastructure.requestContext.getCurrentContext,
    ).not.toHaveBeenCalled();

    expect(
      dependencies.commonInfrastructure.identifiers.generateId,
    ).not.toHaveBeenCalled();

    expect(
      dependencies.commonInfrastructure.logger.info,
    ).not.toHaveBeenCalled();

    expect(dependencies.tenantResourceOwnership.resolve).not.toHaveBeenCalled();
  });

  it("does not expose provider internals or infrastructure implementation details", () => {
    const dependencies = createDependencies();

    const services = createSecurityProductServiceBoundaries(dependencies);

    expect("cryptoProvider" in services.securityCore).toBe(false);
    expect("keyProvider" in services.securityCore).toBe(false);
    expect("keyMaterialProvider" in services.securityCore).toBe(false);

    expect("database" in services).toBe(false);
    expect("db" in services).toBe(false);
    expect("expressApp" in services).toBe(false);
  });

  it("returns the declared boundary contract", () => {
    const dependencies = createDependencies();

    const services: SecurityProductServiceBoundaries =
      createSecurityProductServiceBoundaries(dependencies);

    expect(services).toBeDefined();
    expect(services.securityCore).toBeDefined();
    expect(services.tenantResourceOwnership).toBeDefined();
    expect(services.commonInfrastructure).toBeDefined();
  });
});
