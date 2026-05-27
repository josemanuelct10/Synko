import { Router } from "express";

import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { documentsController } from "./documents.controller.js";
import { uploadDocumentMiddleware } from "./documents.upload.js";

export const documentsRouter = Router();

documentsRouter.use(authMiddleware);

documentsRouter.get("/", documentsController.list);
documentsRouter.get("/:id", documentsController.getById);
documentsRouter.delete("/:id", documentsController.delete);
documentsRouter.post("/upload", uploadDocumentMiddleware.single("file"), documentsController.upload);