# 02. Data Model — Synko

## 1. Document Objective

This document defines the initial data model for **Synko**.

The goal is to establish a first structure to represent users, documents, text chunks, chat sessions, messages, and the relationship between PostgreSQL and Qdrant.

This model is not intended to be final from the beginning. The intention is to have a clear foundation that can evolve as the project develops.

---

## 2. General Approach

Synko will use two main storage systems:

| System | Responsibility |
|---|---|
| PostgreSQL | Structured data and main source of truth |
| Qdrant | Vector storage and embedding search |

PostgreSQL will store persistent domain information:

- Users.
- Roles.
- Documents.
- Metadata.
- Document chunks.
- Chat sessions.
- Messages.
- Processing status.

Qdrant will store vectors generated from document chunks.

The relationship between PostgreSQL and Qdrant will be maintained through shared identifiers.

---

## 3. Main Principle

PostgreSQL will be the **main source of truth** for the system.

Qdrant will not replace PostgreSQL. Qdrant will only be used for semantic search and vector retrieval.

This means that:

- Users live in PostgreSQL.
- Documents live in PostgreSQL.
- Chunks live in PostgreSQL.
- Main metadata lives in PostgreSQL.
- Embeddings live in Qdrant.
- Qdrant will contain minimum metadata to relate each vector back to PostgreSQL.

---

## 4. Initial Entities

The initial model will be composed of the following entities:

```text
users
roles
user_roles
documents
document_chunks
chat_sessions
chat_messages
```

In an initial phase, the role system may be simplified if advanced permissions are not needed from the start.

---

## 5. `users` Table

Represents registered users in Synko.

### Initial Fields

| Field | Type | Description |
|---|---|---|
| id | UUID | Unique user identifier |
| email | VARCHAR | Unique user email |
| password_hash | VARCHAR | Hashed password |
| name | VARCHAR | User display name |
| status | VARCHAR | User status |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update date |

### Possible Statuses

```text
active
disabled
pending_verification
```

### Notes

- The `email` field must be unique.
- Passwords must never be stored in plain text.
- `password_hash` will be generated using a secure hashing function.
- Future phases may add email verification, password recovery, or external authentication.

---

## 6. `roles` Table

Represents the roles available in the system.

### Initial Fields

| Field | Type | Description |
|---|---|---|
| id | UUID | Unique role identifier |
| name | VARCHAR | Role name |
| description | TEXT | Role description |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update date |

### Initial Roles

```text
user
admin
```

### Notes

In the first version, the `user` role will be enough for most features.

The `admin` role is reserved for future administrative capabilities.

---

## 7. `user_roles` Table

Relates users with roles.

### Initial Fields

| Field | Type | Description |
|---|---|---|
| user_id | UUID | User identifier |
| role_id | UUID | Role identifier |
| created_at | TIMESTAMP | Assignment date |

### Suggested Primary Key

```text
(user_id, role_id)
```

### Notes

This table allows a user to have multiple roles if the system needs it in the future.

If the project remains simple, this could be replaced by a `role` field inside `users`, but the intermediate table provides more flexibility.

---

## 8. `documents` Table

Represents documents uploaded by users.

### Initial Fields

| Field | Type | Description |
|---|---|---|
| id | UUID | Unique document identifier |
| user_id | UUID | Document owner |
| original_name | VARCHAR | Original file name |
| stored_name | VARCHAR | Internal file name |
| mime_type | VARCHAR | MIME type |
| size_bytes | BIGINT | File size |
| storage_path | TEXT | Path or reference where the file is stored |
| status | VARCHAR | Processing status |
| error_message | TEXT | Error message if processing fails |
| created_at | TIMESTAMP | Upload date |
| updated_at | TIMESTAMP | Last update date |
| processed_at | TIMESTAMP | Processing completion date |

### Possible Statuses

```text
uploaded
processing
processed
failed
deleted
```

### Notes

- `user_id` allows documents to be isolated by user.
- `status` will be key to know whether the document can be used in RAG queries.
- `storage_path` may initially point to local storage.
- In future phases, `storage_path` could point to MinIO, S3, or another object storage system.

---

## 9. `document_chunks` Table

Represents the text fragments extracted from each document.

### Initial Fields

| Field | Type | Description |
|---|---|---|
| id | UUID | Unique chunk identifier |
| document_id | UUID | Parent document |
| user_id | UUID | Owner user |
| chunk_index | INTEGER | Position of the chunk inside the document |
| content | TEXT | Text fragment |
| page_number | INTEGER | Approximate page number |
| token_count | INTEGER | Approximate number of tokens |
| qdrant_point_id | UUID | Vector identifier in Qdrant |
| created_at | TIMESTAMP | Creation date |

### Notes

- Each chunk must be associated with a document.
- `chunk_index` allows reconstructing the original order.
- `qdrant_point_id` connects PostgreSQL with Qdrant.
- `content` is stored in PostgreSQL for traceability, auditing, and source visualization.
- Even though the vector is stored in Qdrant, the original text must remain in PostgreSQL.

---

## 10. `chat_sessions` Table

Represents a conversation or question session created by the user.

### Initial Fields

| Field | Type | Description |
|---|---|---|
| id | UUID | Unique session identifier |
| user_id | UUID | Owner user |
| title | VARCHAR | Optional conversation title |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update date |

### Notes

A session may contain multiple messages.

The title may be generated manually or automatically from the user's first question.

---

## 11. `chat_messages` Table

Represents messages inside a chat session.

### Initial Fields

