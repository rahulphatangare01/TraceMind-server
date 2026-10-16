export interface SecurityProductLogMetadata {
  readonly [key: string]: unknown;
}

export interface SecurityProductLoggerPort {
  debug(message: string, metadata?: SecurityProductLogMetadata): void;

  info(message: string, metadata?: SecurityProductLogMetadata): void;

  warn(message: string, metadata?: SecurityProductLogMetadata): void;

  error(message: string, metadata?: SecurityProductLogMetadata): void;
}

export interface SecurityProductRequestContext {
  readonly requestId: string;
  readonly traceId: string;
  readonly spanId?: string;
  readonly organizationId?: string;
  readonly projectId?: string;
  readonly applicationId?: string;
  readonly environmentId?: string;
  readonly userId?: string;
}

export interface SecurityProductRequestContextPort {
  getCurrentContext(): SecurityProductRequestContext | undefined;
}

export interface SecurityProductIdentifierPort {
  generateId(): string;
  generateRequestId(): string;
  generateTraceId(): string;
  generateSpanId(): string;
}

export interface SecurityProductCommonInfrastructurePort {
  readonly logger: SecurityProductLoggerPort;
  readonly requestContext: SecurityProductRequestContextPort;
  readonly identifiers: SecurityProductIdentifierPort;
}
