import { Router } from "express";
import { prisma } from "../../infrastructure/database/prisma.client.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "synko-backend",
    timestamp: new Date().toISOString()
  });
});

healthRouter.get("/db", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "ok",
      database: "postgres",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});