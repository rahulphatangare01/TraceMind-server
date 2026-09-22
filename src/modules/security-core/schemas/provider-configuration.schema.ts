import { z } from "zod";

import { SecurityProviderType } from "../types/provider.types.js";

export const securityProviderConfigurationSchema = z.object({
  providerId: z.string().trim().min(1, "Provider id is required"),

  type: z.nativeEnum(SecurityProviderType),

  //   settings: z.record(z.unknown()),
  settings: z.record(z.string(), z.unknown()),
});
