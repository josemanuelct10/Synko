# ADR 0003: Use PostgreSQL and Qdrant for Data Persistence and Vector Search

## Status

Accepted

## Date

2026-05-26

## Context

Synko needs to store two different types of data.

The first type is structured business data, such as users, roles, documents, document chunks, chat sessions, chat messages, processing states, and metadata.

The second type is vector data generated from document chunks. These vectors are used to perform semantic search during the RAG flow.

These two types of data have different requirements:

- Structured data requires consistency, relationships, constraints, indexes, and transactional behavior.
- Vector data requires efficient similarity search and metadata filtering.
- The system must preserve traceability between generated answers and original document sources.
- The backend must be able to recover full information about each retrieved chunk after a vector search.

The main options considered were:

- PostgreSQL only.
- PostgreSQL with pgvector.
- PostgreSQL plus Qdrant.
- MongoDB plus Qdrant.
- Qdrant only.

## Decision

Synko will use **PostgreSQL** as the main relational database and **Qdrant** as the vector database.

PostgreSQL will be the main source of truth.

Qdrant will be used only for vector storage and semantic search.

The relationship between both systems will be maintained through shared identifiers:

```text
user_id
document_id
chunk_id
qdrant_point_id
```

PostgreSQL will store:

```text
users
roles
user_roles
documents
document_chunks
chat_sessions
chat_messages
```

Qdrant will store vector points generated from document chunks.

Each Qdrant point will include metadata similar to:

```json
{
  "user_id": "uuid",
  "document_id": "uuid",
  "chunk_id": "uuid",
  "source": "document-name.pdf",
  "page_number": 3
}
```

## Reasons

### Clear separation of responsibilities

PostgreSQL is better suited for structured business data, relationships, constraints, and transactional operations.

Qdrant is specialized in vector search and similarity retrieval.

Using both systems allows each one to focus on what it does best.

### PostgreSQL as source of truth

Synko needs a reliable source of truth for users, documents, chunks, and conversations.

PostgreSQL provides:

- Relational integrity.
- Foreign keys.
- Transactions.
- Indexes.
- Strong consistency.
- Mature tooling.
- Clear data modeling.

This makes PostgreSQL a good foundation for the core domain model.

### Qdrant for vector search

Qdrant is designed specifically for vector similarity search.

It provides:

- Efficient nearest-neighbor search.
- Payload filtering.
- Collections.
- Metadata-based filtering.
- Good fit for RAG systems.
- Clear API for vector operations.

This makes Qdrant a strong fit for retrieving relevant document chunks based on semantic similarity.

### Better RAG traceability

By storing chunks in PostgreSQL and vectors in Qdrant, Synko can retrieve the most similar chunks from Qdrant and then use PostgreSQL to recover full context, document metadata, and user ownership.

This improves traceability and avoids relying on Qdrant as the only source of domain information.

### Scalability path

Separating structured data and vector data allows the system to scale each part independently in the future.

For example:

- PostgreSQL can be optimized for relational queries.
- Qdrant can be optimized for vector search.
- Document processing can scale separately.
- Qdrant collections may evolve independently from PostgreSQL schema changes.

## Alternatives Considered

### PostgreSQL Only

Using only PostgreSQL would simplify the architecture.

However, PostgreSQL alone does not provide specialized vector search unless extensions such as pgvector are used.

This option was rejected because Synko aims to practice a dedicated vector database and keep vector search responsibilities separated.

### PostgreSQL with pgvector

PostgreSQL with pgvector is a strong alternative.

It would reduce infrastructure complexity by keeping relational and vector data in the same database.

However, Qdrant was selected because the project aims to practice a dedicated vector database and better separate semantic search from relational persistence.

pgvector remains a possible future alternative if the project needs to simplify deployment.

### MongoDB plus Qdrant

MongoDB could store documents and metadata flexibly.

However, Synko has clear relational needs:

- Users own documents.
- Documents have chunks.
- Sessions have messages.
- Roles may be assigned to users.
- Queries need strong ownership validation.

PostgreSQL better fits these relational requirements.

### Qdrant Only

Using only Qdrant was rejected because Qdrant is not intended to be the main source of truth for application data.

It should not store all domain data, authentication data, sessions, and business relationships.

## Consequences

### Positive Consequences

- Clear separation between relational data and vector data.
- Strong relational model with PostgreSQL.
- Specialized vector search with Qdrant.
- Better traceability between answers and source documents.
- More realistic architecture for a RAG-based application.
- Good learning value for backend, database, and AI system design.

### Negative Consequences

- More infrastructure complexity.
- Two storage systems must be kept consistent.
- Deletes and updates must be coordinated between PostgreSQL and Qdrant.
- Local development requires running both PostgreSQL and Qdrant.
- More error handling is needed when one system succeeds and the other fails.

## Mitigation

To reduce consistency issues, Synko will follow these rules:

- PostgreSQL remains the source of truth.
- Qdrant stores only vectors and minimal metadata.
- Every Qdrant point must include `chunk_id`, `document_id`, and `user_id`.
- Every `document_chunks` record may store the corresponding `qdrant_point_id`.
- RAG searches must filter by `user_id`.
- Deleted documents must not be used in Qdrant searches.
- Failed document processing must update the document status in PostgreSQL.
- Physical deletion from Qdrant may be handled after soft deletion in PostgreSQL.

In future phases, document processing may be moved to asynchronous workers to better handle partial failures.

## Future Considerations

Future improvements may include:

- Moving file storage to MinIO or S3.
- Adding Redis and BullMQ for asynchronous processing.
- Creating separate Qdrant collections per environment.
- Evaluating pgvector if infrastructure needs to be simplified.
- Adding cleanup jobs to remove orphaned vectors.
- Adding workspaces or collections to group documents.
- Adding audit logs for document processing.
- Adding database migrations and seed scripts.

## Final Decision

Synko will use **PostgreSQL as the main source of truth** and **Qdrant as the vector search database**.

This decision provides a clean separation between structured persistence and semantic search, while supporting the technical goals of a RAG-based document management platform.