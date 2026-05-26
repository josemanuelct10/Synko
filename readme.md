# Synko

**Synko** is an intelligent document management platform powered by Generative AI, semantic search, and RAG.

**Synko** es una plataforma inteligente de gestión documental basada en IA generativa, búsqueda semántica y RAG.

---

## Project Status

Synko is currently in the **architecture and initial documentation phase**.

The project is being designed before implementation to define clear technical decisions, avoid unnecessary improvisation, and build a maintainable foundation.

Current focus:

- Project context.
- Initial architecture.
- Architecture Decision Records.
- Data model.
- Authentication strategy.
- Docker-based local development.
- Preparation for backend and frontend implementation.

---

## Purpose

The main purpose of Synko is to build a realistic full stack project that combines:

- Backend architecture.
- Frontend modularity.
- Microfrontend design.
- Relational databases.
- Vector databases.
- Generative AI.
- RAG pipelines.
- Docker-based infrastructure.
- CI/CD automation with Jenkins.
- Technical documentation.

Synko is not intended to be a simple CRUD project.  
It is designed as a professional portfolio project that demonstrates architectural thinking, technical consistency, and applied AI integration.

---

## Problem

Many users and teams work with large amounts of documentation:

- PDF files.
- Manuals.
- Contracts.
- Reports.
- Technical documentation.
- Internal procedures.
- Administrative documents.

Finding specific information inside these documents can be slow and inefficient.

Traditional keyword-based search often fails to understand context, and users usually need to manually open, read, and compare multiple files.

Synko aims to solve this by allowing users to upload documents and ask natural language questions about their content.

Example questions:

```text
What is the summary of this contract?
Which documents mention this clause?
What payment terms appear in these files?
What steps does the manual describe?
Compare these reports.
```

---

## Main Features

Initial planned features:

- User registration and login.
- JWT-based authentication.
- Private document management.
- PDF upload.
- Document metadata storage.
- Text extraction from PDFs.
- Text chunking.
- Embedding generation.
- Vector storage in Qdrant.
- Semantic search.
- RAG-based question answering.
- Source traceability for generated answers.
- Chat session history.
- Dockerized local environment.
- Jenkins pipeline in a later phase.

---

## Tech Stack

### Frontend

- Angular 21.
- Microfrontend-oriented architecture.
- TypeScript.
- Angular Router.
- Guards and interceptors.
- Shell application plus domain microfrontends.

Planned frontend structure:

```text
apps/frontend/
├── shell/
├── auth/
├── documents/
└── chat/
```

### Backend

- Node.js.
- Express.
- TypeScript.
- Modular architecture.
- REST API.
- JWT authentication.
- PostgreSQL integration.
- Qdrant integration.
- AI provider abstraction.

Planned backend structure:

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
├── infrastructure/
├── app.ts
└── server.ts
```

### Databases

- PostgreSQL as the main relational database.
- Qdrant as the vector database.

### Infrastructure

- Docker.
- Docker Compose.
- Jenkins.
- Environment-based configuration.

### AI / RAG

- Embeddings.
- Semantic search.
- Retrieval-Augmented Generation.
- Source-aware answers.
- Future support for different AI providers.

---

## Architecture Overview

Initial logical architecture:

```text
[Angular Shell]
      |
      | loads microfrontends
      v
[Auth MF] [Documents MF] [Chat MF]
      |
      | HTTP REST
      v
[Express API]
      |
      | SQL
      v
[PostgreSQL]

[Express API]
      |
      | Vector Search
      v
[Qdrant]

[Express API]
      |
      | Embeddings / LLM
      v
[AI Provider]
```

Main architectural rule:

```text
The backend is the only component allowed to access PostgreSQL, Qdrant, and AI providers directly.
```

The frontend communicates only with the backend API.

---

## Documentation

The project documentation is maintained in both English and Spanish.

### English Documentation

- [00. Project Context](./docs/en/00-project-context.md)
- [01. Initial Architecture](./docs/en/01-initial-architecture.md)
- [02. Data Model](./docs/en/02-data-model.md)
- [03. Authentication](./docs/en/03-authentication.md)
- [04. Dockerization](./docs/en/04-dockerization.md)

### Documentación en Español

- [00. Contexto del proyecto](./docs/es/00-contexto-del-proyecto.md)
- [01. Arquitectura inicial](./docs/es/01-arquitectura-inicial.md)
- [02. Modelo de datos](./docs/es/02-modelo-de-datos.md)
- [03. Autenticación](./docs/es/03-autenticacion.md)
- [04. Dockerización](./docs/es/04-dockerizacion.md)

---

## Architecture Decision Records

Architecture Decision Records are stored in:

```text
docs/adr/
```

Current ADRs:

- [ADR 0001: Use Node.js and Express for the Backend](./docs/adr/0001-use-node-express-for-backend.md)
- [ADR 0002: Use Angular 21 with Microfrontends](./docs/adr/0002-use-angular-microfrontends.md)
- [ADR 0003: Use PostgreSQL and Qdrant for Data Persistence and Vector Search](./docs/adr/0003-use-postgresql-and-qdrant.md)
- [ADR 0004: Use JWT-Based Authentication](./docs/adr/0004-use-jwt-authentication.md)
- [ADR 0005: Use Docker Compose for Local Development](./docs/adr/0005-use-docker-compose-for-local-development.md)

---

## Planned Repository Structure

```text
synko/
├── apps/
│   ├── frontend/
│   │   ├── shell/
│   │   ├── auth/
│   │   ├── documents/
│   │   └── chat/
│   │
│   └── backend/
│
├── infrastructure/
│   ├── docker/
│   └── jenkins/
│
├── docs/
│   ├── adr/
│   ├── es/
│   └── en/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

