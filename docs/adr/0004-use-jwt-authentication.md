# ADR 0004: Use JWT-Based Authentication

## Status

Accepted

## Date

2026-05-26

## Context

Synko needs an authentication mechanism to identify users and protect private resources such as documents, document chunks, chat sessions, messages, and RAG queries.

Every private operation must be associated with an authenticated user. This is especially important because Synko stores user-specific documents and uses Qdrant for semantic search, where vector queries must also be filtered by user ownership.

The authentication system must support:

- User registration.
- User login.
- Protected backend routes.
- User-based data isolation.
- Frontend session handling.
- Future evolution toward stronger session security.

The main options considered were:

- JWT Bearer tokens.
- HTTP-only cookies.
- Server-side sessions.
- OAuth with external providers.
- Hybrid access token and refresh token strategy.

## Decision

Synko will initially use **JWT Bearer token authentication**.

After a successful login, the backend will issue a signed JWT. The frontend will send this token in protected requests using the `Authorization` header.

```text
Authorization: Bearer <token>
```

The backend will validate the token through authentication middleware and extract the authenticated user identifier from the JWT `sub` claim.

The initial JWT payload will include:

```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "roles": ["user"],
  "iat": 1710000000,
  "exp": 1710003600
}
```

The token will not contain sensitive information.

## Reasons

### Simplicity for the first version

JWT Bearer authentication is simple to implement and allows the project to move forward without introducing too much session infrastructure early.

Synko already includes several complex areas:

- Microfrontends.
- PostgreSQL.
- Qdrant.
- Document processing.
- Embeddings.
- RAG pipeline.
- Docker.
- Jenkins.

Starting with JWT Bearer tokens reduces authentication complexity during the initial implementation.

### Stateless backend

JWT allows the backend to validate authentication without storing session state in the database for every request.

This keeps the first version simpler and allows protected routes to be implemented quickly.

### Clear ownership model

The `sub` claim provides a clear way to identify the authenticated user.

Every private repository query and Qdrant search must filter data using this authenticated `user_id`.

### Easy frontend integration

JWT Bearer tokens are straightforward to integrate with Angular interceptors.

The frontend can attach the token to outgoing HTTP requests and protect routes using guards.

## Alternatives Considered

### HTTP-only Cookies

HTTP-only cookies provide better protection against token theft through XSS because JavaScript cannot directly read them.

However, they require more careful configuration:

- CORS.
- SameSite policy.
- Secure flag.
- CSRF protection.
- Cookie domain handling.
- Local development setup.

This approach is more secure for production and may be adopted in a later phase.

### Server-Side Sessions

Server-side sessions allow centralized invalidation and stronger control over active sessions.

However, they require session storage and more backend state management.

This was considered unnecessary for the first version.

### OAuth Providers

OAuth with Google or GitHub could improve login convenience.

However, it adds external provider configuration and is outside the initial scope.

### Access and Refresh Tokens

A more complete strategy would use short-lived access tokens and refresh tokens.

This improves security and user experience but adds complexity around refresh token storage, rotation, invalidation, and logout.

This may be introduced in a later phase.

## Consequences

### Positive Consequences

- Simple initial implementation.
- Stateless route protection.
- Good fit for REST APIs.
- Easy Angular integration through HTTP interceptors.
- Clear `user_id` extraction from token.
- Faster progress toward the first working version.

### Negative Consequences

- JWTs are difficult to revoke before expiration.
- If stored in localStorage or sessionStorage, they are exposed to XSS.
- Logout only removes the token from the frontend in the first version.
- More secure cookie-based authentication is postponed.
- Refresh token support is not included initially.

## Mitigation

Synko will apply the following mitigations:

- Use short or moderate token expiration.
- Avoid storing sensitive information in the token.
- Never commit `JWT_SECRET`.
- Use a strong secret in real environments.
- Validate token signature and expiration in middleware.
- Filter every private resource by authenticated `user_id`.
- Add authorization tests in later phases.
- Plan migration to HTTP-only cookies or refresh tokens when the first version is stable.

## Security Rules

The following rules must be enforced:

- Passwords are never stored in plain text.
- JWT payload must not include sensitive data.
- `JWT_SECRET` must be configured through environment variables.
- Protected routes must require authentication middleware.
- Resource ownership must be verified using `user_id`.
- Qdrant searches must include a `user_id` filter.
- Authentication logic must not be duplicated across microfrontends.

## Future Considerations

Future improvements may include:

- HTTP-only cookie authentication.
- Refresh tokens.
- Refresh token rotation.
- Backend-managed logout.
- Revoked token list.
- Session table.
- Email verification.
- Password reset.
- OAuth with Google or GitHub.
- Multi-factor authentication.

## Final Decision

Synko will start with **JWT Bearer authentication** because it provides a simple and effective foundation for the first version.

The architecture will keep the door open to a more secure authentication strategy using HTTP-only cookies, refresh tokens, and backend-managed sessions in future phases.