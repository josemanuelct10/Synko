# 04. Dockerización — Synko

## 1. Objetivo del documento

Este documento define la estrategia inicial de dockerización para **Synko**.

El objetivo es crear un entorno de desarrollo local reproducible, donde cualquier desarrollador pueda levantar los servicios principales del proyecto sin instalar manualmente todas las dependencias del sistema.

La dockerización inicial cubrirá:

- Backend Node.js con Express.
- Frontend Angular 21.
- PostgreSQL.
- Qdrant.
- Red interna entre servicios.
- Variables de entorno.
- Volúmenes persistentes.
- Preparación para integrar Jenkins en una fase posterior.

---

## 2. Contexto

Synko está formado por varios componentes que deben trabajar juntos:

```text
frontend
backend
postgres
qdrant
```

Más adelante se podrán añadir:

```text
jenkins
redis
worker
minio
```

Docker permitirá levantar estos servicios de forma consistente, evitando diferencias entre entornos locales.

El objetivo inicial no es crear una infraestructura de producción completa, sino un entorno local sólido para desarrollo.

---

## 3. Decisión inicial

Synko utilizará **Docker Compose** para orquestar los servicios principales en desarrollo local.

La primera versión del entorno incluirá:

| Servicio | Responsabilidad |
|---|---|
| frontend | Aplicación Angular 21 |
| backend | API Node.js con Express |
| postgres | Base de datos relacional |
| qdrant | Base de datos vectorial |
| network | Red interna para comunicación entre servicios |
| volumes | Persistencia de datos locales |

---

## 4. Estructura inicial de infraestructura

La estructura recomendada será:

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

Esta estructura podrá ajustarse cuando se cree el proyecto real.

---

## 5. Servicios iniciales

### Backend

El backend será un servicio Node.js con Express y TypeScript.

Responsabilidades:

- Exponer la API REST.
- Conectarse a PostgreSQL.
- Conectarse a Qdrant.
- Gestionar autenticación.
- Procesar documentos.
- Orquestar el flujo RAG.

Puerto recomendado:

```text
3000
```

### Frontend

El frontend será una aplicación Angular 21.

Responsabilidades:

- Mostrar la interfaz de usuario.
- Consumir la API del backend.
- Gestionar rutas, guards y microfrontends.
- Mostrar documentos, chat y fuentes.

Puerto recomendado:

```text
4200
```

### PostgreSQL

PostgreSQL será la fuente principal de verdad para los datos estructurados.

Responsabilidades:

- Usuarios.
- Roles.
- Documentos.
- Chunks.
- Sesiones de chat.
- Mensajes.

Puerto recomendado:

```text
5432
```

### Qdrant

Qdrant almacenará embeddings y permitirá búsquedas vectoriales.

Responsabilidades:

- Guardar vectores.
- Buscar chunks similares.
- Filtrar resultados por payload, especialmente `user_id`.

Puerto recomendado:

```text
6333
```

---

## 6. Comunicación entre servicios

Los servicios se comunicarán mediante una red interna de Docker.

Ejemplo conceptual:

```text
frontend -> backend
backend -> postgres
backend -> qdrant
```

El frontend no debe comunicarse directamente con PostgreSQL ni Qdrant.

Regla principal:

```text
El backend es el único servicio autorizado para acceder a PostgreSQL, Qdrant y proveedores de IA.
```

---

## 7. Variables de entorno

Synko usará variables de entorno para evitar credenciales o configuración sensible dentro del código.

Archivo recomendado:

```text
.env.example
```

Contenido inicial:

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

Reglas:

- `.env` no debe subirse al repositorio.
- `.env.example` sí debe subirse.
- Los secretos reales nunca deben estar versionados.
- Cada servicio debe leer solo las variables que necesita.

---

## 8. Docker Compose inicial

El archivo `docker-compose.yml` inicial podrá tener una estructura similar:

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

Este archivo podrá evolucionar cuando se creen realmente las aplicaciones Angular y Express.

---

## 9. Dockerfile del backend

El backend tendrá su propio Dockerfile.

Ubicación propuesta:

```text
infrastructure/docker/backend.Dockerfile
```

Ejemplo inicial:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY apps/backend/package*.json ./

RUN npm install

COPY apps/backend .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

Este Dockerfile está pensado para desarrollo.

En producción se debería usar una estrategia diferente:

- Build previo de TypeScript.
- Instalación solo de dependencias de producción.
- Usuario no root.
- Imagen más optimizada.
- Healthcheck.

---

## 10. Dockerfile del frontend

El frontend tendrá su propio Dockerfile.

Ubicación propuesta:

```text
infrastructure/docker/frontend.Dockerfile
```

Ejemplo inicial:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY apps/frontend/package*.json ./

RUN npm install

COPY apps/frontend .

EXPOSE 4200

