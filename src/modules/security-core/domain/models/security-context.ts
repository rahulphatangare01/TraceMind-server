import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../enums/index";

export interface SecurityContext {
  scope: SecurityScope;

  organizationId?: string;
  projectId?: string;
  applicationId?: string;
  environmentId?: string;

  classification: DataClassification;
  purpose: SecurityPurpose;
}
