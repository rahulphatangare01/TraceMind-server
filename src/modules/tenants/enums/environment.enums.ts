// export enum EnvironmentStatus {
//   ACTIVE = "ACTIVE",
//   INACTIVE = "INACTIVE",
//   ARCHIVED = "ARCHIVED",
//   DELETED = "DELETED",
// }

export enum EnvironmentStatus {
  DRAFT = "DRAFT",

  ACTIVE = "ACTIVE",

  MAINTENANCE = "MAINTENANCE",

  INACTIVE = "INACTIVE",

  ARCHIVED = "ARCHIVED",

  // DELETED = "DELETED",
}

// export enum EnvironmentType {
//   LOCAL = "LOCAL",
//   DEVELOPMENT = "DEVELOPMENT",
//   TEST = "TEST",
//   UAT = "UAT",
//   STAGING = "STAGING",
//   PRODUCTION = "PRODUCTION",
// }
export enum EnvironmentType {
  LOCAL = "LOCAL",

  DEVELOPMENT = "DEVELOPMENT",

  QA = "QA",

  TEST = "TEST",

  INTEGRATION = "INTEGRATION",

  SANDBOX = "SANDBOX",

  UAT = "UAT",

  PRE_PRODUCTION = "PRE_PRODUCTION",

  STAGING = "STAGING",

  PRODUCTION = "PRODUCTION",

  DISASTER_RECOVERY = "DISASTER_RECOVERY",

  DEMO = "DEMO",

  CUSTOM = "CUSTOM",
}