CMD ["npm", "start", "--", "--host", "0.0.0.0"]
```

Este Dockerfile está pensado para desarrollo con servidor de Angular.

En producción, el frontend debería compilarse y servirse mediante Nginx u otro servidor estático.

---

## 11. Volúmenes

Synko usará volúmenes para persistir datos locales.

Volúmenes iniciales:

```text
synko_postgres_data
synko_qdrant_data
```

### PostgreSQL

Persistirá los datos relacionales:

```text
/var/lib/postgresql/data
```

### Qdrant

Persistirá la base vectorial:

```text
/qdrant/storage
```

Esto permite que los datos no se pierdan al reiniciar contenedores.

Para limpiar completamente el entorno:

```bash
docker compose down -v
```

---

## 12. Redes

Todos los servicios estarán conectados a una red interna:

```text
synko_network
```

Dentro de esa red, los servicios podrán comunicarse usando el nombre del servicio como host:

```text
postgres
qdrant
backend
frontend
```

Ejemplos:

```text
POSTGRES_HOST=postgres
QDRANT_URL=http://qdrant:6333
```

---

## 13. Healthchecks

En una fase posterior se podrán añadir healthchecks para verificar que los servicios están listos antes de ser usados.

Ejemplo para PostgreSQL:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U synko_user -d synko"]
  interval: 10s
  timeout: 5s
  retries: 5
```

Ejemplo para Qdrant:

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:6333/healthz"]
  interval: 10s
  timeout: 5s
  retries: 5
```

Los healthchecks no son obligatorios para la primera versión, pero mejoran la estabilidad del entorno.

---

## 14. Orden de arranque

El orden conceptual de arranque será:

```text
1. postgres
2. qdrant
3. backend
4. frontend
```

`depends_on` ayuda a definir dependencias, pero no garantiza que la base de datos esté completamente lista para recibir conexiones.

Por eso, el backend deberá manejar reintentos de conexión o se añadirán healthchecks en una fase posterior.

---

## 15. Comandos principales

Levantar entorno:

```bash
docker compose up --build
```

Levantar en segundo plano:

```bash
docker compose up -d --build
```

Parar servicios:

```bash
docker compose down
```

Parar y eliminar volúmenes:

```bash
docker compose down -v
```

Ver logs:

```bash
docker compose logs -f
```

Ver logs de un servicio:

```bash
docker compose logs -f backend
```

---

## 16. Desarrollo local con Docker

Durante el desarrollo, será útil montar volúmenes de código para evitar reconstruir la imagen en cada cambio.

Ejemplo futuro para backend:

```yaml
backend:
  volumes:
    - ./apps/backend:/app
    - /app/node_modules
```

Ejemplo futuro para frontend:

```yaml
frontend:
  volumes:
    - ./apps/frontend:/app
    - /app/node_modules
```

Esto permitirá hot reload tanto en backend como en frontend.

La configuración exacta se ajustará cuando se creen las aplicaciones reales.

---

## 17. Jenkins

Jenkins no será obligatorio en la primera versión funcional del entorno local.

Sin embargo, el proyecto estará preparado para añadirlo posteriormente.

Servicio futuro:

```text
jenkins
```

Responsabilidades futuras:

- Instalar dependencias.
- Ejecutar lint.
- Ejecutar tests.
- Construir backend.
- Construir frontend.
- Construir imágenes Docker.
- Ejecutar pipeline de integración.
- Preparar despliegue.

Jenkins podrá añadirse al `docker-compose.yml` o ejecutarse como servicio separado.

---

## 18. Riesgos

### Complejidad inicial

Riesgo:

```text
Docker puede añadir complejidad antes de tener backend y frontend creados.
```

Mitigación:

```text
Empezar dockerizando primero PostgreSQL y Qdrant.
Añadir backend y frontend cuando existan sus proyectos base.
```

### Diferencias entre desarrollo y producción

Riesgo:

```text
Los Dockerfiles de desarrollo no sirven directamente para producción.
```

Mitigación:

```text
Documentar claramente que los Dockerfiles iniciales son de desarrollo.
Crear Dockerfiles de producción más adelante.
```

### Servicios no listos

Riesgo:

```text
El backend puede arrancar antes de que PostgreSQL o Qdrant estén listos.
```

Mitigación:

```text
Añadir healthchecks.
Añadir reintentos de conexión en backend.
```

### Gestión de secretos

Riesgo:

```text
Subir secretos reales al repositorio.
```

Mitigación:

```text
Usar .env.example.
Ignorar .env en .gitignore.
No versionar claves reales.
```

---

## 19. Decisiones pendientes

| Decisión | Estado |
|---|---|
| Docker Compose solo desarrollo o también staging | Pendiente |
| Dockerfiles separados para producción | Pendiente |
| Jenkins dentro o fuera de Docker Compose | Pendiente |
| Uso de Nginx para frontend en producción | Pendiente |
| Uso de MinIO para almacenamiento de documentos | Pendiente |
| Uso de Redis/BullMQ para workers | Pendiente |
| Healthchecks obligatorios | Pendiente |
| Hot reload con volúmenes | Pendiente durante implementación |

---

## 20. Resumen

Synko utilizará Docker Compose para levantar un entorno de desarrollo local reproducible.

La primera versión incluirá PostgreSQL, Qdrant, backend y frontend.

PostgreSQL será el almacenamiento relacional principal, Qdrant será la base vectorial, el backend actuará como capa de orquestación y el frontend consumirá únicamente la API del backend.

La dockerización inicial priorizará simplicidad y productividad en desarrollo, dejando para fases posteriores la optimización para producción, healthchecks avanzados, Jenkins completo, workers, Redis y almacenamiento de objetos.