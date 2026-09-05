# VigilIA — Respondedor de reseñas de Google para PYMEs

MVP de una app que ayuda a un negocio pequeño (restaurante, peluquería, taller, clínica...) a
responder sus reseñas de Google: detecta reseñas sin responder, clasifica el riesgo, genera una
respuesta con IA adaptada al negocio, y pasa esa respuesta por un filtro humano ligero antes de
enviarla.

Funciona en **modo manual asistido**: la IA genera la respuesta y tú la copias y pegas en Google.
La integración automática con la API real de Google Business Profile queda como mejora
incremental (ver [Roadmap](#roadmap--próximos-pasos) más abajo).

## Stack

- **Next.js 14 (App Router)** + TypeScript — interfaz y backend en un solo proyecto.
- **Tailwind CSS** — estilos, con la paleta marino oscuro + dorado y tipografía serif (Playfair
  Display) para títulos, definidos en `tailwind.config.ts`.
- **Prisma + PostgreSQL** (ej. [Neon](https://neon.tech), plan gratis) — misma base de datos en
  desarrollo y producción.
- **NextAuth.js** (credenciales por correo/contraseña) para proteger el acceso a los datos del
  negocio.
- **Claude (Anthropic API), DeepSeek o Gemini** para la generación de respuestas — configura la
  que tengas, o ninguna y usa el generador "mock" de respaldo (para probar el flujo sin costo).
  Gemini tiene un tier gratis (API key gratuita en [Google AI Studio](https://aistudio.google.com/apikey)).
- **pdf-parse** para extraer texto de PDFs subidos a la base de conocimiento.
- **Desplegado en [Vercel](https://vercel.com)**, conectado a la rama de este proyecto.

## Cómo correrlo en local

```bash
npm install
cp .env.example .env
npx prisma db push        # crea las tablas en tu base de datos Postgres (Neon)
npm run dev
```

`.env.example` trae un `NEXTAUTH_SECRET` de relleno — reemplázalo por uno real generado con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Abre [http://localhost:3000](http://localhost:3000) — la primera vez te lleva al onboarding, donde
creas el negocio y tu cuenta (correo + contraseña) al mismo tiempo. Las siguientes veces, `/login`
te pide esas credenciales antes de mostrar cualquier dato del negocio.

### Generación de respuestas con IA real (opcional)

Sin configurar nada, la app usa un generador de respuestas "mock" (plantillas basadas en la
calificación y el tono del negocio) para que puedas probar el flujo completo de inmediato. Para
usar generación real, agrega **una** de estas API keys en `.env` (si configuras varias, se
prioriza en este orden: Claude > DeepSeek > Gemini):

```
ANTHROPIC_API_KEY=sk-ant-...
```
o
```
DEEPSEEK_API_KEY=sk-...
```
o (con tier gratis — key gratuita en [Google AI Studio](https://aistudio.google.com/apikey))
```
GEMINI_API_KEY=...
```

La página de Ajustes siempre muestra si estás en modo mock o con cuál proveedor de IA real está
conectada la app (`lib/ai.ts` centraliza el enrutador entre Claude, DeepSeek, Gemini y el mock).

### Otros comandos útiles

```bash
npm run db:studio   # explorador visual de la base de datos (Prisma Studio)
npm run db:seed     # crea un negocio de demo (restaurante) con reseñas de ejemplo; login: demo@vigilia.app / demo1234
npm run build        # build de producción
```

## Flujo del MVP

1. **Onboarding** (`/onboarding`): nombre del negocio, sector, correo y contraseña de acceso, tono
   de marca, fortalezas del negocio (opcional, para personalizar mejor las respuestas), política de
   devoluciones/cancelaciones, cosas que la IA nunca debe decir, firma de quien responde, e
   idioma(s). Todo esto (salvo las credenciales) se guarda de forma estructurada como la base de
   conocimiento inicial del negocio (no texto libre suelto).
2. **Login** (`/login`): protege el resto de la app. Un middleware (`middleware.ts`) exige sesión
   para cualquier ruta que no sea `/login` u `/onboarding`.
3. **Simular reseña** (`/reviews/simulate`): como todavía no hay integración real con Google, este
   formulario simula la llegada de una reseña nueva. Los ejemplos rápidos de "un click" están
   adaptados al sector elegido en el onboarding (incluyendo un caso de riesgo alto por sector).
   Dispara automáticamente el triaje de riesgo y la generación de la respuesta.
4. **Triaje de riesgo**: cada reseña se clasifica en riesgo bajo / medio / alto (`lib/triage.ts`).
   El riesgo alto se detecta por palabras clave configurables (`lib/riskKeywords.ts`, editable
   desde Ajustes) y **siempre** gana sobre la calificación — ni siquiera una reseña de 5 estrellas
   que mencione un accidente se trata como riesgo bajo.
   - Riesgo alto → no se genera una respuesta completa: solo una plantilla corta de contención, y
     se notifica de inmediato como prioritaria.
   - Riesgo medio → respuesta generada, pero requiere aprobación manual siempre.
   - Riesgo bajo → respuesta generada; se puede auto-aprobar si el autopiloto está activo.
5. **Bandeja de aprobación** (`/reviews`): aprobar y copiar, editar, o regenerar. Regenerar no
   necesita feedback — sin él, igual se pide una redacción alternativa a la anterior (nunca repite
   la misma versión dos veces seguidas); si escribes feedback en lenguaje natural, además se
   guarda como una nueva regla aprendida en la base de conocimiento (`KnowledgeBaseEntry` tipo
   `LEARNED`), igual que la nota opcional al editar manualmente.
6. **Base de conocimiento** (`/knowledge-base`): además de las reglas estructuradas, se pueden
   subir documentos (PDF o `.txt` — menús, catálogos, listas de precios) que se procesan y quedan
   disponibles como contexto adicional para la IA.
7. **Confianza progresiva / modo sombra**: el negocio empieza en modo 100% manual. Cuando se
   supera un número configurable de respuestas enviadas y un % configurable de aprobación-sin-editar
   en reseñas de riesgo bajo, la app ofrece (nunca activa sola) prender el autopiloto solo para
   riesgo bajo. Botón de pausa total siempre visible en Ajustes.
8. **Notificaciones** (`/notifications`) y **auditoría** (`/audit`): bandeja de pendientes dentro
   de la app, e historial de todo lo enviado (qué, cuándo, aprobado por quién).

## Decisiones de diseño relevantes

- **Un solo negocio por instalación, con login.** El MVP asume que cada instalación es de un solo
  dueño de negocio (multi-usuario/roles queda fuera de alcance, según el brief), pero sí protege el
  acceso: la cuenta (correo + contraseña) se crea junto con el negocio en el onboarding, usando
  NextAuth con sesión JWT. `lib/business.ts` centraliza la suposición de single-tenant para que sea
  fácil de extender a multi-tenant más adelante.
- **"Autopiloto" en modo manual.** Como el envío real a Google todavía es manual asistido, el
  autopiloto en este MVP significa "auto-aprobado, listo para copiar" en vez de "publicado sin
  intervención humana": el dueño ya no necesita hacer clic en aprobar, pero sigue siendo quien
  pega la respuesta en Google (no hay forma de evitar ese paso sin la API real).
- **Plantillas por sector.** `lib/sectorTemplates.ts` define plantillas de onboarding y ejemplos
  de reseñas (bajo/medio/alto riesgo) por sector — Restaurante, Peluquería, Taller, Clínica y
  Genérico. El MVP prioriza **Restaurantes** en la narrativa de producto, pero todos los sectores
  incluidos tienen ejemplos completos y acordes a ese tipo de negocio. El modelo de datos
  (`KnowledgeBaseEntry`, `RiskKeyword` por negocio) ya soporta agregar sectores nuevos sin cambios
  estructurales.
- **Canal de notificaciones preparado para WhatsApp.** `Notification.channel` ya distingue
  `IN_APP` de `WHATSAPP`; el MVP solo implementa `IN_APP`, pero agregar WhatsApp más adelante no
  requiere cambiar el modelo de datos.

## Roadmap / próximos pasos

- **Integración real con Google Business Profile API** (`accounts.locations.reviews.updateReply`)
  para leer y responder reseñas automáticamente, y reflejar su estado real (enviada / en revisión
  / publicada / rechazada — el modelo `SendRecord.apiStatus` ya tiene estos campos reservados).
- **Notificaciones por WhatsApp**, usando el canal ya preparado en el modelo de datos.
- **Facturación/pagos** y **multi-usuario por negocio** — explícitamente fuera de alcance del MVP.
