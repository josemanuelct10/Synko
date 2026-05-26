# 01. Initial Architecture — Synko

## 1. Document Objective

This document defines the initial architecture of **Synko**, an intelligent document management platform based on Generative AI, semantic search, and document processing.

The goal is not to close every technical decision from the beginning, but to establish a clear foundation to build the project in an organized, scalable, and maintainable way.

This document will serve as a reference to:

- Define the main services of the system.
- Separate responsibilities between frontend, backend, databases, and infrastructure.
- Avoid a disorganized structure from the early stages.
- Document initial technical decisions.
- Identify architectural risks before starting the implementation.

---

## 2. Architecture Overview

Synko will be built as a web application composed of several main blocks:

- **Angular 21 frontend**, organized through a microfrontend-based architecture.
- **Node.js backend with Express**, structured by modules and layers.
- **PostgreSQL**, as the main relational database.
- **Qdrant**, as the vector database used to store embeddings.
- **Docker**, to provide a reproducible local environment.
- **Jenkins**, to automate integration and deployment processes.
- **AI provider**, responsible for generating embeddings and natural language answers.

The architecture will aim to clearly separate system responsibilities from the beginning.

The frontend will handle the user experience.  
The backend will act as the business logic and orchestration layer.  
PostgreSQL will store structured data.  
Qdrant will store and search vector representations.  
The AI provider will generate embeddings and answers using language models.

---

## 3. Main Services

The first version of Synko will be composed of the following services:

| Service | Main Responsibility |
|---|---|
| Frontend Shell | Main Angular container application |
| Auth Microfrontend | Login, registration, and session management |
| Documents Microfrontend | Management of user-uploaded documents |
| Chat Microfrontend | Interface for intelligent document queries |
| Backend API | Business logic, authentication, documents, RAG, and communication with external services |
| PostgreSQL | Relational persistence for users, documents, and metadata |
| Qdrant | Embedding storage and vector search |
| AI Provider | Embedding generation and answer generation |
| Jenkins | Pipeline automation |
| Docker Compose | Local environment orchestration |

---

## 4. Initial Logical Diagram

The initial communication between components will be as follows:

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

The backend will be the only component authorized to communicate directly with PostgreSQL, Qdrant, and the AI provider.

The frontend will never access the relational database, the vector database, or private AI APIs directly.

---

## 5. Frontend Architecture

The frontend will be developed with **Angular 21** and a microfrontend-oriented architecture.

The initial idea is to divide the application into several functional domains:

```text
apps/frontend/
├── shell/
├── auth/
├── documents/
└── chat/
```

### Shell

The `shell` application will act as the main container.

Its responsibilities will be:

- Define the general application layout.
- Manage the main navigation.
- Load the microfrontends.
- Share common configuration.
- Manage global elements such as navbar, sidebar, or session state.

### Auth Microfrontend

The authentication microfrontend will manage:

- User registration.
- User login.
- User logout.
- Basic user session state recovery.
- Public routes related to authentication.

### Documents Microfrontend

The documents microfrontend will manage:

- Document upload.
- Document listing.
- Metadata visualization.
- Document deletion.
- Document processing status.

### Chat Microfrontend

The chat microfrontend will manage:

- Question input form.
- Document or collection selection.
- Answer visualization.
- Display of the sources used.
- Basic query history.

---

## 6. Microfrontend Strategy

Although Synko will use a microfrontend-based architecture, excessive fragmentation will be avoided in the early phases.

The strategy will be to start with a minimal and controlled separation:

```text
shell
auth
documents
chat
```

Additional microfrontends will not be created until there is a clear reason related to domain separation, scalability, or functional independence.

The following microfrontends are outside the initial phase:

- Admin.
- Billing.
- Teams.
- Notifications.
- Analytics.

The initial priority will be to have a modular and understandable application, not an unnecessarily complex architecture.

---

## 7. Backend Architecture

The backend will be developed with **Node.js**, **Express**, and **TypeScript**.

A flat structure based only on routes and controllers will not be used. Instead, the backend will follow a module and layer-based organization to separate responsibilities.

Initial proposed structure:

