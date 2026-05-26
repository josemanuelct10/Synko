# 03. Authentication — Synko

## 1. Document Objective

This document defines the initial authentication strategy for **Synko**.

The goal is to establish how users register, how they log in, how the API is protected, and how the frontend maintains the user session.

Authentication is a critical part of the system because Synko will manage private user documents. Therefore, the backend must guarantee that each user can only access their own resources.

---

## 2. Context

Synko will allow registered users to upload documents, query information using AI, and keep a history of conversations.

This means the system must protect:

- Uploaded documents.
- Extracted chunks.
- User queries.
- Generated answers.
- Retrieved sources.
- Chat sessions.

Authentication must identify the user in each request and enforce data isolation both in PostgreSQL and Qdrant.

---

## 3. Initial Decision

Synko will use authentication based on **JWTs** issued by the backend.

The token will be generated after a successful login and will be used to access protected routes.

In the first version, the strategy will be:

```text
1. The user logs in with email and password.
2. The backend validates the credentials.
3. The backend generates a signed JWT.
4. The frontend stores the session state.
5. The frontend sends the token in protected requests.
6. The backend validates the token on each private request.
7. The backend extracts the `user_id` from the token.
8. Services filter resources by `user_id`.
```

---

## 4. User Registration

The initial registration flow will be:

```text
1. The user enters name, email, and password.
2. The frontend sends the data to the registration endpoint.
3. The backend validates the data format.
4. The backend checks that the email does not already exist.
5. The backend hashes the password.
6. The user is stored in PostgreSQL.
7. The initial `user` role is assigned.
8. The backend returns a successful registration response.
```

Initial endpoint:

```text
POST /auth/register
```

Expected payload:

