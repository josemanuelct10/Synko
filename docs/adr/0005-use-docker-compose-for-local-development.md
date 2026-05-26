# ADR 0005: Use Docker Compose for Local Development

## Status

Accepted

## Date

2026-05-26

## Context

Synko is composed of multiple services that need to work together during development:

- Angular frontend.
- Node.js backend with Express.
- PostgreSQL relational database.
- Qdrant vector database.

In later phases, additional services may be added:

- Jenkins.
- Redis.
- Worker service.
- MinIO or another object storage service.

Developing Synko without containerization would require each developer to manually install and configure several dependencies. This could lead to inconsistent environments, different local configurations, and more time spent debugging setup issues instead of developing features.

The project needs a simple and reproducible way to start the required services locally.

The main options considered were:

- Manual local installation.
- Docker Compose.
- Kubernetes.
- Using only hosted external services.
- Development containers.

## Decision

Synko will use **Docker Compose** as the main orchestration tool for local development.

The initial Docker Compose setup will include:

```text
frontend
backend
postgres
qdrant
```

The first version may start only with:

```text
postgres
qdrant
```

Then backend and frontend containers will be added once the base applications exist.

Docker Compose will be used to define:

- Services.
- Networks.
- Volumes.
- Environment variables.
- Local ports.
- Service dependencies.

## Reasons

### Reproducible local environment

Docker Compose allows the project to define the development environment as code.

Any developer should be able to clone the repository and start the main services using:

```bash
docker compose up --build
```

This reduces differences between local machines.

### Simple orchestration

Synko does not need Kubernetes for local development.

Docker Compose provides enough orchestration for the initial project needs:

- Start multiple services.
- Connect them through a shared network.
- Persist data with volumes.
- Expose local ports.
- Configure environment variables.

### Good fit for PostgreSQL and Qdrant

PostgreSQL and Qdrant are external infrastructure services that fit naturally into Docker containers.

Using Docker Compose avoids requiring local manual installation of these databases.

### Portfolio value

Docker Compose demonstrates the ability to work with multi-service environments, which is valuable for backend, full stack, and AI-oriented projects.

It also shows that Synko is designed as more than a simple frontend/backend project.

### Future CI/CD alignment

The same Docker concepts used locally can later support Jenkins pipelines:

- Building images.
- Running tests in containers.
- Starting integration services.
- Preparing deployment artifacts.

## Alternatives Considered

### Manual Local Installation

Installing PostgreSQL, Qdrant, Node.js dependencies, and other services manually would be possible.

However, it increases setup friction and makes the environment harder to reproduce.

This option was rejected for the main workflow.

### Kubernetes

Kubernetes would provide powerful orchestration but is unnecessary for the initial phase.

It would add too much complexity before the project has a stable application architecture.

Kubernetes may be considered in the future only if Synko evolves toward a more production-oriented deployment architecture.

### Hosted External Services

Using managed PostgreSQL, hosted Qdrant, or cloud-based services could reduce local infrastructure.

However, this would make local development dependent on external accounts, network access, and possibly cost.

For the initial phase, local containers are preferable.

### Development Containers

Development containers could provide a fully containerized IDE environment.

This may be useful later, but Docker Compose is simpler and more directly aligned with the current needs.

## Consequences

### Positive Consequences

- Easier local setup.
- More consistent development environment.
- Clear service boundaries.
- Persistent local data through volumes.
- Easier onboarding for future contributors.
- Better preparation for CI/CD.
- Realistic multi-service architecture.

### Negative Consequences

- Docker adds initial complexity.
- Developers need Docker installed.
- Container startup may be slower than running services directly.
- File watching and hot reload may require volume configuration.
- `depends_on` does not guarantee service readiness.
- Development and production Dockerfiles may differ.

## Mitigation

To reduce complexity, Synko will follow these rules:

- Start with PostgreSQL and Qdrant first.
- Add backend and frontend containers after base projects exist.
- Keep the first Compose file simple.
- Use named volumes for database persistence.
- Use a dedicated Docker network.
- Store configuration in `.env`.
- Commit `.env.example`, never `.env`.
- Add healthchecks later if service readiness becomes an issue.
- Document common Docker commands.

## Initial Services

The expected initial services are:

| Service | Port | Responsibility |
|---|---:|---|
| frontend | 4200 | Angular application |
| backend | 3000 | Express API |
| postgres | 5432 | Relational database |
| qdrant | 6333 | Vector database |

## Future Services

Potential future services:

| Service | Responsibility |
|---|---|
| jenkins | CI/CD automation |
| redis | Queue backend and cache |
| worker | Asynchronous document processing |
| minio | Local object storage compatible with S3 |

These services will only be added when there is a clear need.

## Security Considerations

Docker Compose will be used for local development, not as the final production security model.

Rules:

- Do not commit real secrets.
- Use `.env.example` for documented configuration.
- Keep local passwords simple but clearly marked as development-only.
- Use stronger secrets in real environments.
- Avoid exposing unnecessary ports.
- Ensure the frontend never connects directly to PostgreSQL or Qdrant.

## Future Considerations

Future improvements may include:

- Healthchecks for PostgreSQL and Qdrant.
- Backend startup retry logic.
- Development volumes for hot reload.
- Separate Compose files for development and testing.
- Production Dockerfiles.
- Nginx for serving frontend builds.
- Jenkins integration.
- Redis and workers for asynchronous processing.
- MinIO for document storage.

## Final Decision

Synko will use **Docker Compose for local development**.

This decision provides a simple, reproducible, and realistic multi-service environment without introducing unnecessary orchestration complexity too early.

The setup will start small and evolve as the project requires more services.