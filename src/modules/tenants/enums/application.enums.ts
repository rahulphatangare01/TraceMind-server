// export enum ApplicationStatus {
//   ACTIVE = "ACTIVE",
//   INACTIVE = "INACTIVE",
//   ARCHIVED = "ARCHIVED",
//   DELETED = "DELETED",
// }

export enum ApplicationStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  MAINTENANCE = "MAINTENANCE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",

  // DELETED = "DELETED",
}
// export enum ApplicationType {
//   BACKEND = "BACKEND",
//   FRONTEND = "FRONTEND",
//   MOBILE = "MOBILE",
//   WORKER = "WORKER",
//   SERVICE = "SERVICE",
//   OTHER = "OTHER",
// }

export enum ApplicationType {
  BACKEND = "BACKEND",

  FRONTEND = "FRONTEND",

  MOBILE = "MOBILE",

  SERVICE = "SERVICE",

  MICROSERVICE = "MICROSERVICE",

  WORKER = "WORKER",

  JOB = "JOB",

  API_GATEWAY = "API_GATEWAY",

  DATABASE = "DATABASE",

  CLI = "CLI",

  IOT = "IOT",

  SERVERLESS = "SERVERLESS",

  OTHER = "OTHER",
}
