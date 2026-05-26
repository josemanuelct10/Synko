# 03. Autenticación — Synko

## 1. Objetivo del documento

Este documento define la estrategia inicial de autenticación para **Synko**.

El objetivo es establecer cómo se registran los usuarios, cómo inician sesión, cómo se protege la API y cómo se mantiene la sesión en el frontend.

La autenticación es una parte crítica del sistema porque Synko gestionará documentos privados de usuarios. Por tanto, el backend debe garantizar que cada usuario solo pueda acceder a sus propios recursos.

---

## 2. Contexto

Synko permitirá que usuarios registrados suban documentos, consulten información mediante IA y mantengan un historial de conversaciones.

Esto implica que el sistema debe proteger:

- Documentos subidos.
- Chunks extraídos.
- Consultas realizadas.
- Respuestas generadas.
- Fuentes utilizadas.
- Sesiones de chat.

La autenticación debe permitir identificar al usuario en cada petición y aplicar aislamiento de datos tanto en PostgreSQL como en Qdrant.

---

## 3. Decisión inicial

Synko utilizará una autenticación basada en **JWT** emitido por el backend.

El token será generado después de un login correcto y se usará para acceder a rutas protegidas.

En la primera versión, la estrategia será:

```text
1. El usuario inicia sesión con email y contraseña.
2. El backend valida las credenciales.
3. El backend genera un JWT firmado.
4. El frontend guarda el estado de sesión.
5. El frontend envía el token en las peticiones protegidas.
6. El backend valida el token en cada petición privada.
7. El backend obtiene el `user_id` desde el token.
8. Los servicios filtran recursos por `user_id`.
```

---

## 4. Registro de usuario

El flujo de registro inicial será:

```text
1. El usuario introduce nombre, email y contraseña.
2. El frontend envía los datos al endpoint de registro.
3. El backend valida el formato de los datos.
4. El backend comprueba que el email no exista.
5. El backend cifra la contraseña.
6. El usuario se guarda en PostgreSQL.
7. Se asigna el rol inicial `user`.
8. El backend devuelve una respuesta de registro correcto.
```

Endpoint inicial:

```text
POST /auth/register
```

Payload esperado:

