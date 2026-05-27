export type AuthUserResponse = {
    id: string,
    name: string,
    email: string,
    roles?: string[];
};

export type RegisterResponse = {
    message: string,
    user: AuthUserResponse
}

export type LoginReseponse = {
    access_token: string,
    token_type: "Bearer",
    user: AuthUserResponse
}

export type JwtPayload = {
    sub: string,
    email: string,
    roles: string[]
}

export type MeResponse = {
    user: AuthUserResponse
}