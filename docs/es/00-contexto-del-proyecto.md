# 00. Contexto del proyecto — Synko

## 1. Descripción general

**Synko** es una plataforma web de gestión documental inteligente orientada a permitir que los usuarios suban, organicen y consulten documentos mediante inteligencia artificial.

El sistema permitirá almacenar documentos, procesarlos, generar representaciones vectoriales de su contenido y realizar consultas en lenguaje natural sobre la información contenida en ellos. Para ello, Synko combinará una arquitectura web moderna con un backend modular, una base de datos relacional y una base de datos vectorial especializada.

El objetivo principal del proyecto no es únicamente construir una aplicación funcional, sino desarrollar una solución técnicamente sólida, escalable y bien documentada, simulando un entorno de trabajo profesional.

---

## 2. Problema que resuelve

En muchos entornos personales y empresariales existe una gran cantidad de documentación dispersa: PDFs, manuales, contratos, informes, documentación técnica, procedimientos internos, facturas o archivos administrativos.

El acceso a esta información suele presentar varios problemas:

- Los documentos están desorganizados.
- Buscar información concreta dentro de varios documentos es lento.
- El usuario necesita abrir, leer y comparar manualmente varios archivos.
- No existe una forma sencilla de hacer preguntas directas sobre el contenido.
- Los sistemas tradicionales de búsqueda por palabras clave no entienden el contexto.

Synko busca resolver este problema permitiendo que el usuario pueda subir documentos y realizar preguntas como:

- “¿Cuál es el resumen de este contrato?”
- “¿Qué condiciones de pago aparecen en estos documentos?”
- “¿Qué pasos indica el manual para configurar el sistema?”
- “¿Qué documentos mencionan una determinada cláusula?”
- “Dame una comparación entre estos informes.”

---

## 3. Objetivo del proyecto

El objetivo de Synko es construir una plataforma que permita:

1. Subir y almacenar documentos.
2. Extraer y procesar su contenido textual.
3. Dividir el contenido en fragmentos manejables.
4. Generar embeddings de esos fragmentos.
5. Guardar los embeddings en una base de datos vectorial.
6. Recuperar fragmentos relevantes a partir de una pregunta del usuario.
7. Generar respuestas usando un modelo de lenguaje.
8. Mostrar al usuario respuestas con trazabilidad hacia los documentos originales.

Además, el proyecto servirá como base para practicar y demostrar conocimientos en:

- Arquitectura backend con Node.js y Express.
- Frontend avanzado con Angular 21.
- Arquitectura basada en microfrontends.
- PostgreSQL como base de datos relacional.
- Qdrant como base de datos vectorial.
- Docker para entornos reproducibles.
- Jenkins para automatización de despliegues.
- Buenas prácticas de documentación técnica.
- Diseño modular y mantenible.
- Integración de IA generativa en una aplicación real.

---

## 4. Alcance inicial

En su primera versión, Synko incluirá las siguientes funcionalidades principales:

### Gestión de usuarios

- Registro de usuarios.
- Inicio de sesión.
- Autenticación mediante tokens.
- Protección de rutas privadas.
- Gestión básica de sesión.

### Gestión documental

- Subida de documentos PDF.
- Listado de documentos subidos.
- Visualización de metadatos.
- Eliminación de documentos.
- Validación de tipo y tamaño de archivo.

### Procesamiento de documentos

- Extracción de texto desde PDFs.
- División del texto en chunks.
- Generación de embeddings.
- Almacenamiento de vectores en Qdrant.
- Asociación entre documentos, chunks y usuarios.

### Consulta inteligente

- Formulario de preguntas sobre documentos.
- Búsqueda semántica en Qdrant.
- Recuperación de fragmentos relevantes.
- Generación de respuesta mediante un modelo de lenguaje.
- Visualización de fuentes utilizadas para construir la respuesta.

### Infraestructura

- Entorno local con Docker Compose.
- Servicio backend.
- Servicio frontend.
- Servicio PostgreSQL.
- Servicio Qdrant.
- Pipeline inicial con Jenkins.

---

## 5. Fuera de alcance inicial

Para mantener el proyecto controlado, algunas funcionalidades quedarán fuera de la primera versión:

- Edición colaborativa de documentos.
- Procesamiento de imágenes mediante OCR.
- Soporte avanzado para Word, Excel o PowerPoint.
- Sistema completo de permisos por equipos.
- Facturación o planes de pago.
- Despliegue cloud avanzado.
- Entrenamiento de modelos propios.
- Fine-tuning de modelos de lenguaje.
- Aplicación móvil.
- Sistema de notificaciones en tiempo real.

Estas funcionalidades podrán valorarse en fases futuras si la arquitectura inicial lo permite.

---

## 6. Usuarios objetivo

Synko estará orientado inicialmente a usuarios individuales o pequeños equipos que necesiten consultar información contenida en documentos de forma rápida y contextual.

