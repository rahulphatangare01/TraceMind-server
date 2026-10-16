import { createSecurityProductCommonInfrastructurePort } from "../application/services/common-infrastructure.port-factory.js";

import type {
  SecurityProductCommonInfrastructureDependencies,
  SecurityProductRequestContext,
} from "../index.js";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
};

const context: SecurityProductRequestContext = {
  requestId: "req_manual-001",
  traceId: "trc_manual-001",
  spanId: "spn_manual-001",
  organizationId: "org_manual-001",
};

const logEntries: string[] = [];

const dependencies: SecurityProductCommonInfrastructureDependencies = {
  logger: {
    debug: (message) => logEntries.push(`DEBUG:${message}`),
    info: (message) => logEntries.push(`INFO:${message}`),
    warn: (message) => logEntries.push(`WARN:${message}`),
    error: (message) => logEntries.push(`ERROR:${message}`),
  },

  requestContext: {
    getCurrentContext: () => context,
  },

  identifiers: {
    generateId: () => "manual-id-001",
    generateRequestId: () => "req_manual-002",
    generateTraceId: () => "trc_manual-002",
    generateSpanId: () => "spn_manual-002",
  },
};

const port = createSecurityProductCommonInfrastructurePort(dependencies);

console.log("\nSecurity Product — Common Infrastructure Manual Test");
console.log("====================================================");

assert(port.logger === dependencies.logger, "Logger adapter was not preserved");
console.log("PASS: logger adapter");

assert(
  port.requestContext.getCurrentContext()?.requestId === "req_manual-001",
  "Request ID was not available through the context port",
);

assert(
  port.requestContext.getCurrentContext()?.traceId === "trc_manual-001",
  "Trace ID was not available through the context port",
);
console.log("PASS: request and trace context");

assert(
  port.identifiers.generateId() === "manual-id-001",
  "General identifier delegation failed",
);
assert(
  port.identifiers.generateRequestId() === "req_manual-002",
  "Request identifier delegation failed",
);
assert(
  port.identifiers.generateTraceId() === "trc_manual-002",
  "Trace identifier delegation failed",
);
assert(
  port.identifiers.generateSpanId() === "spn_manual-002",
  "Span identifier delegation failed",
);
console.log("PASS: identifier delegation");

port.logger.info("manual integration check");
port.logger.error("manual error check");

assert(
  logEntries.includes("INFO:manual integration check"),
  "Info log was not forwarded",
);
assert(
  logEntries.includes("ERROR:manual error check"),
  "Error log was not forwarded",
);
console.log("PASS: logger forwarding");

assert(
  Object.keys(port).sort().join(",") === "identifiers,logger,requestContext",
  "Unexpected infrastructure capabilities were exposed",
);
console.log("PASS: integration boundary shape");

console.log("\nAll common infrastructure manual checks passed.");
