import { Router } from "express";

import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { documentsController } from "./documents.controller.js";

export const documentsRouter = Router();

documentsRouter.use(authMiddleware);

documentsRouter.get("/", documentsController.list);
documentsRouter.get("/:id", documentsController.getById);
documentsRouter.delete("/:id", documentsController.delete);