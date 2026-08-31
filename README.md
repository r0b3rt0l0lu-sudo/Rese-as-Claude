# Reseñas IA — Respondedor de reseñas de Google para PYMEs

MVP de una app que ayuda a un negocio pequeño (restaurante, peluquería, taller, clínica...) a
responder sus reseñas de Google: detecta reseñas sin responder, clasifica el riesgo, genera una
respuesta con IA adaptada al negocio, y pasa esa respuesta por un filtro humano ligero antes de
enviarla.

Este MVP corre 100% en local (base de datos SQLite en un archivo, sin servidor que instalar) y
funciona en **modo manual asistido**: la IA genera la respuesta y tú la copias y pegas en Google.
La integración automática con la API real de Google Business Profile queda como mejora
incremental (ver [Roadmap](#roadmap--próximos-pasos) más abajo).

## Stack

- **Next.js 14 (App Router)** + TypeScript — interfaz y backend en un solo proyecto.
- **Tailwind CSS** — estilos, con la paleta de marca "Confianza" (azul) en `tailwind.config.ts`.
- **Prisma + SQLite** — base de datos como un archivo local (`prisma/dev.db`), sin instalar nada.
- **Claude (Anthropic API)** para la generación de respuestas, con un generador "mock" de respaldo
  si no configuras una API key (para que puedas probar todo el flujo sin costo ni configuración).

## Cómo correrlo en local

```bash
npm install
cp .env.example .env      # ya viene con DATABASE_URL configurado
npx prisma db push        # crea prisma/dev.db con el esquema
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — te llevará directo al onboarding la primera vez.

### Generación de respuestas con IA real (opcional)

Sin configurar nada, la app usa un generador de respuestas "mock" (plantillas basadas en la
calificación y el tono del negocio) para que puedas probar el flujo completo de inmediato. Para
usar generación real con Claude, agrega tu API key en `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

La página de Ajustes siempre muestra si estás en modo mock o con IA real conectada.

### Otros comandos útiles

```bash
npm run db:studio   # explorador visual de la base de datos (Prisma Studio)
npm run db:seed     # crea un negocio de demo (restaurante) con reseñas de ejemplo, para explorar rápido
npm run build        # build de producción
```

## Flujo del MVP

1. **Onboarding** (`/onboarding`): nombre del negocio, sector, tono de marca, política de
   devoluciones/cancelaciones, cosas que la IA nunca debe decir, firma de quien responde, e
   idioma(s). Todo esto se guarda de forma estructurada como la base de conocimiento inicial del
   negocio (no texto libre suelto).
2. **Simular reseña** (`/reviews/simulate`): como todavía no hay integración real con Google, este
   formulario simula la llegada de una reseña nueva. Dispara automáticamente el triaje de riesgo y
   la generación de la respuesta.
3. **Triaje de riesgo**: cada reseña se clasifica en riesgo bajo / medio / alto (`lib/triage.ts`).
   El riesgo alto se detecta por palabras clave configurables (`lib/riskKeywords.ts`, editable
   desde Ajustes) y **siempre** gana sobre la calificación — ni siquiera una reseña de 5 estrellas
   que mencione un accidente se trata como riesgo bajo.
   - Riesgo alto → no se genera una respuesta completa: solo una plantilla corta de contención, y
     se notifica de inmediato como prioritaria.
   - Riesgo medio → respuesta generada, pero requiere aprobación manual siempre.
   - Riesgo bajo → respuesta generada; se puede auto-aprobar si el autopiloto está activo.
4. **Bandeja de aprobación** (`/reviews`): aprobar y copiar, editar, o regenerar con feedback en
   lenguaje natural. El feedback de una regeneración (y la nota opcional al editar manualmente) se
   guarda como una nueva regla aprendida en la base de conocimiento (`KnowledgeBaseEntry` tipo
   `LEARNED`), para mejorar generaciones futuras.
5. **Confianza progresiva / modo sombra**: el negocio empieza en modo 100% manual. Cuando se
   supera un número configurable de respuestas enviadas y un % configurable de aprobación-sin-editar
   en reseñas de riesgo bajo, la app ofrece (nunca activa sola) prender el autopiloto solo para
   riesgo bajo. Botón de pausa total siempre visible en Ajustes.
6. **Notificaciones** (`/notifications`) y **auditoría** (`/audit`): bandeja de pendientes dentro
   de la app, e historial de todo lo enviado (qué, cuándo, aprobado por quién).

## Decisiones de diseño relevantes

- **Un solo negocio por instalación.** El MVP asume que cada instalación es de un solo dueño de
  negocio (multi-usuario/roles queda fuera de alcance, según el brief). `lib/business.ts`
  centraliza esta suposición para que sea fácil de extender a multi-tenant más adelante.
- **"Autopiloto" en modo manual.** Como el envío real a Google todavía es manual asistido, el
  autopiloto en este MVP significa "auto-aprobado, listo para copiar" en vez de "publicado sin
  intervención humana": el dueño ya no necesita hacer clic en aprobar, pero sigue siendo quien
  pega la respuesta en Google (no hay forma de evitar ese paso sin la API real).
- **Plantillas por sector.** `lib/sectorTemplates.ts` define plantillas de onboarding y ejemplos
  por sector. El MVP prioriza **Restaurantes** con contenido completo; el resto (peluquería,
  taller, clínica) queda con plantillas básicas listas para ampliar, y "Genérico" cubre cualquier
  otro rubro. El modelo de datos (`KnowledgeBaseEntry`, `RiskKeyword` por negocio) ya soporta
  agregar sectores nuevos sin cambios estructurales.
- **Canal de notificaciones preparado para WhatsApp.** `Notification.channel` ya distingue
  `IN_APP` de `WHATSAPP`; el MVP solo implementa `IN_APP`, pero agregar WhatsApp más adelante no
  requiere cambiar el modelo de datos.

## Roadmap / próximos pasos

- **Integración real con Google Business Profile API** (`accounts.locations.reviews.updateReply`)
  para leer y responder reseñas automáticamente, y reflejar su estado real (enviada / en revisión
  / publicada / rechazada — el modelo `SendRecord.apiStatus` ya tiene estos campos reservados).
- **Notificaciones por WhatsApp**, usando el canal ya preparado en el modelo de datos.
- **Facturación/pagos** y **multi-usuario por negocio** — explícitamente fuera de alcance del MVP.
