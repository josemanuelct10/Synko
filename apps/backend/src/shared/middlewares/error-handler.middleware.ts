import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import { env } from "../../config/env.js";

export const errorHandlerMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
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
      message:
        env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message
    }
  });
};