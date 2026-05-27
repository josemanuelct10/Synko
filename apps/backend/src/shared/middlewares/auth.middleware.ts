import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { AppError } from "../errors/app-error.js";
import type { JwtPayload } from "../../modules/auth/auth.types.js";

export const authMiddleware: RequestHandler = (req, _res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) return next(new AppError("Authorization header is missing", 401));

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) return next(new AppError("Invalid authorization header format", 401));

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        req.user = decoded;

        return next();
    } catch (error) {
        return next(new AppError("Invalid or expired token", 401));
    }
}