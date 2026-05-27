import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { env } from "../../config/env.js";
import { AppError } from "../errors/app-error.js";

export const errorHandlerMiddleware: ErrorRequestHandler = ( error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: "Validation error",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      }
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message
      }
    });
  }

  console.error(error);

  return res.status(500).json({
    error: {
      message: env.NODE_ENV === "production" ? "Internal server error" : error.message
    }
  });
};