# 01. Arquitectura inicial — Synko

## 1. Objetivo del documento

Este documento define la arquitectura inicial de **Synko**, una plataforma de gestión documental inteligente basada en IA generativa, búsqueda semántica y procesamiento de documentos.

El objetivo no es cerrar todas las decisiones técnicas desde el inicio, sino establecer una base clara sobre la que construir el proyecto de forma ordenada, escalable y mantenible.

Este documento servirá como referencia para:

- Definir los servicios principales del sistema.
- Separar responsabilidades entre frontend, backend, bases de datos e infraestructura.
- Evitar una estructura desordenada desde las primeras fases.
- Documentar decisiones técnicas iniciales.
- Identificar riesgos arquitectónicos antes de comenzar la implementación.

---

## 2. Visión general de la arquitectura

Synko se construirá como una aplicación web compuesta por varios bloques principales:

- **Frontend Angular 21**, organizado mediante una arquitectura basada en microfrontends.
- **Backend Node.js con Express**, estructurado por módulos y capas.
- **PostgreSQL**, como base de datos relacional principal.
- **Qdrant**, como base de datos vectorial para almacenar embeddings.
- **Docker**, para levantar un entorno local reproducible.
- **Jenkins**, para automatizar procesos de integración y despliegue.
- **Proveedor de IA**, encargado de generar embeddings y respuestas en lenguaje natural.

La arquitectura buscará separar claramente las responsabilidades del sistema desde el principio.

El frontend se encargará de la experiencia de usuario.  
El backend actuará como capa de negocio y orquestación.  
PostgreSQL almacenará los datos estructurados.  
Qdrant almacenará y buscará representaciones vectoriales.  
El proveedor de IA generará embeddings y respuestas mediante modelos de lenguaje.

---

## 3. Servicios principales

La primera versión de Synko estará compuesta por los siguientes servicios:

| Servicio | Responsabilidad principal |
|---|---|
| Frontend Shell | Aplicación contenedora principal de Angular |
| Auth Microfrontend | Gestión de login, registro y sesión |
| Documents Microfrontend | Gestión de documentos subidos por el usuario |
| Chat Microfrontend | Interfaz de consultas inteligentes sobre documentos |
| Backend API | Lógica de negocio, autenticación, documentos, RAG y comunicación con servicios externos |
| PostgreSQL | Persistencia relacional de usuarios, documentos y metadatos |
| Qdrant | Almacenamiento y búsqueda de embeddings |
| AI Provider | Generación de embeddings y respuestas |
| Jenkins | Automatización de pipelines |
| Docker Compose | Orquestación del entorno local |

---

## 4. Diagrama lógico inicial

La comunicación inicial entre componentes será la siguiente:

