export enum SecurityProviderType {
  LOCAL = "LOCAL",
  AWS_KMS = "AWS_KMS",
  AZURE_KEY_VAULT = "AZURE_KEY_VAULT",
  GCP_KMS = "GCP_KMS",
  HASHICORP_VAULT = "HASHICORP_VAULT",
  CUSTOM = "CUSTOM",
}

export enum SecurityProviderCapability {
  KEY_MANAGEMENT = "KEY_MANAGEMENT",
  KEY_MATERIAL = "KEY_MATERIAL",
  ENCRYPTION = "ENCRYPTION",
  DECRYPTION = "DECRYPTION",
  HASHING = "HASHING",
  SIGNING = "SIGNING",
  HMAC = "HMAC",
}

export enum SecurityProviderStatus {
  REGISTERED = "REGISTERED",
  INITIALIZING = "INITIALIZING",
  READY = "READY",
  UNHEALTHY = "UNHEALTHY",
  DISABLED = "DISABLED",
}

export interface SecurityProviderMetadata {
  id: string;
  name: string;
  type: SecurityProviderType;
  version: string;
  capabilities: SecurityProviderCapability[];
}
