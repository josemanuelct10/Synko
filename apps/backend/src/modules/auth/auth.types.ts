export type AuthUserResponse = {
    id: string,
    name: string,
    email: string
};

export type RegisterResponse = {
    message: string,
    user: AuthUserResponse
}