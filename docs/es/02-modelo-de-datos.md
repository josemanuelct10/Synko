# 02. Modelo de datos — Synko

## 1. Objetivo del documento

Este documento define el modelo de datos inicial de **Synko**.

El objetivo es establecer una primera estructura para representar usuarios, documentos, fragmentos de texto, sesiones de chat, mensajes y la relación entre PostgreSQL y Qdrant.

Este modelo no pretende ser definitivo desde el inicio. La intención es disponer de una base clara que pueda evolucionar conforme avance el desarrollo del proyecto.

---

## 2. Enfoque general

Synko utilizará dos tipos de almacenamiento principales:

| Sistema | Responsabilidad |
|---|---|
| PostgreSQL | Datos estructurados y fuente principal de verdad |
| Qdrant | Almacenamiento y búsqueda vectorial de embeddings |

PostgreSQL almacenará la información persistente del dominio:

- Usuarios.
- Roles.
- Documentos.
- Metadatos.
- Chunks de documentos.
- Sesiones de chat.
- Mensajes.
- Estado de procesamiento.

Qdrant almacenará los vectores generados a partir de los chunks de documentos.

La relación entre PostgreSQL y Qdrant se mantendrá mediante identificadores compartidos.

---

## 3. Principio principal

PostgreSQL será la **fuente principal de verdad** del sistema.

Qdrant no sustituirá a PostgreSQL. Qdrant se usará únicamente para búsqueda semántica y recuperación vectorial.

Esto significa que:

- Los usuarios viven en PostgreSQL.
- Los documentos viven en PostgreSQL.
- Los chunks viven en PostgreSQL.
- Los metadatos principales viven en PostgreSQL.
- Los embeddings viven en Qdrant.
- Qdrant tendrá metadatos mínimos para relacionar cada vector con PostgreSQL.

---

## 4. Entidades iniciales

El modelo inicial estará compuesto por las siguientes entidades:

```text
users
roles
user_roles
documents
document_chunks
chat_sessions
chat_messages
```

En una primera fase se podrá simplificar el sistema de roles si no es necesario implementar permisos avanzados desde el principio.

---

## 5. Tabla `users`

Representa a los usuarios registrados en Synko.

### Campos iniciales

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único del usuario |
| email | VARCHAR | Email único del usuario |
| password_hash | VARCHAR | Contraseña cifrada |
| name | VARCHAR | Nombre visible del usuario |
| status | VARCHAR | Estado del usuario |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### Estados posibles

```text
active
disabled
pending_verification
```

### Notas

- El campo `email` debe ser único.
- Nunca se almacenará la contraseña en texto plano.
- `password_hash` será generado mediante una función de hashing segura.
- En fases futuras se podrá añadir verificación de email, recuperación de contraseña o autenticación externa.

---

## 6. Tabla `roles`

Representa los roles disponibles en el sistema.

### Campos iniciales

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único del rol |
| name | VARCHAR | Nombre del rol |
| description | TEXT | Descripción del rol |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### Roles iniciales

```text
user
admin
```

### Notas

En la primera versión, el rol `user` será suficiente para la mayoría de funcionalidades.

El rol `admin` se reserva para futuras capacidades administrativas.

---

## 7. Tabla `user_roles`

Relaciona usuarios con roles.

### Campos iniciales

| Campo | Tipo | Descripción |
|---|---|---|
| user_id | UUID | Identificador del usuario |
| role_id | UUID | Identificador del rol |
| created_at | TIMESTAMP | Fecha de asignación |

### Clave primaria sugerida

```text
(user_id, role_id)
```

### Notas

Esta tabla permite que un usuario tenga varios roles si el sistema lo necesita en el futuro.

Si el proyecto se mantiene simple, se podría sustituir por un campo `role` dentro de `users`, pero la tabla intermedia ofrece más flexibilidad.

---

## 8. Tabla `documents`

Representa los documentos subidos por los usuarios.

