import bcrypt from 'bcrypt';
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { authRepository } from "./auth.repository.js";
import type { RegisterInput } from "./auth.schemas.js";
import type { RegisterResponse } from "./auth.types.js";


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
    }
};