```text
apps/backend/src/
├── config/
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.schemas.ts
│   │   └── auth.types.ts
│   │
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

---

## 8. Backend Layers

The backend will be divided into several main layers.

### Routes

Responsible for defining the HTTP endpoints.

Example:

```text
POST /auth/register
POST /auth/login
GET /documents
POST /documents
POST /chat/query
```

Routes must not contain business logic.

### Controllers

Responsible for receiving the request, performing the initial input validation, and delegating the operation to the corresponding service.

Controllers must not access the database directly.

### Services

Responsible for business logic.

This layer will handle operations such as:

- Registering a user.
- Validating credentials.
- Processing documents.
- Generating embeddings.
- Executing the RAG flow.
- Coordinating calls to PostgreSQL, Qdrant, and the AI provider.

### Repositories

Responsible for persistent data access.

Repositories will encapsulate communication with PostgreSQL and prevent SQL or ORM logic from being mixed with business logic.

### Infrastructure

Responsible for external technical integrations:

- PostgreSQL.
- Qdrant.
- File system or object storage.
- AI provider.
- External client configuration.

### Shared

Will contain reusable elements:

- Middlewares.
- Custom errors.
- Utilities.
- Shared types.
- Common validators.

---

## 9. Relational Database: PostgreSQL

PostgreSQL will be the main database for Synko structured data.

It will be used to store:

- Users.
- Roles.
- Documents.
- Metadata.
- Chunks.
- Query history.
- Relationships between users and documents.

Initial entity examples:

```text
users
documents
document_chunks
chat_sessions
chat_messages
```

PostgreSQL will not store vectors directly in the first version, because that responsibility will belong to Qdrant.

The relationship between PostgreSQL and Qdrant will be handled through shared identifiers, such as:

```text
document_id
chunk_id
user_id
```

---

## 10. Vector Database: Qdrant

Qdrant will be used as the vector database to store embeddings generated from document fragments.

Each vector stored in Qdrant will represent a textual fragment of a document.

Each vector point must include minimum metadata:

```json
{
  "user_id": "uuid",
  "document_id": "uuid",
  "chunk_id": "uuid",
  "source": "document-name.pdf",
  "page": 3
}
```

This metadata will make it possible to preserve traceability between a generated answer and the original document content.

Qdrant will mainly be used in the RAG flow to retrieve the most relevant fragments based on a user question.

---

## 11. Authentication Flow

The initial authentication flow will be:

```text
1. The user registers from the frontend.
2. The frontend sends the data to the backend.
3. The backend validates the information.
4. The backend hashes the password.
5. The user is stored in PostgreSQL.
6. The user logs in.
7. The backend validates the credentials.
8. The backend generates an authentication token.
9. The frontend stores the session state.
10. Private routes require a valid token.
```

Initially, token-based authentication will be used.

The decision between storing the token in memory, localStorage, or HTTP-only cookies will be documented in more detail in the specific authentication document.

---

## 12. Document Management Flow

The initial document management flow will be:

```text
1. The authenticated user uploads a PDF.
2. The frontend sends the file to the backend.
3. The backend validates file type and size.
4. The backend stores the file or its reference.
5. The backend stores the metadata in PostgreSQL.
6. The backend extracts the text from the PDF.
7. The text is split into chunks.
8. Each chunk is stored in PostgreSQL.
9. Embeddings are generated for each chunk.
10. The embeddings are stored in Qdrant.
11. The document is marked as processed.
```

In the first version, processing may be synchronous or semi-synchronous to simplify development.

In later phases, moving the processing to an asynchronous worker queue system will be evaluated.

---

## 13. Initial RAG Flow

The RAG flow will be the intelligent core of Synko.

The initial process will be:

```text
1. The user writes a question.
2. The frontend sends the question to the backend.
3. The backend validates the user, permissions, and available documents.
4. The backend generates an embedding from the question.
5. The backend queries Qdrant using that embedding.
6. Qdrant returns the most similar chunks.
7. The backend retrieves additional metadata from PostgreSQL if needed.
8. The backend builds a prompt with the question and retrieved fragments.
9. The AI provider generates an answer.
10. The backend returns the answer and sources to the frontend.
11. The frontend displays the answer to the user.
```

The backend must preserve traceability of the sources used to generate each answer.

An answer without sources will not be considered valid for the initial project goal.

---

## 14. Local Infrastructure with Docker

The local environment will be started using Docker Compose.

Initial services:

```text
frontend
backend
postgres
qdrant
```

Additional services may be added later:

```text
jenkins
redis
worker
minio
```

The first version of the `docker-compose.yml` must allow:

- Starting PostgreSQL.
- Starting Qdrant.
- Starting the backend.
- Starting the frontend.
- Configuring environment variables.
- Sharing an internal network between services.

The goal is for any developer to clone the repository and start the environment without manually installing all system dependencies.

---

## 15. Automation with Jenkins

Jenkins will be used to practice pipeline automation.

In the initial phase, the pipeline may include:

```text
1. Clone repository.
2. Install dependencies.
3. Run linting.
4. Run tests.
5. Build frontend.
6. Build backend.
7. Build Docker images.
```

In later phases, it may be extended with:

- Automatic deployment.
- Image versioning.
- Static analysis.
- Basic security scanning.
- Artifact publishing.

Jenkins will not be required for the first functional execution of Synko, but it will be part of the technical maturity criteria of the project.

---

## 16. Initial Repository Structure

The proposed initial repository structure will be:

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
│   ├── es/
│   └── en/
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

This structure may change if a more formal monorepo approach is adopted later using tools such as Nx, npm workspaces, or pnpm workspaces.

The final decision will be documented when the real project structure is created.

---

## 17. Initial Technical Decisions

| Decision | Reason |
|---|---|
| Angular 21 | Enables modern frontend development and advanced architecture |
| Microfrontends | Helps practice separation by functional domains |
| Node.js + Express | Flexible backend stack, familiar and suitable for REST APIs |
| TypeScript | Improves maintainability and type safety |
| PostgreSQL | Robust relational database |
| Qdrant | Specialized vector database |
| Docker | Reproducible environment |
| Jenkins | Automation and CI/CD practice |
| RAG | Enables Generative AI integration with private data |
| Bilingual documentation | Improves the professional presentation of the project |

---

## 18. Architectural Risks

### Excessive Frontend Complexity

Microfrontends may introduce unnecessary complexity if applied too early.

Mitigation:

- Start with a small number of microfrontends.
- Keep responsibilities clear.
- Avoid duplicating shared logic.
- Document contracts between the shell and microfrontends.

### Overly Coupled Backend

There is a risk of mixing routes, business logic, data access, and external integrations.

Mitigation:

- Separate routes, controllers, services, repositories, and infrastructure.
- Use interfaces where it makes sense.
- Keep modules independent.

### Heavy Document Processing

PDF processing, chunk generation, and embeddings can become expensive.

Mitigation:

- Limit file size initially.
- Process documents in a controlled way.
- Evaluate workers and queues in future phases.

### Dependency on a Specific AI Provider

The system could become coupled to a single embedding or generation provider.

Mitigation:

- Create an internal `ai` layer.
- Avoid direct provider calls from domain services.
- Design internal contracts for embeddings and answer generation.

### Duplication Between PostgreSQL and Qdrant

There will be related information between both databases.

Mitigation:

- Keep PostgreSQL as the main source of truth.
- Use Qdrant only for vector search.
- Store shared identifiers in vector metadata.

---

## 19. Expected Evolution

The initial architecture will evolve in phases:

1. Create the base repository structure.
2. Create the Express backend with TypeScript.
3. Create the Angular shell frontend.
4. Configure Docker Compose.
5. Add PostgreSQL.
6. Add Qdrant.
7. Implement authentication.
8. Implement document upload.
9. Implement PDF processing.
10. Implement embeddings.
11. Implement semantic search.
12. Implement the RAG flow.
13. Add functional microfrontends.
14. Add Jenkins.
15. Add testing.
16. Prepare final documentation for portfolio usage.

---

## 20. Summary

Synko’s initial architecture is based on a clear separation between frontend, backend, relational persistence, vector search, automation, and artificial intelligence.

The system will be built incrementally, avoiding complexity before there is a real need for it.

The priority will be to create a clean, documented, and maintainable technical foundation that allows Synko to evolve from a first functional version into a more complete platform.