### Campos iniciales

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único del documento |
| user_id | UUID | Usuario propietario del documento |
| original_name | VARCHAR | Nombre original del archivo |
| stored_name | VARCHAR | Nombre interno del archivo |
| mime_type | VARCHAR | Tipo MIME |
| size_bytes | BIGINT | Tamaño del archivo |
| storage_path | TEXT | Ruta o referencia donde se guarda el archivo |
| status | VARCHAR | Estado del procesamiento |
| error_message | TEXT | Mensaje de error si falla el procesamiento |
| created_at | TIMESTAMP | Fecha de subida |
| updated_at | TIMESTAMP | Fecha de última actualización |
| processed_at | TIMESTAMP | Fecha de procesamiento completado |

### Estados posibles

```text
uploaded
processing
processed
failed
deleted
```

### Notas

- `user_id` permite aislar documentos por usuario.
- `status` será clave para saber si el documento puede usarse en consultas RAG.
- `storage_path` puede apuntar inicialmente a almacenamiento local.
- En fases futuras, `storage_path` podría apuntar a MinIO, S3 u otro almacenamiento de objetos.

---

## 9. Tabla `document_chunks`

Representa los fragmentos de texto extraídos de cada documento.

### Campos iniciales

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único del chunk |
| document_id | UUID | Documento al que pertenece |
| user_id | UUID | Usuario propietario |
| chunk_index | INTEGER | Posición del chunk dentro del documento |
| content | TEXT | Texto del fragmento |
| page_number | INTEGER | Página aproximada del documento |
| token_count | INTEGER | Número aproximado de tokens |
| qdrant_point_id | UUID | Identificador del vector en Qdrant |
| created_at | TIMESTAMP | Fecha de creación |

### Notas

- Cada chunk debe estar asociado a un documento.
- `chunk_index` permite reconstruir el orden original.
- `qdrant_point_id` conecta PostgreSQL con Qdrant.
- `content` se almacena en PostgreSQL para trazabilidad, auditoría y visualización de fuentes.
- Aunque el vector esté en Qdrant, el texto original debe permanecer en PostgreSQL.

---

## 10. Tabla `chat_sessions`

Representa una conversación o sesión de preguntas del usuario.

### Campos iniciales

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único de la sesión |
| user_id | UUID | Usuario propietario |
| title | VARCHAR | Título opcional de la conversación |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### Notas

Una sesión puede contener múltiples mensajes.

El título puede generarse manualmente o automáticamente a partir de la primera pregunta del usuario.

---

## 11. Tabla `chat_messages`

Representa los mensajes dentro de una sesión de chat.

### Campos iniciales

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único del mensaje |
| session_id | UUID | Sesión a la que pertenece |
| user_id | UUID | Usuario propietario |
| role | VARCHAR | Rol del mensaje |
| content | TEXT | Contenido del mensaje |
| sources | JSONB | Fuentes usadas para generar una respuesta |
| created_at | TIMESTAMP | Fecha de creación |

### Roles posibles

```text
user
assistant
system
```

### Ejemplo de `sources`

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

### Notas

- Los mensajes del usuario tendrán `role = user`.
- Las respuestas generadas por IA tendrán `role = assistant`.
- El campo `sources` será especialmente importante para respuestas RAG.
- Una respuesta sin fuentes no se considerará válida en la primera versión del sistema.

---

## 12. Relación entre PostgreSQL y Qdrant

PostgreSQL almacenará los datos estructurados y el contenido textual.

Qdrant almacenará los embeddings.

La relación se realizará mediante identificadores compartidos.

### En PostgreSQL

Cada registro de `document_chunks` tendrá:

```text
id
document_id
user_id
qdrant_point_id
content
page_number
```

### En Qdrant

Cada punto vectorial tendrá una estructura similar a:

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

### Regla principal

El `chunk_id` de PostgreSQL debe aparecer en el payload de Qdrant.

Esto permite que, después de una búsqueda vectorial, el backend pueda recuperar información completa desde PostgreSQL.

---

## 13. Flujo de persistencia de documentos

El flujo inicial será:

```text
1. El usuario sube un documento.
2. Se crea un registro en `documents` con estado `uploaded`.
3. El backend valida el archivo.
4. El estado cambia a `processing`.
5. El backend extrae texto del PDF.
6. El texto se divide en chunks.
7. Cada chunk se guarda en `document_chunks`.
8. Se genera un embedding para cada chunk.
9. Cada embedding se guarda en Qdrant.
10. Se actualiza `qdrant_point_id` en cada chunk.
11. El documento cambia a estado `processed`.
```

