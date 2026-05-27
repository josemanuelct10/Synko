import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error.js";
import { documentIdParamSchema } from "./documents.schemas.js";
import { documentsService } from "./documents.service.js";

export const documentsController = {
    list: (async (req, res, next) => {
        try {
            if (!req.user) return next(new AppError("Unauthenticated request", 401));

            const result = await documentsService.list(req.user.sub);

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }) satisfies RequestHandler,

    getById: (async (req, res, next) => {
        try {
            if (!req.user) return next(new AppError("Unauthenticated request", 401));

            const { id } = documentIdParamSchema.parse(req.params);

            const result = await documentsService.getById(id, req.user.sub);

            return res.status(200).json(result);
        }catch (error) {
            return next(error);
        }
    }) satisfies RequestHandler,

    delete: (async (req, res, next) => {
        try {
            if (!req.user) return next(new AppError("Unauthenticated request", 401));

            const { id } = documentIdParamSchema.parse(req.params);

            const result = await documentsService.delete(id, req.user.sub);

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }) satisfies RequestHandler
}