import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { notFoundMiddleware } from "./shared/middlewares/not-found.middleware.js";
import { errorHandlerMiddleware } from "./shared/middlewares/error-handler.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { documentsRouter } from "./modules/documents/documents.routes.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/documents", documentsRouter);
  
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
};