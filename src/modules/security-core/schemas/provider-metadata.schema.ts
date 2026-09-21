import { z } from "zod";

import {
  SecurityProviderCapability,
  SecurityProviderType,
} from "../types/provider.types.js";

export const securityProviderMetadataSchema = z.object({
  id: z.string().trim().min(1, "Provider id is required"),

  name: z.string().trim().min(1, "Provider name is required"),

  type: z.nativeEnum(SecurityProviderType),

  version: z.string().trim().min(1, "Provider version is required"),

  capabilities: z
    .array(z.nativeEnum(SecurityProviderCapability))
    .min(1, "Provider must expose at least one capability")
    .refine(
      (capabilities) => new Set(capabilities).size === capabilities.length,
      {
        message: "Provider capabilities must be unique",
      },
    ),
});
