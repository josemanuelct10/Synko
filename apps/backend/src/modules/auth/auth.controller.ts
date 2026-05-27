import type { RequestHandler } from "express";

import { authService } from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import { AppError } from "../../shared/errors/app-error.js";

export const authController = {
    register: (async (req, res, next) => {
        try {
            const input = registerSchema.parse(req.body);

            const result = await authService.register(input);

            return res.status(201).json(result);
        } catch (error) {
            return next(error);
        }
    }) satisfies RequestHandler,

    login: (async (req, res, next) => {
        try {
            const input = loginSchema.parse(req.body);

            const result = await authService.login(input);

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }) satisfies RequestHandler,

    me: (async (req, res, next) => {
        try {
            if (!req.user) return next(new AppError("Unauthenticated request", 401));

            const result = await authService.me(req.user.sub);

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }) satisfies RequestHandler
};