```text
[Angular Shell]
      |
      | carga microfrontends
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

El backend será el único componente autorizado para comunicarse directamente con PostgreSQL, Qdrant y el proveedor de IA.

El frontend nunca accederá directamente a la base de datos relacional, a la base de datos vectorial ni a las APIs privadas de IA.

---

## 5. Arquitectura del frontend

El frontend se desarrollará con **Angular 21** y una arquitectura orientada a microfrontends.

La idea inicial será dividir la aplicación en varios dominios funcionales:

```text
apps/frontend/
├── shell/
├── auth/
├── documents/
└── chat/
```

### Shell

La aplicación `shell` actuará como contenedor principal.

Sus responsabilidades serán:

- Definir el layout general de la aplicación.
- Gestionar la navegación principal.
- Cargar los microfrontends.
- Compartir configuración común.
- Gestionar elementos globales como navbar, sidebar o estado de sesión.

### Auth Microfrontend

El microfrontend de autenticación gestionará:

- Registro de usuarios.
- Inicio de sesión.
- Cierre de sesión.
- Recuperación básica del estado del usuario.
- Rutas públicas relacionadas con autenticación.

### Documents Microfrontend

El microfrontend de documentos gestionará:

- Subida de documentos.
- Listado de documentos.
- Visualización de metadatos.
- Eliminación de documentos.
- Estado de procesamiento de documentos.

### Chat Microfrontend

El microfrontend de chat gestionará:

- Formulario de preguntas.
- Selección de documentos o colecciones.
- Visualización de respuestas.
- Visualización de fuentes utilizadas.
- Historial básico de consultas.

---

## 6. Criterio sobre microfrontends

Aunque Synko utilizará una arquitectura basada en microfrontends, se evitará una fragmentación excesiva en las primeras fases.

La estrategia será empezar con una separación mínima y controlada:

```text
shell
auth
documents
chat
```

No se crearán microfrontends adicionales hasta que exista una razón clara de dominio, escalabilidad o independencia funcional.

Quedan fuera de la fase inicial microfrontends como:

- Admin.
- Billing.
- Teams.
- Notifications.
- Analytics.

La prioridad inicial será tener una aplicación modular y comprensible, no una arquitectura innecesariamente compleja.

---

## 7. Arquitectura del backend

El backend se desarrollará con **Node.js**, **Express** y **TypeScript**.

No se seguirá una estructura plana basada únicamente en rutas y controladores. Se usará una organización por módulos y capas para separar responsabilidades.

Estructura inicial propuesta:

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

## 8. Capas del backend

El backend se dividirá en varias capas principales.

### Routes

Responsables de definir los endpoints HTTP.

Ejemplo:

```text
POST /auth/register
POST /auth/login
GET /documents
POST /documents
POST /chat/query
```

Las rutas no deben contener lógica de negocio.

### Controllers

Responsables de recibir la petición, validar la entrada inicial y delegar la operación al servicio correspondiente.

Los controladores no deben acceder directamente a la base de datos.

### Services

Responsables de la lógica de negocio.

Aquí se gestionarán operaciones como:

- Registrar un usuario.
- Validar credenciales.
- Procesar documentos.
- Generar embeddings.
- Ejecutar el flujo RAG.
- Coordinar llamadas a PostgreSQL, Qdrant y proveedor de IA.

### Repositories

Responsables del acceso a datos persistentes.

Los repositorios encapsularán la comunicación con PostgreSQL y evitarán que la lógica SQL o del ORM se mezcle con la lógica de negocio.

### Infrastructure

Responsable de integraciones técnicas externas:

- PostgreSQL.
- Qdrant.
- Sistema de archivos o almacenamiento.
- Proveedor de IA.
- Configuración de clientes externos.

### Shared

Contendrá elementos reutilizables:

- Middlewares.
- Errores personalizados.
- Utilidades.
- Tipos compartidos.
- Validadores comunes.

---

## 9. Base de datos relacional: PostgreSQL

PostgreSQL será la base de datos principal para los datos estructurados de Synko.

Se usará para almacenar:

- Usuarios.
- Roles.
- Documentos.
- Metadatos.
- Chunks.
- Historial de consultas.
- Relaciones entre usuarios y documentos.

Ejemplo inicial de entidades:

```text
users
documents
document_chunks
chat_sessions
chat_messages
```

PostgreSQL no almacenará los vectores directamente en la primera versión, ya que esa responsabilidad recaerá en Qdrant.

La relación entre PostgreSQL y Qdrant se hará mediante identificadores compartidos, como:

```text
document_id
chunk_id
user_id
```

---

## 10. Base de datos vectorial: Qdrant

Qdrant se usará como base de datos vectorial para almacenar embeddings generados a partir de los fragmentos de documentos.

Cada vector almacenado en Qdrant representará un fragmento textual del documento.

Cada punto vectorial deberá incluir metadatos mínimos:

```json
{
  "user_id": "uuid",
  "document_id": "uuid",
  "chunk_id": "uuid",
  "source": "document-name.pdf",
  "page": 3
}
```

Estos metadatos permitirán recuperar la trazabilidad entre una respuesta generada y el contenido original del documento.

Qdrant será utilizado principalmente en el flujo RAG para recuperar los fragmentos más relevantes en función de una pregunta del usuario.

---

## 11. Flujo de autenticación

El flujo inicial de autenticación será:

```text
1. El usuario se registra desde el frontend.
2. El frontend envía los datos al backend.
3. El backend valida la información.
4. El backend cifra la contraseña.
5. El usuario se guarda en PostgreSQL.
6. El usuario inicia sesión.
7. El backend valida credenciales.
8. El backend genera un token de autenticación.
9. El frontend almacena el estado de sesión.
10. Las rutas privadas requieren token válido.
```

Inicialmente se usará autenticación basada en tokens.

La decisión entre usar token en memoria, localStorage o cookies HTTP-only se documentará con más detalle en el documento específico de autenticación.

---

## 12. Flujo de gestión documental

El flujo inicial de gestión documental será:

```text
1. El usuario autenticado sube un PDF.
2. El frontend envía el archivo al backend.
3. El backend valida tipo y tamaño.
4. El backend almacena el archivo o su referencia.
5. El backend registra los metadatos en PostgreSQL.
6. El backend extrae el texto del PDF.
7. El texto se divide en chunks.
8. Cada chunk se guarda en PostgreSQL.
9. Se generan embeddings para cada chunk.
10. Los embeddings se almacenan en Qdrant.
11. El documento queda marcado como procesado.
```

En la primera versión, el procesamiento podrá realizarse de forma síncrona o semisíncrona para simplificar el desarrollo.

En fases posteriores se valorará mover el procesamiento a un sistema asíncrono mediante colas de trabajo.

---

## 13. Flujo RAG inicial

El flujo RAG será el núcleo inteligente de Synko.

El proceso inicial será:

```text
1. El usuario escribe una pregunta.
2. El frontend envía la pregunta al backend.
3. El backend valida usuario, permisos y documentos disponibles.
4. El backend genera un embedding de la pregunta.
5. El backend consulta Qdrant usando ese embedding.
6. Qdrant devuelve los chunks más similares.
7. El backend recupera metadatos adicionales desde PostgreSQL si es necesario.
8. El backend construye un prompt con la pregunta y los fragmentos recuperados.
9. El proveedor de IA genera una respuesta.
10. El backend devuelve la respuesta y las fuentes al frontend.
11. El frontend muestra la respuesta al usuario.
```

El backend deberá mantener la trazabilidad de las fuentes usadas para generar cada respuesta.

Una respuesta sin fuentes no será considerada válida en el objetivo inicial del proyecto.

---

## 14. Infraestructura local con Docker

El entorno local se levantará mediante Docker Compose.

Servicios iniciales:

```text
frontend
backend
postgres
qdrant
```

Más adelante podrán añadirse:

```text
jenkins
redis
worker
minio
```

La primera versión del `docker-compose.yml` deberá permitir:

- Levantar PostgreSQL.
- Levantar Qdrant.
- Levantar el backend.
- Levantar el frontend.
- Configurar variables de entorno.
- Compartir red interna entre servicios.

El objetivo es que cualquier desarrollador pueda clonar el repositorio y levantar el entorno sin instalar manualmente todas las dependencias del sistema.

---

## 15. Automatización con Jenkins

Jenkins se utilizará para practicar automatización de pipelines.

En la fase inicial, el pipeline podrá incluir:

```text
1. Clonar repositorio.
2. Instalar dependencias.
3. Ejecutar lint.
4. Ejecutar tests.
5. Construir frontend.
6. Construir backend.
7. Construir imágenes Docker.
```

En fases posteriores se podrá ampliar con:

- Despliegue automático.
- Versionado de imágenes.
- Análisis estático.
- Escaneo básico de seguridad.
- Publicación de artefactos.

Jenkins no será imprescindible para la primera ejecución funcional de Synko, pero sí formará parte de los criterios de madurez técnica del proyecto.

---

## 16. Estructura inicial del repositorio

La estructura inicial propuesta del repositorio será:

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

Esta estructura podrá cambiar si durante el desarrollo se decide usar un monorepo más formal con herramientas como Nx, npm workspaces o pnpm workspaces.

La decisión final se documentará cuando se cree la estructura real del proyecto.

---

## 17. Decisiones técnicas iniciales

| Decisión | Motivo |
|---|---|
| Angular 21 | Permite trabajar frontend moderno y arquitectura avanzada |
| Microfrontends | Ayuda a practicar separación por dominios funcionales |
| Node.js + Express | Backend flexible, conocido y adecuado para APIs REST |
| TypeScript | Mejora mantenibilidad y seguridad de tipos |
| PostgreSQL | Base de datos relacional robusta |
| Qdrant | Base de datos vectorial especializada |
| Docker | Reproducibilidad del entorno |
| Jenkins | Automatización y práctica de CI/CD |
| RAG | Permite integrar IA generativa con datos propios |
| Documentación bilingüe | Mejora la presentación profesional del proyecto |

---

## 18. Riesgos arquitectónicos

### Complejidad excesiva en frontend

Los microfrontends pueden añadir complejidad innecesaria si se aplican demasiado pronto.

Mitigación:

- Empezar con pocos microfrontends.
- Mantener responsabilidades claras.
- Evitar duplicar lógica común.
- Documentar contratos entre shell y microfrontends.

### Backend demasiado acoplado

Existe el riesgo de mezclar rutas, lógica de negocio, acceso a datos e integraciones externas.

Mitigación:

- Separar rutas, controladores, servicios, repositorios e infraestructura.
- Usar interfaces cuando tenga sentido.
- Mantener los módulos independientes.

### Procesamiento pesado de documentos

El procesamiento de PDFs, generación de chunks y embeddings puede ser costoso.

Mitigación:

- Limitar tamaño de archivo inicialmente.
- Procesar documentos de forma controlada.
- Evaluar workers y colas en fases futuras.

### Dependencia de proveedor de IA

El sistema podría quedar acoplado a un único proveedor de embeddings o generación.

Mitigación:

- Crear una capa interna `ai`.
- Evitar llamadas directas al proveedor desde servicios de dominio.
- Diseñar contratos internos para embeddings y generación de respuestas.

### Duplicidad entre PostgreSQL y Qdrant

Habrá información relacionada entre ambas bases de datos.

Mitigación:

- Mantener PostgreSQL como fuente principal de verdad.
- Usar Qdrant solo para búsqueda vectorial.
- Guardar identificadores compartidos en los metadatos vectoriales.

---

## 19. Evolución prevista

La arquitectura inicial evolucionará por fases:

1. Crear estructura base del repositorio.
2. Crear backend Express con TypeScript.
3. Crear frontend Angular shell.
4. Configurar Docker Compose.
5. Añadir PostgreSQL.
6. Añadir Qdrant.
7. Implementar autenticación.
8. Implementar subida de documentos.
9. Implementar procesamiento de PDFs.
10. Implementar embeddings.
11. Implementar búsqueda semántica.
12. Implementar flujo RAG.
13. Añadir microfrontends funcionales.
14. Añadir Jenkins.
15. Añadir testing.
16. Preparar documentación final para portfolio.

---

## 20. Resumen

La arquitectura inicial de Synko se basa en una separación clara entre frontend, backend, persistencia relacional, búsqueda vectorial, automatización e inteligencia artificial.

El sistema se construirá de forma incremental, evitando añadir complejidad antes de que exista una necesidad real.

La prioridad será crear una base técnica limpia, documentada y mantenible, que permita evolucionar Synko desde una primera versión funcional hasta una plataforma más completa.