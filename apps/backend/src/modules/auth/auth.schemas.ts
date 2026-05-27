import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, "Name must contain at lest 2 characters."),
    email: z.string().email("Invalid email address.").max(255, "Email must be less than 255 characters."),
    password: z.string().min(8, "Password must contain at least 8 characters.").max(255, "Password must be less than 255 characters."),
});


export const loginSchema = z.object({
    email: z.string().email("Invalid email address.").max(255, "Email must be less than 255 characters."),
    password: z.string().min(1, "Password is required.")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;