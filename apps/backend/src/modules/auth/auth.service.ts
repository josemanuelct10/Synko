import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { authRepository } from "./auth.repository.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import type { JwtPayload, LoginReseponse, MeResponse, RegisterResponse } from "./auth.types.js";


export const authService = {
    async register(input: RegisterInput): Promise<RegisterResponse> {
        const existingUser = await authRepository.findUserByEmail(input.email);
        if (existingUser) throw new AppError("Email is already registered", 400);

        const defaultRole = await authRepository.findRoleByName("user");

        if (!defaultRole) throw new AppError("Default user role is not configured", 500);

        const passwordHash = await bcrypt.hash(input.password, env.SALT_ROUNDS);

        const user = await authRepository.createUserWithRole({
            name: input.name,
            email: input.email,
            passwordHash,
            roleId: defaultRole.id
        });

        return {
            message: "User registered successfully",
            user
        };
    },

    async login (input: LoginInput): Promise<LoginReseponse> {
        const user = await authRepository.findUserWithRolesByEmail(input.email);

        if (!user) throw new AppError("Invalid credentials", 401);

        if (user.status != "active") throw new AppError("User account is not active", 403);

        const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

        if (!passwordMatches) throw new AppError("Invalid credentials", 401);

        const roles = user.roles.map((userRole) => userRole.role.name);

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            roles
        };

        const accessToken = jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN
        });

        return {
            access_token: accessToken,
            token_type: "Bearer",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles
            }
        };
    },

    async me(userId: string): Promise<MeResponse> {
        const user = await authRepository.findUserWithRolesById(userId);

        if (!user) throw new AppError("User not found", 404);

        if (user.status != "active") throw new AppError("User account is not active", 403);

        const roles = user.roles.map((userRole) => userRole.role.name);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles
            }
        };
    }
};