Si ocurre un error:

```text
1. El documento cambia a estado `failed`.
2. Se guarda el motivo en `error_message`.
3. No se permite usar ese documento en consultas RAG.
```

---

## 14. Flujo de consulta RAG

El flujo de consulta será:

```text
1. El usuario envía una pregunta.
2. Se crea o reutiliza una `chat_session`.
3. Se guarda la pregunta como `chat_message` con role `user`.
4. El backend genera un embedding de la pregunta.
5. El backend consulta Qdrant filtrando por `user_id`.
6. Qdrant devuelve los chunks más similares.
7. El backend recupera información completa desde `document_chunks` y `documents`.
8. El backend construye el contexto para el modelo de lenguaje.
9. El modelo genera una respuesta.
10. La respuesta se guarda como `chat_message` con role `assistant`.
11. Las fuentes se guardan en el campo `sources`.
12. El frontend muestra respuesta y fuentes.
```

---

## 15. Aislamiento por usuario

Synko debe garantizar que un usuario no pueda consultar documentos de otro usuario.

Este aislamiento se aplicará en tres niveles:

### PostgreSQL

Todas las consultas a documentos, chunks y sesiones deberán filtrar por `user_id`.

### Qdrant

Las búsquedas vectoriales deberán incluir un filtro por `user_id` en el payload.

### Backend

El backend validará que el usuario autenticado solo accede a recursos que le pertenecen.

---

## 16. Índices iniciales

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

## 17. Consideraciones sobre eliminación

La eliminación de documentos debe tratarse con cuidado porque afecta tanto a PostgreSQL como a Qdrant.

En la primera versión se usará una eliminación lógica mediante el estado:

```text
deleted
```

Esto evita borrar datos accidentalmente durante el desarrollo.

Cuando un documento se marque como eliminado:

- No aparecerá en el listado normal.
- No podrá usarse en consultas RAG.
- Sus chunks no deberían recuperarse.
- En fases futuras se podrá borrar físicamente de PostgreSQL, almacenamiento y Qdrant.

---

## 18. Consideraciones sobre escalabilidad

El modelo inicial funcionará para una primera versión, pero existen varios puntos a vigilar si el volumen crece:

- Muchos documentos por usuario.
- Documentos muy largos.
- Miles de chunks por documento.
- Coste de almacenar texto completo en PostgreSQL.
- Coste de embeddings.
- Tiempo de procesamiento.
- Tamaño de la colección en Qdrant.
- Rendimiento de búsquedas filtradas por usuario.

Posibles mejoras futuras:

- Procesamiento asíncrono con workers.
- Colas con Redis/BullMQ.
- Almacenamiento de archivos en MinIO o S3.
- Paginación avanzada.
- Archivado de documentos.
- Separación por colecciones o workspaces.
- Políticas de retención.
- Uso de particionado si el volumen crece mucho.

---

## 19. Decisiones pendientes

Algunas decisiones se documentarán más adelante:

| Decisión | Documento futuro |
|---|---|
| ORM o query builder | ADR específico |
| Estrategia de autenticación | Documento de autenticación |
| Almacenamiento local vs object storage | Documento de infraestructura |
| Estrategia de chunking | Documento de procesamiento |
| Modelo de embeddings | Documento de embeddings |
| Estructura exacta de colecciones Qdrant | Documento de Qdrant |
| Procesamiento síncrono o asíncrono | ADR específico |

---

## 20. Resumen

El modelo de datos inicial de Synko separa claramente los datos estructurados de la búsqueda vectorial.

PostgreSQL será la fuente principal de verdad y almacenará usuarios, documentos, chunks y conversaciones.

Qdrant almacenará los embeddings y permitirá realizar búsquedas semánticas eficientes.

La relación entre ambos sistemas se mantendrá mediante identificadores compartidos, especialmente `chunk_id`, `document_id`, `user_id` y `qdrant_point_id`.

Este diseño permite construir una primera versión funcional sin cerrar la puerta a futuras mejoras de escalabilidad, procesamiento asíncrono y almacenamiento avanzado.