This structure may evolve as the implementation progresses.

---

## Initial Roadmap

### Phase 1 — Documentation and Architecture

- [x] Define project context.
- [x] Define initial architecture.
- [x] Define backend stack decision.
- [x] Define frontend architecture decision.
- [x] Define PostgreSQL and Qdrant decision.
- [x] Define authentication strategy.
- [x] Define Dockerization strategy.
- [x] Create README.
- [ ] Create base repository structure.

### Phase 2 — Backend Foundation

- [ ] Create Express project with TypeScript.
- [ ] Configure linting and formatting.
- [ ] Create base folder structure.
- [ ] Add environment validation.
- [ ] Add healthcheck endpoint.
- [ ] Configure PostgreSQL connection.
- [ ] Configure Qdrant client.
- [ ] Add base error handling.

### Phase 3 — Authentication

- [ ] Implement user registration.
- [ ] Implement user login.
- [ ] Hash passwords.
- [ ] Generate JWT.
- [ ] Add authentication middleware.
- [ ] Protect private routes.
- [ ] Add authorization checks by `user_id`.

### Phase 4 — Document Management

- [ ] Upload PDF documents.
- [ ] Validate file type and size.
- [ ] Store document metadata.
- [ ] Extract text from PDFs.
- [ ] Split text into chunks.
- [ ] Store chunks in PostgreSQL.

### Phase 5 — Embeddings and Vector Search

- [ ] Generate embeddings from chunks.
- [ ] Store vectors in Qdrant.
- [ ] Store Qdrant point references in PostgreSQL.
- [ ] Implement semantic search.
- [ ] Filter vector search by `user_id`.

### Phase 6 — RAG Flow

- [ ] Create chat sessions.
- [ ] Store user questions.
- [ ] Retrieve relevant chunks.
- [ ] Build prompt context.
- [ ] Generate AI answer.
- [ ] Store assistant response.
- [ ] Return answer with sources.

### Phase 7 — Frontend

- [ ] Create Angular shell.
- [ ] Create authentication microfrontend.
- [ ] Create documents microfrontend.
- [ ] Create chat microfrontend.
- [ ] Add routing.
- [ ] Add guards.
- [ ] Add API services.
- [ ] Connect frontend to backend.

### Phase 8 — Infrastructure and CI/CD

- [ ] Create Docker Compose file.
- [ ] Add PostgreSQL container.
- [ ] Add Qdrant container.
- [ ] Add backend container.
- [ ] Add frontend container.
- [ ] Add Jenkinsfile.
- [ ] Run lint and tests through Jenkins.
- [ ] Build Docker images through Jenkins.

---

## Local Development

The local development environment will be based on Docker Compose.

Expected command:

```bash
docker compose up --build
```

At this stage, the implementation is not yet complete. Commands will be updated when the backend, frontend, and Docker files are created.

---

## Environment Variables

Synko will use environment variables for configuration.

A `.env.example` file will be provided with the required variables.

Example:

```env
NODE_ENV=development

BACKEND_PORT=3000
FRONTEND_URL=http://localhost:4200

JWT_SECRET=change_me
JWT_EXPIRES_IN=1h
SALT_ROUNDS=10

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=synko
POSTGRES_USER=synko_user
POSTGRES_PASSWORD=synko_password

QDRANT_URL=http://qdrant:6333
QDRANT_COLLECTION=synko_documents

AI_PROVIDER=placeholder
AI_API_KEY=change_me
EMBEDDING_MODEL=placeholder
CHAT_MODEL=placeholder
```

Real secrets must never be committed to the repository.

---

## Current Architectural Rules

- PostgreSQL is the main source of truth.
- Qdrant is used only for vector search.
- The backend is the only service allowed to access PostgreSQL and Qdrant.
- The frontend communicates only with the backend API.
- Every private resource must be filtered by authenticated `user_id`.
- Qdrant searches must include a `user_id` filter.
- JWT payloads must not contain sensitive data.
- Documentation must evolve together with implementation.
- Microfrontends must remain limited and controlled in the first version.

---

## License

License pending.

---

## Summary

Synko is a full stack and AI-oriented project designed to demonstrate professional software architecture, clean backend design, frontend modularity, infrastructure automation, and applied Generative AI.

The project will be built incrementally, prioritizing clarity, maintainability, documentation, and realistic technical decisions.