```json
{
  "name": "Jose Manuel",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Respuesta esperada:

```json
{
  "message": "User registered successfully"
}
```

---

## 5. Login de usuario

El flujo de login inicial será:

```text
1. El usuario introduce email y contraseña.
2. El frontend envía los datos al endpoint de login.
3. El backend busca el usuario por email.
4. El backend compara la contraseña recibida con el hash almacenado.
5. Si las credenciales son válidas, se genera un JWT.
6. El backend devuelve el token y datos mínimos del usuario.
```

Endpoint inicial:

```text
POST /auth/login
```

Payload esperado:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Respuesta esperada:

```json
{
  "access_token": "jwt-token",
  "token_type": "Bearer",
  "user": {
    "id": "uuid",
    "name": "Jose Manuel",
    "email": "user@example.com"
  }
}
```

---

## 6. Estrategia de almacenamiento del token

Existen varias opciones para almacenar el token en el frontend:

| Opción | Ventajas | Desventajas |
|---|---|---|
| localStorage | Simple de implementar | Expuesto a XSS |
| sessionStorage | Simple y se limpia al cerrar pestaña | Expuesto a XSS |
| Memoria | Más seguro frente a persistencia | Se pierde al recargar |
| Cookie HTTP-only | Mejor protección frente a XSS | Requiere configuración CSRF/CORS más cuidada |

## Decisión inicial

Para la primera versión, Synko podrá comenzar usando **JWT en memoria o sessionStorage** para simplificar el desarrollo.

Sin embargo, la opción recomendada para una versión más segura será migrar a **cookies HTTP-only**.

La evolución prevista será:

```text
Fase inicial: JWT Bearer token para acelerar desarrollo.
Fase posterior: cookie HTTP-only con configuración CSRF/CORS adecuada.
```

---

## 7. Protección de rutas backend

Las rutas privadas deberán usar un middleware de autenticación.

Ejemplo de rutas protegidas:

```text
GET /documents
POST /documents
DELETE /documents/:id
POST /chat/query
GET /chat/sessions
GET /chat/sessions/:id/messages
```

El middleware deberá:

```text
1. Leer el token de la cabecera Authorization.
2. Validar la firma del token.
3. Validar expiración.
4. Extraer `user_id`.
5. Añadir el usuario autenticado al objeto request.
6. Rechazar la petición si el token es inválido.
```

Cabecera esperada:

```text
Authorization: Bearer <token>
```

---

## 8. Payload del JWT

El JWT no debe incluir información sensible.

Payload inicial recomendado:

```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "roles": ["user"],
  "iat": 1710000000,
  "exp": 1710003600
}
```

Campos:

| Campo | Significado |
|---|---|
| sub | Identificador del usuario |
| email | Email del usuario |
| roles | Roles asignados |
| iat | Fecha de emisión |
| exp | Fecha de expiración |

El campo `sub` será la referencia principal para obtener el `user_id`.

---

## 9. Expiración del token

En la primera versión se usará un tiempo de expiración corto o moderado.

Ejemplo:

```text
ACCESS_TOKEN_EXPIRES_IN=1h
```

Más adelante se podrá añadir:

- Refresh tokens.
- Rotación de tokens.
- Invalidación de sesiones.
- Logout real desde backend.
- Lista de tokens revocados.

Para la primera versión, el logout se podrá gestionar eliminando el token del frontend.

---

## 10. Hash de contraseñas

Las contraseñas nunca se almacenarán en texto plano.

Se usará una librería de hashing segura, como:

```text
bcrypt
argon2
```

Decisión inicial:

```text
bcrypt
```

Motivos:

- Es conocido.
- Es estable.
- Tiene buen soporte en Node.js.
- Es suficiente para la primera versión.

Configuración inicial:

```text
SALT_ROUNDS=10
```

Esta configuración podrá ajustarse según rendimiento y necesidades de seguridad.

---

## 11. Aislamiento de datos por usuario

La autenticación no termina al validar el token.

Cada operación sobre recursos privados debe comprobar propiedad.

Ejemplo:

```text
GET /documents/:id
```

No basta con buscar el documento por `id`.

Debe buscarse por:

```text
document_id + user_id
```

Regla general:

```text
Todo recurso privado debe filtrarse por el `user_id` autenticado.
```

Esto aplica a:

- Documents.
- Document chunks.
- Chat sessions.
- Chat messages.
- Búsquedas en Qdrant.

---

## 12. Seguridad en búsquedas Qdrant

Las búsquedas vectoriales deberán incluir filtro por usuario.

Ejemplo conceptual:

```json
{
  "vector": [0.123, 0.456],
  "filter": {
    "must": [
      {
        "key": "user_id",
        "match": {
          "value": "authenticated_user_id"
        }
      }
    ]
  },
  "limit": 5
}
```

Esto evita que un usuario reciba chunks pertenecientes a documentos de otro usuario.

---

## 13. Roles y permisos

La primera versión tendrá roles básicos:

```text
user
admin
```

El rol `user` podrá:

- Subir documentos.
- Listar sus documentos.
- Eliminar sus documentos.
- Hacer preguntas sobre sus documentos.
- Consultar su historial de chat.

El rol `admin` queda reservado para futuras funcionalidades administrativas.

No se implementará un sistema complejo de permisos en la primera versión.

---

## 14. Validación de entrada

Todos los endpoints de autenticación deberán validar datos de entrada.

Campos a validar en registro:

```text
name
email
password
```

Campos a validar en login:

```text
email
password
```

Reglas mínimas:

- Email con formato válido.
- Password con longitud mínima.
- Name no vacío.
- No permitir campos inesperados si se usa validación estricta.

La validación podrá implementarse con:

```text
zod
joi
yup
```

Decisión inicial recomendada:

```text
zod
```

Motivo:

- Funciona bien con TypeScript.
- Permite inferir tipos.
- Es ligera y clara.

---

## 15. Gestión de errores

Los errores de autenticación deben ser claros pero no revelar información sensible.

Ejemplo:

```json
{
  "error": "Invalid credentials"
}
```

No conviene diferenciar públicamente entre:

```text
Email does not exist
Password is incorrect
```

Porque eso puede facilitar enumeración de usuarios.

Errores comunes:

| Caso | Código |
|---|---|
| Datos inválidos | 400 |
| Credenciales inválidas | 401 |
| Token ausente | 401 |
| Token inválido | 401 |
| Usuario sin permisos | 403 |
| Email ya registrado | 409 |

---

## 16. Variables de entorno

Variables iniciales relacionadas con autenticación:

```env
JWT_SECRET=change_me
JWT_EXPIRES_IN=1h
SALT_ROUNDS=10
```

Reglas:

- `JWT_SECRET` nunca debe subirse al repositorio.
- Debe existir un `.env.example`.
- En producción debe usarse un secreto fuerte.
- Los valores sensibles deben gestionarse mediante variables de entorno.

---

## 17. Logout

En la primera versión, el logout consistirá en eliminar el token almacenado en el frontend.

Flujo:

```text
1. El usuario pulsa logout.
2. El frontend elimina el token.
3. El frontend limpia el estado de sesión.
4. El usuario es redirigido a login.
```

Limitación:

```text
El token seguirá siendo válido hasta su expiración.
```

Mejora futura:

- Refresh tokens.
- Revocación de tokens.
- Tabla de sesiones.
- Logout gestionado desde backend.

---

## 18. Consideraciones para microfrontends

La autenticación debe ser coherente entre el shell y los microfrontends.

Reglas iniciales:

- El shell gestionará el estado global de sesión.
- Los microfrontends no deberán duplicar lógica de autenticación.
- Las rutas privadas se protegerán desde el shell o mediante guards compartidos.
- El token o estado autenticado deberá compartirse de forma controlada.
- Los servicios HTTP deberán añadir el token a las peticiones protegidas.

Se evitará que cada microfrontend implemente su propia autenticación de forma independiente.

---

## 19. Riesgos

### Uso de localStorage o sessionStorage

Riesgo:

```text
Mayor exposición ante ataques XSS.
```

Mitigación:

```text
Migrar a cookies HTTP-only en una fase posterior.
Aplicar buenas prácticas contra XSS.
Evitar inyectar HTML no confiable.
```

### JWT sin revocación

Riesgo:

```text
Un token robado sigue siendo válido hasta expirar.
```

Mitigación:

```text
Usar expiración corta.
Añadir refresh tokens y revocación en fases futuras.
```

### Filtros de usuario olvidados

Riesgo:

```text
Un usuario podría acceder a datos de otro usuario.
```

Mitigación:

```text
Aplicar filtrado por user_id en todos los repositorios.
Crear tests de autorización.
Centralizar validaciones de propiedad.
```

### Complejidad en microfrontends

Riesgo:

```text
Duplicación de lógica de sesión entre microfrontends.
```

Mitigación:

```text
Centralizar sesión en shell o librería compartida.
Documentar contratos de autenticación frontend.
```

---

## 20. Decisiones pendientes

| Decisión | Estado |
|---|---|
| JWT en header vs cookie HTTP-only | Inicialmente header, futuro cookie |
| Refresh tokens | Pendiente |
| Verificación de email | Pendiente |
| Recuperación de contraseña | Pendiente |
| OAuth con Google/GitHub | Fuera de alcance inicial |
| Tabla de sesiones | Pendiente |
| Revocación de tokens | Pendiente |

---

## 21. Resumen

Synko utilizará autenticación basada en JWT para la primera versión.

El backend emitirá tokens firmados tras validar credenciales y protegerá las rutas privadas mediante middleware.

El identificador del usuario autenticado será obligatorio para filtrar documentos, chunks, sesiones, mensajes y búsquedas vectoriales.

La primera versión priorizará simplicidad y avance funcional, pero dejando documentada la evolución hacia una autenticación más segura mediante cookies HTTP-only, refresh tokens y gestión de sesiones.