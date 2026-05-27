export type AuthUser = {
    id: string;
    name: string;
    email: string;
    roles?: string[];
}

export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
}

export type RegisterResponse = {
    message: string;
    user: AuthUser;
}

export type LoginRequest = {
    email: string;
    password: string;
}

export type LoginResponse = {
    access_token: string;
    token_type: "Bearer";
    user: AuthUser;
}

export type MeResponse = {
    user: AuthUser;
}