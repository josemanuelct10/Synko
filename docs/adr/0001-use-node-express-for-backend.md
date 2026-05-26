# ADR 0001: Use Node.js and Express for the Backend

## Status

Accepted

## Date

2026-05-26

## Context

Synko requires a backend capable of handling authentication, document management, file uploads, document processing, communication with PostgreSQL, integration with Qdrant, and orchestration of the RAG pipeline.

The backend must act as the central coordination layer between the frontend, relational database, vector database, file processing logic, and AI providers.

The project also has an educational and professional portfolio purpose. Therefore, the backend should not only be functional, but also structured in a way that demonstrates maintainability, separation of concerns, and scalable software design.

The main options considered were:

- Node.js with Express.
- Python with FastAPI.
- NestJS.
- Laravel.
- Django.

## Decision

Synko will use **Node.js with Express and TypeScript** as the backend stack.

The backend will be structured using modules and layers instead of a flat route/controller structure.

The initial backend architecture will follow this approach:

```text
apps/backend/src/
├── config/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── documents/
│   ├── embeddings/
│   └── chat/
│
├── shared/
│   ├── middlewares/
│   ├── errors/
│   ├── utils/
│   └── types/
│
├── infrastructure/
│   ├── database/
│   ├── qdrant/
│   ├── storage/
│   └── ai/
│
├── app.ts
└── server.ts
```

Each module will generally be organized using:

```text
module.routes.ts
module.controller.ts
module.service.ts
module.repository.ts
module.schemas.ts
module.types.ts
```

The backend will expose a REST API consumed by the Angular frontend and its microfrontends.

## Reasons

### Familiarity and productivity

Node.js and Express are familiar technologies and allow fast development without introducing unnecessary framework complexity at the beginning of the project.

This is important because Synko already includes several complex areas:

- Microfrontends.
- Document processing.
- PostgreSQL.
- Qdrant.
- RAG pipeline.
- Docker.
- Jenkins.

Using Express keeps the backend lightweight and avoids adding too many abstractions too early.

### TypeScript support

Using TypeScript improves maintainability, type safety, and developer experience.

It also helps define clearer contracts between:

- Controllers and services.
- Services and repositories.
- Backend and frontend.
- Backend and external providers.
- Internal RAG components.

### Flexibility

Express provides a flexible foundation that allows the project to define its own architecture.

This flexibility is useful because Synko needs to integrate several different responsibilities:

- Authentication.
- File uploads.
- PDF processing.
- Embedding generation.
- Vector search.
- Chat and answer generation.
- Metadata persistence.
- External AI provider integration.

### Portfolio value

A well-structured Express backend can demonstrate architectural thinking if it avoids the common mistake of mixing all logic inside route handlers.

The goal is not just to use Express, but to show that a lightweight framework can be organized with professional standards.

## Alternatives Considered

### FastAPI

FastAPI was a strong alternative because it fits very well with AI, Python-based document processing, and machine learning tooling.

However, the decision was made to use Node.js because the project owner already has experience with JavaScript/TypeScript and wants to reinforce backend architecture using that ecosystem.

FastAPI may still be considered in the future for a separate AI processing service if the project grows.

### NestJS

NestJS provides a more opinionated architecture, dependency injection, decorators, modules, guards, and a structure closer to enterprise backend development.

It was not selected for the initial version because it introduces more framework-level complexity.

For Synko, the goal is to explicitly design the architecture rather than rely too much on framework conventions from the start.

NestJS may be reconsidered in the future if the backend grows significantly and needs stronger architectural enforcement.

### Laravel

Laravel is productive and mature, especially for traditional web applications and CRUD-heavy systems.

However, Synko requires a strong JavaScript/TypeScript ecosystem alignment with the frontend and a backend that can be easily shaped around RAG orchestration and external AI integrations.

Laravel was not selected for the initial backend.

### Django

Django is mature and has strong built-in features such as ORM, authentication, admin panel, and project structure.

However, similar to Laravel, it was considered heavier than necessary for this project’s initial goals.

It was also less aligned with the chosen TypeScript-based frontend/backend direction.

## Consequences

### Positive Consequences

- The backend will remain lightweight and flexible.
- Development can start quickly.
- TypeScript will improve safety and maintainability.
- The project will demonstrate custom backend architecture decisions.
- Integration with Angular and shared TypeScript concepts will be natural.
- Express gives enough control to design clean modules and layers.

### Negative Consequences

- Express does not enforce architecture by default.
- Without discipline, the backend can easily become unstructured.
- Dependency injection, validation, guards, and modules must be designed or added manually.
- Some AI and document-processing libraries are stronger in Python than in Node.js.
- More architectural decisions must be documented and maintained by the developer.

## Mitigation

To avoid backend disorder, the project will enforce several rules:

- Routes must not contain business logic.
- Controllers must not access the database directly.
- Services will contain business logic.
- Repositories will encapsulate database access.
- Infrastructure clients will be isolated from domain modules.
- Validation schemas will be defined close to each module.
- Shared utilities will be centralized under `shared`.
- External provider logic will be abstracted behind internal services.

The backend will also include linting, formatting, environment validation, and tests as the project matures.

## Future Considerations

If Synko grows significantly, the backend architecture may evolve in one of the following directions:

- Continue with Express and strengthen internal architecture.
- Migrate to NestJS if stronger framework-level structure is needed.
- Extract AI processing into a separate Python/FastAPI service.
- Add asynchronous workers for document processing and embeddings.
- Add a queue system such as BullMQ with Redis.
- Add observability with structured logs and metrics.

## Final Decision

Synko will use **Node.js, Express, and TypeScript** for the initial backend.

This decision balances familiarity, flexibility, speed of development, and architectural learning value.

The success of this decision depends on maintaining a clean modular structure and documenting technical decisions as the project evolves.