Ejemplos de usuarios potenciales:

- Desarrolladores que consultan documentación técnica.
- Estudiantes que trabajan con apuntes o PDFs.
- Profesionales que revisan contratos o informes.
- Equipos internos que gestionan documentación de procesos.
- Usuarios que necesitan extraer respuestas rápidas de documentos largos.

---

## 7. Enfoque técnico general

Synko se construirá como una aplicación web compuesta por varios bloques principales:

- **Frontend:** Angular 21 con arquitectura basada en microfrontends.
- **Backend:** Node.js con Express, estructurado por capas y módulos.
- **Base de datos relacional:** PostgreSQL.
- **Base de datos vectorial:** Qdrant.
- **Infraestructura local:** Docker y Docker Compose.
- **Automatización:** Jenkins.
- **IA:** sistema RAG basado en embeddings, búsqueda semántica y generación de respuestas.

La arquitectura buscará separar responsabilidades desde el inicio para evitar un backend monolítico desordenado o un frontend difícil de escalar.

---

## 8. Motivación técnica

El proyecto nace con una doble finalidad.

Por un lado, construir una herramienta útil para gestionar y consultar documentos mediante inteligencia artificial.

Por otro lado, utilizar Synko como proyecto de crecimiento profesional, aplicando prácticas similares a las de un entorno de desarrollo real:

- Estructura clara de carpetas.
- Separación de responsabilidades.
- Documentación de decisiones técnicas.
- Commits incrementales.
- Uso de ramas.
- Automatización de despliegues.
- Contenedores Docker.
- Integración entre servicios.
- Diseño pensando en escalabilidad y mantenimiento.

Synko no se plantea como un simple CRUD, sino como un proyecto completo que combine desarrollo web, backend, infraestructura e inteligencia artificial aplicada.

---

## 9. Criterios de éxito

La primera versión de Synko se considerará exitosa si permite:

- Levantar todo el entorno mediante Docker.
- Registrar e iniciar sesión con usuarios.
- Subir documentos PDF.
- Extraer texto de los documentos.
- Generar embeddings.
- Guardar los vectores en Qdrant.
- Realizar preguntas sobre documentos.
- Obtener respuestas generadas a partir del contenido recuperado.
- Mostrar las fuentes usadas en cada respuesta.
- Ejecutar un pipeline básico de integración o despliegue con Jenkins.
- Mantener documentación técnica actualizada durante el desarrollo.

---

## 10. Riesgos iniciales

Algunos riesgos técnicos identificados desde el inicio son:

### Complejidad de microfrontends

Angular con microfrontends puede añadir complejidad innecesaria si el proyecto no se estructura bien desde el principio.

Para mitigarlo, se empezará con una arquitectura mínima y controlada, evitando dividir demasiado pronto la aplicación.

### Procesamiento de documentos grandes

Los PDFs extensos pueden generar muchos chunks y aumentar el coste de almacenamiento, procesamiento y búsqueda.

Para mitigarlo, se definirán límites de tamaño, estrategias de chunking y procesamiento asíncrono en fases posteriores.

### Coste de modelos de IA

El uso de modelos externos puede generar costes si se hacen muchas consultas.

Para mitigarlo, se valorará el uso de modelos locales o proveedores alternativos durante el desarrollo.

### Acoplamiento entre backend e IA

El backend no debería depender directamente de una implementación concreta de modelo o proveedor.

Para mitigarlo, se abstraerá la lógica de embeddings y generación de respuestas mediante servicios internos.

### Sobredimensionamiento inicial

Existe el riesgo de intentar construir demasiadas funcionalidades desde el principio.

Para mitigarlo, el proyecto se dividirá en fases y se priorizará una versión mínima funcional antes de añadir complejidad.

---

## 11. Evolución prevista

La evolución inicial del proyecto se dividirá en varias fases:

1. Configuración base del monorepo o repositorios.
2. Estructura inicial del backend con Express.
3. Estructura inicial del frontend con Angular 21.
4. Configuración de Docker Compose.
5. Integración con PostgreSQL.
6. Sistema de autenticación.
7. Subida y gestión de documentos.
8. Integración con Qdrant.
9. Pipeline RAG.
10. Microfrontends.
11. Jenkins.
12. Testing y endurecimiento técnico.
13. Documentación final y preparación para portfolio.

---

## 12. Resumen

Synko será una plataforma de gestión documental inteligente construida con una arquitectura moderna y orientada al aprendizaje profesional.

El proyecto combinará frontend avanzado, backend estructurado, bases de datos relacionales y vectoriales, contenedores, automatización e inteligencia artificial aplicada.

Más allá de la funcionalidad final, Synko servirá como demostración práctica de capacidad técnica, criterio arquitectónico y constancia en el desarrollo de un producto completo.