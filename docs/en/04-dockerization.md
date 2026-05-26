# 04. Dockerization — Synko

## 1. Document Objective

This document defines the initial Dockerization strategy for **Synko**.

The goal is to create a reproducible local development environment where any developer can start the main project services without manually installing all system dependencies.

The initial Dockerization strategy will cover:

- Node.js backend with Express.
- Angular 21 frontend.
- PostgreSQL.
- Qdrant.
- Internal network between services.
- Environment variables.
- Persistent volumes.
- Preparation for integrating Jenkins in a later phase.

---

## 2. Context

Synko is composed of several components that must work together:

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

Docker will allow these services to run consistently, avoiding differences between local environments.

The initial goal is not to create a complete production infrastructure, but a solid local development environment.

---

## 3. Initial Decision

Synko will use **Docker Compose** to orchestrate the main services in local development.

The first version of the environment will include:

| Service | Responsibility |
|---|---|
| frontend | Angular 21 application |
| backend | Node.js API with Express |
| postgres | Relational database |
| qdrant | Vector database |
| network | Internal communication between services |
| volumes | Local data persistence |

---

## 4. Initial Infrastructure Structure

The recommended structure will be:

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
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   └── postgres/
│   │       └── init.sql
│   │
│   └── jenkins/
│       └── Jenkinsfile
│
├── docs/
│   ├── es/
│   └── en/
│
├── docker-compose.yml
├── .env.example
├── README.md
└── .gitignore
```

This structure may be adjusted when the real project is created.

---

## 5. Initial Services

### Backend

The backend will be a Node.js service using Express and TypeScript.

Responsibilities:

- Expose the REST API.
- Connect to PostgreSQL.
- Connect to Qdrant.
- Manage authentication.
- Process documents.
- Orchestrate the RAG flow.

Recommended port:

```text
3000
```

### Frontend

The frontend will be an Angular 21 application.

Responsibilities:

- Display the user interface.
- Consume the backend API.
- Manage routes, guards, and microfrontends.
- Display documents, chat, and sources.

Recommended port:

```text
4200
```

### PostgreSQL

PostgreSQL will be the main source of truth for structured data.

Responsibilities:

- Users.
- Roles.
- Documents.
- Chunks.
- Chat sessions.
- Messages.

Recommended port:

```text
5432
```

### Qdrant

Qdrant will store embeddings and enable vector searches.

Responsibilities:

- Store vectors.
- Search similar chunks.
- Filter results by payload, especially `user_id`.

Recommended port:

```text
6333
```

---

## 6. Communication Between Services

Services will communicate through an internal Docker network.

Conceptual example:

```text
frontend -> backend
backend -> postgres
backend -> qdrant
```

The frontend must not communicate directly with PostgreSQL or Qdrant.

Main rule:

```text
The backend is the only service allowed to access PostgreSQL, Qdrant, and AI providers.
```

---

## 7. Environment Variables

Synko will use environment variables to avoid storing credentials or sensitive configuration inside the code.

Recommended file:

```text
.env.example
```

Initial content:

```env
# Application
NODE_ENV=development

# Backend
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:4200

# Auth
JWT_SECRET=change_me
JWT_EXPIRES_IN=1h
SALT_ROUNDS=10

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=synko
POSTGRES_USER=synko_user
POSTGRES_PASSWORD=synko_password

# Qdrant
QDRANT_URL=http://qdrant:6333
QDRANT_COLLECTION=synko_documents

# AI Provider
AI_PROVIDER=placeholder
AI_API_KEY=change_me
EMBEDDING_MODEL=placeholder
CHAT_MODEL=placeholder
```

Rules:

- `.env` must not be committed to the repository.
- `.env.example` must be committed.
- Real secrets must never be versioned.
- Each service should only read the variables it needs.

---

## 8. Initial Docker Compose

The initial `docker-compose.yml` file may have a structure similar to:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: synko-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: synko
      POSTGRES_USER: synko_user
      POSTGRES_PASSWORD: synko_password
    ports:
      - "5432:5432"
    volumes:
      - synko_postgres_data:/var/lib/postgresql/data
    networks:
      - synko_network

  qdrant:
    image: qdrant/qdrant:latest
    container_name: synko-qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"
    volumes:
      - synko_qdrant_data:/qdrant/storage
    networks:
      - synko_network

  backend:
    build:
      context: .
      dockerfile: infrastructure/docker/backend.Dockerfile
    container_name: synko-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - postgres
      - qdrant
    networks:
      - synko_network

  frontend:
    build:
      context: .
      dockerfile: infrastructure/docker/frontend.Dockerfile
    container_name: synko-frontend
    restart: unless-stopped
    ports:
      - "4200:4200"
    depends_on:
      - backend
    networks:
      - synko_network

volumes:
  synko_postgres_data:
  synko_qdrant_data:

networks:
  synko_network:
    driver: bridge
```

This file may evolve when the Angular and Express applications are actually created.

---

## 9. Backend Dockerfile

The backend will have its own Dockerfile.

Proposed location:

```text
infrastructure/docker/backend.Dockerfile
```

Initial example:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY apps/backend/package*.json ./

RUN npm install

