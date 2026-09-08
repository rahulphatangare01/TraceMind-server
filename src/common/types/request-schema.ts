import type { ZodType } from "zod";

export interface RequestSchema {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}
