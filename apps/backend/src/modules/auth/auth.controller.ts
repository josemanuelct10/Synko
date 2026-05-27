import type { RequestHandler } from "express";

import { authService } from "./auth.service.js";
import { registerSchema } from "./auth.schemas.js";

export const authController = {
  register: (async (req, res, next) => {
    try {
      const input = registerSchema.parse(req.body);

      const result = await authService.register(input);

      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }) satisfies RequestHandler
};