COPY apps/backend .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

This Dockerfile is intended for development.

In production, a different strategy should be used:

- Pre-build TypeScript.
- Install only production dependencies.
- Use a non-root user.
- Use a more optimized image.
- Add a healthcheck.

---

## 10. Frontend Dockerfile

The frontend will have its own Dockerfile.

Proposed location:

```text
infrastructure/docker/frontend.Dockerfile
```

Initial example:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY apps/frontend/package*.json ./

RUN npm install

COPY apps/frontend .

EXPOSE 4200

CMD ["npm", "start", "--", "--host", "0.0.0.0"]
```

This Dockerfile is intended for development with the Angular dev server.

In production, the frontend should be built and served through Nginx or another static server.

---

## 11. Volumes

Synko will use volumes to persist local data.

Initial volumes:

```text
synko_postgres_data
synko_qdrant_data
```

### PostgreSQL

Will persist relational data:

```text
/var/lib/postgresql/data
```

### Qdrant

Will persist vector data:

```text
/qdrant/storage
```

This allows data to survive container restarts.

To completely clean the environment:

```bash
docker compose down -v
```

---

## 12. Networks

All services will be connected to an internal network:

```text
synko_network
```

Inside this network, services can communicate using the service name as host:

```text
postgres
qdrant
backend
frontend
```

Examples:

```text
POSTGRES_HOST=postgres
QDRANT_URL=http://qdrant:6333
```

---

## 13. Healthchecks

In a later phase, healthchecks may be added to verify that services are ready before they are used.

Example for PostgreSQL:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U synko_user -d synko"]
  interval: 10s
  timeout: 5s
  retries: 5
```

Example for Qdrant:

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:6333/healthz"]
  interval: 10s
  timeout: 5s
  retries: 5
```

Healthchecks are not mandatory for the first version, but they improve environment stability.

---

## 14. Startup Order

The conceptual startup order will be:

```text
1. postgres
2. qdrant
3. backend
4. frontend
```

`depends_on` helps define dependencies, but it does not guarantee that the database is fully ready to receive connections.

For this reason, the backend must handle connection retries or healthchecks will be added in a later phase.

---

## 15. Main Commands

Start environment:

```bash
docker compose up --build
```

Start in detached mode:

```bash
docker compose up -d --build
```

Stop services:

```bash
docker compose down
```

Stop and remove volumes:

```bash
docker compose down -v
```

View logs:

```bash
docker compose logs -f
```

View logs for one service:

```bash
docker compose logs -f backend
```

---

## 16. Local Development with Docker

During development, it will be useful to mount code volumes to avoid rebuilding the image after every change.

Future backend example:

```yaml
backend:
  volumes:
    - ./apps/backend:/app
    - /app/node_modules
```

Future frontend example:

```yaml
frontend:
  volumes:
    - ./apps/frontend:/app
    - /app/node_modules
```

This will allow hot reload for both backend and frontend.

The exact configuration will be adjusted when the real applications are created.

---

## 17. Jenkins

Jenkins will not be required for the first functional version of the local environment.

However, the project will be prepared to add it later.

Future service:

```text
jenkins
```

Future responsibilities:

- Install dependencies.
- Run linting.
- Run tests.
- Build backend.
- Build frontend.
- Build Docker images.
- Run integration pipeline.
- Prepare deployment.

Jenkins may be added to the `docker-compose.yml` or run as a separate service.

---

## 18. Risks

### Initial Complexity

Risk:

```text
Docker may add complexity before the backend and frontend exist.
```

Mitigation:

```text
Start by Dockerizing PostgreSQL and Qdrant first.
Add backend and frontend once their base projects exist.
```

### Differences Between Development and Production

Risk:

```text
Development Dockerfiles are not directly suitable for production.
```

Mitigation:

```text
Clearly document that the initial Dockerfiles are for development.
Create production Dockerfiles later.
```

### Services Not Ready

Risk:

```text
The backend may start before PostgreSQL or Qdrant are ready.
```

Mitigation:

```text
Add healthchecks.
Add backend connection retries.
```

### Secret Management

Risk:

```text
Real secrets may be committed to the repository.
```

Mitigation:

```text
Use .env.example.
Ignore .env in .gitignore.
Do not version real keys.
```

---

## 19. Pending Decisions

| Decision | Status |
|---|---|
| Docker Compose only for development or also staging | Pending |
| Separate Dockerfiles for production | Pending |
| Jenkins inside or outside Docker Compose | Pending |
| Use of Nginx for frontend in production | Pending |
| Use of MinIO for document storage | Pending |
| Use of Redis/BullMQ for workers | Pending |
| Mandatory healthchecks | Pending |
| Hot reload with volumes | Pending during implementation |

---

## 20. Summary

Synko will use Docker Compose to start a reproducible local development environment.

The first version will include PostgreSQL, Qdrant, backend, and frontend.

PostgreSQL will be the main relational storage, Qdrant will be the vector database, the backend will act as the orchestration layer, and the frontend will only consume the backend API.

The initial Dockerization strategy will prioritize simplicity and development productivity, leaving production optimization, advanced healthchecks, full Jenkins integration, workers, Redis, and object storage for later phases.