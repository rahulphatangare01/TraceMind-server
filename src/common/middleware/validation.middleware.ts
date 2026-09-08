import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { ValidationError } from "../errors/index.js";

export interface RequestValidationSchema {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export const validateRequest = (schema: RequestValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validationResult = {
      body: schema.body
        ? schema.body.safeParse(req.body)
        : { success: true as const, data: req.body },

      params: schema.params
        ? schema.params.safeParse(req.params)
        : { success: true as const, data: req.params },

      query: schema.query
        ? schema.query.safeParse(req.query)
        : { success: true as const, data: req.query },
    };

    const errors: Record<string, unknown> = {};

    if (!validationResult.body.success) {
      errors.body = validationResult.body.error.flatten();
    }

    if (!validationResult.params.success) {
      errors.params = validationResult.params.error.flatten();
    }

    if (!validationResult.query.success) {
      errors.query = validationResult.query.error.flatten();
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Request validation failed", errors);
    }

    req.body = validationResult.body.data;

    next();
  };
};
