# ADR 0002: Use Angular 21 with Microfrontends

## Status

Accepted

## Date

2026-05-26

## Context

Synko requires a frontend capable of supporting several functional domains such as authentication, document management, intelligent document querying, and future administrative features.

The frontend must provide a clean user experience while remaining modular and maintainable as the project grows.

The project also has a professional portfolio purpose. Therefore, the frontend architecture should demonstrate the ability to organize a modern Angular application beyond a simple single-module structure.

The main options considered were:

- A single Angular application with feature modules.
- Angular with microfrontends.
- React with microfrontends.
- Vue with a modular architecture.
- A simpler monolithic frontend.

## Decision

Synko will use **Angular 21** with a **microfrontend-oriented architecture**.

The initial frontend structure will be divided into a small number of functional applications:

```text
apps/frontend/
├── shell/
├── auth/
├── documents/
└── chat/
```

The `shell` application will act as the main container and will be responsible for layout, navigation, shared configuration, and loading the microfrontends.

The initial microfrontends will be:

| Microfrontend | Responsibility |
|---|---|
| shell | Main container, layout, navigation, and composition |
| auth | Login, registration, logout, and session-related views |
| documents | Document upload, listing, metadata, and processing status |
| chat | Questions, answers, sources, and query history |

No additional microfrontends will be created until there is a clear domain or scalability reason.

## Reasons

### Domain separation

Synko has clear functional areas:

- Authentication.
- Document management.
- Intelligent chat.
- Future administration.
- Future team or workspace features.

Separating these areas helps keep responsibilities clear and prevents the frontend from becoming a large, tightly coupled application.

### Professional frontend architecture

Using microfrontends demonstrates knowledge of advanced frontend architecture.

The goal is not only to build screens, but to show that the frontend can be organized around domains, ownership boundaries, and independent evolution.

### Scalability of the codebase

As Synko grows, each domain may evolve independently.

For example:

- The authentication area may require changes in session handling.
- The documents area may grow with upload progress, previews, filters, and processing states.
- The chat area may become more complex with citations, history, streaming responses, and feedback.

Microfrontends make it easier to isolate this growth.

### Alignment with Angular

Angular is suitable for large frontend applications because it provides structure, routing, dependency injection, guards, interceptors, services, and strong TypeScript integration.

Using Angular 21 allows the project to practice modern Angular patterns while keeping the frontend strongly typed and maintainable.

## Alternatives Considered

### Single Angular Application

A single Angular application with feature modules would be simpler and faster to start.

This would reduce infrastructure complexity and avoid some microfrontend-specific problems.

However, it would provide less architectural differentiation for a portfolio project and would not allow practicing microfrontend composition.

This option is still the fallback if microfrontends introduce too much complexity too early.

### React with Microfrontends

React is flexible and commonly used for microfrontend architectures.

However, Angular was selected because it provides stronger conventions and better alignment with the project owner’s current experience and professional direction.

### Vue Modular Frontend

Vue is also a valid option and familiar to the project owner.

However, Angular was chosen because the goal is to build a more enterprise-oriented frontend architecture.

### Monolithic Frontend

A simple monolithic frontend would be the easiest approach.

It was rejected because Synko is intended to be a serious portfolio project that demonstrates architecture, modularity, and long-term maintainability.

## Consequences

### Positive Consequences

- Clear frontend domain separation.
- Better maintainability as the project grows.
- Strong portfolio value.
- Opportunity to practice advanced Angular architecture.
- Possibility of independent evolution for each frontend domain.
- Cleaner separation between shell, authentication, documents, and chat.

### Negative Consequences

- Higher initial complexity.
- More configuration required.
- More complex routing and build setup.
- Shared dependencies must be managed carefully.
- Risk of overengineering.
- Small features may take longer to implement.
- More difficult debugging compared to a single Angular application.

## Mitigation

To reduce unnecessary complexity, the project will follow these rules:

- Start with only four frontend applications: `shell`, `auth`, `documents`, and `chat`.
- Avoid creating new microfrontends without a clear reason.
- Keep shared UI and utilities minimal at the beginning.
- Document communication contracts between the shell and microfrontends.
- Avoid duplicating authentication or API logic.
- Keep routing simple during the first version.
- Prioritize a working vertical slice before expanding the architecture.

The first goal is not to create a perfect microfrontend platform, but a controlled and understandable microfrontend structure.

## Communication Strategy

The frontend will communicate with the backend through REST APIs.

Microfrontends will not communicate directly with PostgreSQL, Qdrant, or AI providers.

The backend remains the only layer allowed to access infrastructure services.

Initial communication rules:

- `auth` handles user authentication views.
- `documents` handles document-related views.
- `chat` handles RAG query views.
- Shared session state will be coordinated through the shell or a shared frontend library.
- API calls will go through frontend services or shared API clients.

## Future Considerations

If the frontend grows, Synko may add:

- Shared design system.
- Shared UI component library.
- Shared authentication/session library.
- Admin microfrontend.
- Teams or workspaces microfrontend.
- Analytics microfrontend.
- Independent deployment per microfrontend.
- Module federation configuration improvements.

If the microfrontend approach becomes too expensive for the size of the project, the architecture may be simplified into a modular Angular application while preserving domain separation.

## Final Decision

Synko will use **Angular 21 with a controlled microfrontend architecture**.

The decision is accepted because it provides strong portfolio value, clear domain separation, and a useful learning opportunity.

The main condition is to avoid premature fragmentation and keep the initial frontend structure limited to `shell`, `auth`, `documents`, and `chat`.