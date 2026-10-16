import { describe, expect, it, vi } from "vitest";

import { createSecurityProductCommonInfrastructurePort } from "../application/services/common-infrastructure.port-factory.js";

// import type {
//   SecurityProductCommonInfrastructureDependencies,
//   SecurityProductRequestContext,
// } from "../application/interfaces/common-infrastructure.port.js";
import type {
  SecurityProductCommonInfrastructureDependencies,
  SecurityProductRequestContext,
} from "../index.js";
describe("Security Product common infrastructure boundary", () => {
  const context: SecurityProductRequestContext = {
    requestId: "req_test-001",
    traceId: "trc_test-001",
    spanId: "spn_test-001",
    organizationId: "org-test-001",
  };

  const createDependencies =
    (): SecurityProductCommonInfrastructureDependencies => ({
      logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      requestContext: {
        getCurrentContext: vi.fn(() => context),
      },
      identifiers: {
        generateId: vi.fn(() => "id-test-001"),
        generateRequestId: vi.fn(() => "req_test-002"),
        generateTraceId: vi.fn(() => "trc_test-002"),
        generateSpanId: vi.fn(() => "spn_test-002"),
      },
    });

  it("exposes only the defined infrastructure capabilities", () => {
    const dependencies = createDependencies();
    const port = createSecurityProductCommonInfrastructurePort(dependencies);

    expect(Object.keys(port).sort()).toEqual([
      "identifiers",
      "logger",
      "requestContext",
    ]);
  });

  it("preserves the supplied infrastructure adapters", () => {
    const dependencies = createDependencies();
    const port = createSecurityProductCommonInfrastructurePort(dependencies);

    expect(port.logger).toBe(dependencies.logger);
    expect(port.requestContext).toBe(dependencies.requestContext);
    expect(port.identifiers).toBe(dependencies.identifiers);
  });

  it("provides the current request and trace context", () => {
    const dependencies = createDependencies();
    const port = createSecurityProductCommonInfrastructurePort(dependencies);

    expect(port.requestContext.getCurrentContext()).toEqual(context);
    expect(
      dependencies.requestContext.getCurrentContext,
    ).toHaveBeenCalledOnce();
  });

  it("supports an absent request context", () => {
    const dependencies = createDependencies();
    vi.mocked(
      dependencies.requestContext.getCurrentContext,
    ).mockReturnValueOnce(undefined);

    const port = createSecurityProductCommonInfrastructurePort(dependencies);

    expect(port.requestContext.getCurrentContext()).toBeUndefined();
  });

  it("delegates identifier generation to the supplied adapter", () => {
    const dependencies = createDependencies();
    const port = createSecurityProductCommonInfrastructurePort(dependencies);

    expect(port.identifiers.generateId()).toBe("id-test-001");
    expect(port.identifiers.generateRequestId()).toBe("req_test-002");
    expect(port.identifiers.generateTraceId()).toBe("trc_test-002");
    expect(port.identifiers.generateSpanId()).toBe("spn_test-002");

    expect(dependencies.identifiers.generateId).toHaveBeenCalledOnce();
    expect(dependencies.identifiers.generateRequestId).toHaveBeenCalledOnce();
    expect(dependencies.identifiers.generateTraceId).toHaveBeenCalledOnce();
    expect(dependencies.identifiers.generateSpanId).toHaveBeenCalledOnce();
  });

  it("exposes logging methods without changing the logger adapter", () => {
    const dependencies = createDependencies();
    const port = createSecurityProductCommonInfrastructurePort(dependencies);

    port.logger.info("Security Product integration check", {
      requestId: context.requestId,
    });
    port.logger.error("Security Product test error");

    expect(dependencies.logger.info).toHaveBeenCalledWith(
      "Security Product integration check",
      { requestId: context.requestId },
    );
    expect(dependencies.logger.error).toHaveBeenCalledWith(
      "Security Product test error",
    );
  });
});