```json
{
  "name": "Jose Manuel",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Expected response:

```json
{
  "message": "User registered successfully"
}
```

---

## 5. User Login

The initial login flow will be:

```text
1. The user enters email and password.
2. The frontend sends the data to the login endpoint.
3. The backend searches for the user by email.
4. The backend compares the received password with the stored hash.
5. If the credentials are valid, a JWT is generated.
6. The backend returns the token and minimum user data.
```

Initial endpoint:

```text
POST /auth/login
```

Expected payload:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Expected response:

```json
{
  "access_token": "jwt-token",
  "token_type": "Bearer",
  "user": {
    "id": "uuid",
    "name": "Jose Manuel",
    "email": "user@example.com"
  }
}
```

---

## 6. Token Storage Strategy

There are several options for storing the token in the frontend:

| Option | Advantages | Disadvantages |
|---|---|---|
| localStorage | Simple to implement | Exposed to XSS |
| sessionStorage | Simple and cleared when the tab is closed | Exposed to XSS |
| Memory | Safer against persistence risks | Lost on page reload |
| HTTP-only Cookie | Better protection against XSS | Requires more careful CSRF/CORS configuration |

## Initial Decision

For the first version, Synko may start by using **JWT in memory or sessionStorage** to simplify development.

However, the recommended option for a more secure version will be to migrate to **HTTP-only cookies**.

Expected evolution:

```text
Initial phase: JWT Bearer token to speed up development.
Later phase: HTTP-only cookie with proper CSRF/CORS configuration.
```

---

## 7. Backend Route Protection

Private routes must use an authentication middleware.

Examples of protected routes:

```text
GET /documents
POST /documents
DELETE /documents/:id
POST /chat/query
GET /chat/sessions
GET /chat/sessions/:id/messages
```

The middleware must:

```text
1. Read the token from the Authorization header.
2. Validate the token signature.
3. Validate expiration.
4. Extract `user_id`.
5. Add the authenticated user to the request object.
6. Reject the request if the token is invalid.
```

Expected header:

```text
Authorization: Bearer <token>
```

---

## 8. JWT Payload

The JWT must not include sensitive information.

Recommended initial payload:

```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "roles": ["user"],
  "iat": 1710000000,
  "exp": 1710003600
}
```

Fields:

| Field | Meaning |
|---|---|
| sub | User identifier |
| email | User email |
| roles | Assigned roles |
| iat | Issued-at timestamp |
| exp | Expiration timestamp |

The `sub` field will be the main reference for obtaining the `user_id`.

---

## 9. Token Expiration

In the first version, a short or moderate expiration time will be used.

Example:

```text
ACCESS_TOKEN_EXPIRES_IN=1h
```

Later, the system may add:

- Refresh tokens.
- Token rotation.
- Session invalidation.
- Real backend-managed logout.
- Revoked token list.

For the first version, logout may be handled by deleting the token from the frontend.

---

## 10. Password Hashing

Passwords must never be stored in plain text.

A secure hashing library will be used, such as:

```text
bcrypt
argon2
```

Initial decision:

```text
bcrypt
```

Reasons:

- Well known.
- Stable.
- Good Node.js support.
- Sufficient for the first version.

Initial configuration:

```text
SALT_ROUNDS=10
```

This configuration may be adjusted depending on performance and security needs.

---

## 11. User Data Isolation

Authentication does not end with token validation.

Every operation over private resources must verify ownership.

Example:

```text
GET /documents/:id
```

It is not enough to search the document only by `id`.

It must be searched by:

```text
document_id + user_id
```

General rule:

```text
Every private resource must be filtered by the authenticated `user_id`.
```

This applies to:

- Documents.
- Document chunks.
- Chat sessions.
- Chat messages.
- Qdrant searches.

---

## 12. Qdrant Search Security

Vector searches must include a user filter.

Conceptual example:

```json
{
  "vector": [0.123, 0.456],
  "filter": {
    "must": [
      {
        "key": "user_id",
        "match": {
          "value": "authenticated_user_id"
        }
      }
    ]
  },
  "limit": 5
}
```

This prevents a user from receiving chunks belonging to another user's documents.

---

## 13. Roles and Permissions

The first version will have basic roles:

```text
user
admin
```

The `user` role will be able to:

- Upload documents.
- List their documents.
- Delete their documents.
- Ask questions about their documents.
- View their chat history.

The `admin` role is reserved for future administrative features.

A complex permission system will not be implemented in the first version.

---

## 14. Input Validation

All authentication endpoints must validate input data.

Fields to validate during registration:

```text
name
email
password
```

Fields to validate during login:

```text
email
password
```

Minimum rules:

- Valid email format.
- Minimum password length.
- Non-empty name.
- Do not allow unexpected fields if strict validation is used.

Validation may be implemented with:

```text
zod
joi
yup
```

Recommended initial decision:

```text
zod
```

Reason:

- Works well with TypeScript.
- Allows type inference.
- Lightweight and clear.

---

## 15. Error Management

Authentication errors must be clear but should not reveal sensitive information.

Example:

```json
{
  "error": "Invalid credentials"
}
```

It is not recommended to publicly differentiate between:

```text
Email does not exist
Password is incorrect
```

Because that may enable user enumeration.

Common errors:

| Case | Code |
|---|---|
| Invalid data | 400 |
| Invalid credentials | 401 |
| Missing token | 401 |
| Invalid token | 401 |
| User without permissions | 403 |
| Email already registered | 409 |

---

## 16. Environment Variables

Initial authentication-related variables:

```env
JWT_SECRET=change_me
JWT_EXPIRES_IN=1h
SALT_ROUNDS=10
```

Rules:

- `JWT_SECRET` must never be committed to the repository.
- A `.env.example` file must exist.
- In production, a strong secret must be used.
- Sensitive values must be managed through environment variables.

---

## 17. Logout

In the first version, logout will consist of deleting the token stored in the frontend.

Flow:

```text
1. The user clicks logout.
2. The frontend deletes the token.
3. The frontend clears the session state.
4. The user is redirected to login.
```

Limitation:

```text
The token will remain valid until it expires.
```

Future improvements:

- Refresh tokens.
- Token revocation.
- Session table.
- Backend-managed logout.

---

## 18. Microfrontend Considerations

Authentication must be consistent between the shell and the microfrontends.

Initial rules:

- The shell will manage the global session state.
- Microfrontends must not duplicate authentication logic.
- Private routes will be protected from the shell or through shared guards.
- The token or authenticated state must be shared in a controlled way.
- HTTP services must add the token to protected requests.

Each microfrontend should not implement its own independent authentication flow.

---

## 19. Risks

### Use of localStorage or sessionStorage

Risk:

```text
Higher exposure to XSS attacks.
```

Mitigation:

```text
Migrate to HTTP-only cookies in a later phase.
Apply XSS prevention best practices.
Avoid injecting untrusted HTML.
```

### JWT Without Revocation

Risk:

```text
A stolen token remains valid until it expires.
```

Mitigation:

```text
Use short expiration.
Add refresh tokens and revocation in future phases.
```

### Forgotten User Filters

Risk:

```text
A user could access another user's data.
```

Mitigation:

```text
Apply user_id filtering in all repositories.
Create authorization tests.
Centralize ownership validation.
```

### Microfrontend Complexity

Risk:

```text
Session logic duplication between microfrontends.
```

Mitigation:

```text
Centralize session management in the shell or a shared library.
Document frontend authentication contracts.
```

---

## 20. Pending Decisions

| Decision | Status |
|---|---|
| JWT in header vs HTTP-only cookie | Initially header, future cookie |
| Refresh tokens | Pending |
| Email verification | Pending |
| Password recovery | Pending |
| Google/GitHub OAuth | Out of initial scope |
| Session table | Pending |
| Token revocation | Pending |

---

## 21. Summary

Synko will use JWT-based authentication for the first version.

The backend will issue signed tokens after validating credentials and will protect private routes through middleware.

The authenticated user identifier will be mandatory for filtering documents, chunks, sessions, messages, and vector searches.

The first version will prioritize simplicity and functional progress, while documenting the expected evolution toward a more secure authentication strategy using HTTP-only cookies, refresh tokens, and session management.