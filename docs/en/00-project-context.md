# 00. Project Context — Synko

## 1. General Description

**Synko** is an intelligent document management web platform designed to allow users to upload, organize, and query documents using artificial intelligence.

The system will store documents, process their content, generate vector representations, and allow users to ask natural language questions about the information contained in those documents.

Synko combines a modern web architecture with a modular backend, a relational database, and a specialized vector database.

The main goal of the project is not only to build a functional application, but also to develop a technically solid, scalable, and well-documented solution that simulates a professional software development environment.

---

## 2. Problem Statement

In many personal and business environments, large amounts of documentation are scattered across different files: PDFs, manuals, contracts, reports, technical documentation, internal procedures, invoices, or administrative documents.

Accessing information inside these documents usually presents several problems:

- Documents are often poorly organized.
- Finding specific information across multiple files is slow.
- Users need to manually open, read, and compare documents.
- There is no simple way to ask direct questions about document content.
- Traditional keyword-based search does not understand context.

Synko aims to solve this problem by allowing users to upload documents and ask questions such as:

- “What is the summary of this contract?”
- “What payment terms appear in these documents?”
- “What steps does the manual describe to configure the system?”
- “Which documents mention a specific clause?”
- “Give me a comparison between these reports.”

---

## 3. Project Objective

The goal of Synko is to build a platform that allows users to:

1. Upload and store documents.
2. Extract and process textual content.
3. Split content into manageable chunks.
4. Generate embeddings from those chunks.
5. Store embeddings in a vector database.
6. Retrieve relevant chunks based on a user question.
7. Generate answers using a language model.
8. Show answers with traceability to the original documents.

Additionally, the project will be used to practice and demonstrate knowledge in:

- Backend architecture with Node.js and Express.
- Advanced frontend development with Angular 21.
- Microfrontend-based frontend architecture.
- PostgreSQL as the relational database.
- Qdrant as the vector database.
- Docker for reproducible environments.
- Jenkins for deployment automation.
- Technical documentation best practices.
- Modular and maintainable software design.
- Integration of Generative AI into a real application.

---

## 4. Initial Scope

In its first version, Synko will include the following main features:

### User Management

- User registration.
- User login.
- Token-based authentication.
- Protected private routes.
- Basic session management.

### Document Management

- PDF document upload.
- List of uploaded documents.
- Document metadata visualization.
- Document deletion.
- File type and size validation.

### Document Processing

- Text extraction from PDFs.
- Text splitting into chunks.
- Embedding generation.
- Vector storage in Qdrant.
- Association between users, documents, and chunks.

### Intelligent Querying

- Question form for querying documents.
- Semantic search in Qdrant.
- Retrieval of relevant document chunks.
- Answer generation using a language model.
- Display of the sources used to build the answer.

### Infrastructure

- Local environment with Docker Compose.
- Backend service.
- Frontend service.
- PostgreSQL service.
- Qdrant service.
- Initial Jenkins pipeline.

---

## 5. Out of Initial Scope

To keep the project controlled, some features will remain outside the first version:

- Collaborative document editing.
- Image processing using OCR.
- Advanced support for Word, Excel, or PowerPoint files.
- Complete team-based permission system.
- Billing or subscription plans.
- Advanced cloud deployment.
- Training custom models.
- Fine-tuning language models.
- Mobile application.
- Real-time notification system.

These features may be evaluated in future phases if the initial architecture supports them properly.

---

## 6. Target Users

Synko will initially target individual users or small teams that need to quickly and contextually query information contained in documents.

Potential user examples:

- Developers consulting technical documentation.
- Students working with notes or PDF files.
- Professionals reviewing contracts or reports.
- Internal teams managing process documentation.
- Users who need to extract fast answers from long documents.

---

## 7. General Technical Approach

Synko will be built as a web application composed of several main blocks:

- **Frontend:** Angular 21 with a microfrontend-based architecture.
- **Backend:** Node.js with Express, structured by layers and modules.
- **Relational database:** PostgreSQL.
- **Vector database:** Qdrant.
- **Local infrastructure:** Docker and Docker Compose.
- **Automation:** Jenkins.
- **AI:** RAG system based on embeddings, semantic search, and answer generation.

The architecture will aim to separate responsibilities from the beginning to avoid a disorganized monolithic backend or a frontend that becomes difficult to scale.

---

## 8. Technical Motivation

The project has a double purpose.

First, to build a useful tool for managing and querying documents using artificial intelligence.

Second, to use Synko as a professional growth project by applying practices similar to those used in real software development environments:

- Clear folder structure.
- Separation of responsibilities.
- Technical decision documentation.
- Incremental commits.
- Branch-based workflow.
- Deployment automation.
- Docker containers.
- Integration between services.
- Design focused on scalability and maintainability.

Synko is not intended to be a simple CRUD application. It is designed as a complete project that combines web development, backend engineering, infrastructure, and applied artificial intelligence.

---

## 9. Success Criteria

The first version of Synko will be considered successful if it allows the following:

- Start the entire environment using Docker.
- Register and authenticate users.
- Upload PDF documents.
- Extract text from documents.
- Generate embeddings.
- Store vectors in Qdrant.
- Ask questions about documents.
- Obtain answers generated from retrieved document content.
- Show the sources used for each answer.
- Run a basic integration or deployment pipeline with Jenkins.
- Keep technical documentation updated throughout development.

---

## 10. Initial Risks

Some technical risks identified from the beginning are:

### Microfrontend Complexity

Using Angular with microfrontends may introduce unnecessary complexity if the project is not structured properly from the beginning.

To mitigate this, the project will start with a minimal and controlled architecture, avoiding excessive fragmentation too early.

### Large Document Processing

Large PDF files may generate many chunks and increase storage, processing, and search costs.

To mitigate this, file size limits, chunking strategies, and asynchronous processing will be defined in later phases.

### AI Model Costs

The use of external language models may generate costs if many queries are performed.

To mitigate this, local models or alternative providers may be evaluated during development.

### Coupling Between Backend and AI Providers

The backend should not depend directly on a specific model implementation or provider.

To mitigate this, embedding generation and answer generation logic will be abstracted through internal services.

### Initial Overengineering

There is a risk of trying to build too many features from the beginning.

To mitigate this, the project will be divided into phases and a minimum viable version will be prioritized before adding more complexity.

---

## 11. Expected Evolution

The initial evolution of the project will be divided into several phases:

1. Configure the monorepo or repositories.
2. Create the initial Express backend structure.
3. Create the initial Angular 21 frontend structure.
4. Configure Docker Compose.
5. Integrate PostgreSQL.
6. Implement authentication.
7. Add document upload and management.
8. Integrate Qdrant.
9. Build the RAG pipeline.
10. Add the microfrontend architecture.
11. Configure Jenkins.
12. Add testing and technical hardening.
13. Finalize documentation and prepare the project as a portfolio piece.

---

## 12. Summary

Synko will be an intelligent document management platform built with a modern architecture and oriented toward professional growth.

The project will combine advanced frontend development, structured backend architecture, relational and vector databases, containers, automation, and applied artificial intelligence.

Beyond its final functionality, Synko will serve as a practical demonstration of technical ability, architectural thinking, and consistency in the development of a complete software product.