| Field | Type | Description |
|---|---|---|
| id | UUID | Unique message identifier |
| session_id | UUID | Parent session |
| user_id | UUID | Owner user |
| role | VARCHAR | Message role |
| content | TEXT | Message content |
| sources | JSONB | Sources used to generate an answer |
| created_at | TIMESTAMP | Creation date |

### Possible Roles

```text
user
assistant
system
```

### `sources` Example

```json
[
  {
    "document_id": "uuid",
    "chunk_id": "uuid",
    "document_name": "manual.pdf",
    "page_number": 4,
    "score": 0.87
  }
]
```

### Notes

- User messages will have `role = user`.
- AI-generated answers will have `role = assistant`.
- The `sources` field will be especially important for RAG answers.
- An answer without sources will not be considered valid in the first system version.

---

## 12. Relationship Between PostgreSQL and Qdrant

PostgreSQL will store structured data and textual content.

Qdrant will store embeddings.

The relationship will be handled through shared identifiers.

### In PostgreSQL

Each `document_chunks` record will contain:

```text
id
document_id
user_id
qdrant_point_id
content
page_number
```

### In Qdrant

Each vector point will have a structure similar to:

```json
{
  "id": "qdrant_point_id",
  "vector": [0.012, 0.532, -0.221],
  "payload": {
    "user_id": "uuid",
    "document_id": "uuid",
    "chunk_id": "uuid",
    "source": "manual.pdf",
    "page_number": 4
  }
}
```

### Main Rule

The PostgreSQL `chunk_id` must appear in the Qdrant payload.

This allows the backend to retrieve complete information from PostgreSQL after a vector search.

---

## 13. Document Persistence Flow

The initial flow will be:

```text
1. The user uploads a document.
2. A record is created in `documents` with status `uploaded`.
3. The backend validates the file.
4. The status changes to `processing`.
5. The backend extracts text from the PDF.
6. The text is split into chunks.
7. Each chunk is stored in `document_chunks`.
8. An embedding is generated for each chunk.
9. Each embedding is stored in Qdrant.
10. `qdrant_point_id` is updated in each chunk.
11. The document changes to status `processed`.
```

If an error occurs:

```text
1. The document changes to status `failed`.
2. The reason is stored in `error_message`.
3. The document is not allowed to be used in RAG queries.
```

---

## 14. RAG Query Flow

The query flow will be:

```text
1. The user sends a question.
2. A `chat_session` is created or reused.
3. The question is stored as a `chat_message` with role `user`.
4. The backend generates an embedding from the question.
5. The backend queries Qdrant filtering by `user_id`.
6. Qdrant returns the most similar chunks.
7. The backend retrieves complete information from `document_chunks` and `documents`.
8. The backend builds the context for the language model.
9. The model generates an answer.
10. The answer is stored as a `chat_message` with role `assistant`.
11. The sources are stored in the `sources` field.
12. The frontend displays the answer and sources.
```

---

## 15. User Isolation

Synko must guarantee that one user cannot query documents belonging to another user.

This isolation will be applied at three levels:

### PostgreSQL

All queries to documents, chunks, and sessions must filter by `user_id`.

### Qdrant

Vector searches must include a `user_id` filter in the payload.

### Backend

The backend will validate that the authenticated user only accesses resources that belong to them.

---

## 16. Initial Indexes

### `users`

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

### `documents`

```sql
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
```

### `document_chunks`

```sql
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_user_id ON document_chunks(user_id);
CREATE INDEX idx_document_chunks_qdrant_point_id ON document_chunks(qdrant_point_id);
```

### `chat_sessions`

```sql
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
```

### `chat_messages`

```sql
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
```

---

## 17. Deletion Considerations

Document deletion must be handled carefully because it affects both PostgreSQL and Qdrant.

In the first version, soft deletion will be used through the status:

```text
deleted
```

This prevents accidental data deletion during development.

When a document is marked as deleted:

- It will not appear in the normal listing.
- It cannot be used in RAG queries.
- Its chunks should not be retrieved.
- In future phases, it may be physically deleted from PostgreSQL, storage, and Qdrant.

---

## 18. Scalability Considerations

The initial model will work for a first version, but there are several points to monitor if volume grows:

- Many documents per user.
- Very large documents.
- Thousands of chunks per document.
- Cost of storing full text in PostgreSQL.
- Embedding cost.
- Processing time.
- Qdrant collection size.
- Performance of user-filtered searches.

Possible future improvements:

- Asynchronous processing with workers.
- Queues with Redis/BullMQ.
- File storage with MinIO or S3.
- Advanced pagination.
- Document archiving.
- Separation by collections or workspaces.
- Retention policies.
- Partitioning if volume grows significantly.

---

## 19. Pending Decisions

Some decisions will be documented later:

| Decision | Future Document |
|---|---|
| ORM or query builder | Specific ADR |
| Authentication strategy | Authentication document |
| Local storage vs object storage | Infrastructure document |
| Chunking strategy | Processing document |
| Embedding model | Embeddings document |
| Exact Qdrant collection structure | Qdrant document |
| Synchronous or asynchronous processing | Specific ADR |

---

## 20. Summary

Synko’s initial data model clearly separates structured data from vector search.

PostgreSQL will be the main source of truth and will store users, documents, chunks, and conversations.

Qdrant will store embeddings and enable efficient semantic search.

The relationship between both systems will be maintained through shared identifiers, especially `chunk_id`, `document_id`, `user_id`, and `qdrant_point_id`.

This design allows building a first functional version without closing the door to future improvements in scalability, asynchronous processing, and advanced storage.