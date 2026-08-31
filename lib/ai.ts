import Anthropic from "@anthropic-ai/sdk";
import type { Business, KnowledgeBaseEntry, RiskLevel } from "@prisma/client";

const MODEL = "claude-sonnet-5";

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export function buildKnowledgeBaseContext(entries: Pick<KnowledgeBaseEntry, "type" | "label" | "value">[]): string {
  if (entries.length === 0) return "(No hay información adicional en la base de conocimiento todavía.)";

  const byType = {
    ONBOARDING: entries.filter((e) => e.type === "ONBOARDING"),
    POLICY: entries.filter((e) => e.type === "POLICY"),
    NEVER_SAY: entries.filter((e) => e.type === "NEVER_SAY"),
    LEARNED: entries.filter((e) => e.type === "LEARNED"),
  };

  const section = (title: string, items: typeof entries) =>
    items.length === 0 ? "" : `${title}:\n${items.map((i) => `- ${i.label}: ${i.value}`).join("\n")}\n`;

  return [
    section("Información base del negocio", byType.ONBOARDING),
    section("Políticas declaradas", byType.POLICY),
    section("Cosas que NUNCA se deben decir o prometer", byType.NEVER_SAY),
    section("Reglas aprendidas de respuestas anteriores (ediciones y feedback del dueño)", byType.LEARNED),
  ]
    .filter(Boolean)
    .join("\n");
}

interface GenerateParams {
  business: Business;
  reviewRating: number;
  reviewText: string;
  reviewAuthor: string;
  kbEntries: Pick<KnowledgeBaseEntry, "type" | "label" | "value">[];
  feedback?: string | null;
  previousContent?: string | null;
}

/**
 * Plantilla corta de contención para reseñas de riesgo ALTO.
 * No se genera una respuesta completa: solo se invita a hablar en privado,
 * sin admitir responsabilidad ni entrar en detalles del incidente.
 */
export function generateContainmentTemplate(business: Business, reviewAuthor: string): string {
  const firstName = reviewAuthor.split(" ")[0] || "Hola";
  return `${firstName}, lamentamos mucho leer esto. Tu experiencia es muy importante para nosotros y queremos entender bien lo sucedido para actuar de inmediato. ¿Podrías escribirnos en privado (o dejarnos un contacto) para atenderte personalmente? — ${business.responderName}`;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Genera una respuesta de ejemplo sin depender de la API de Claude.
 * No repite el texto del feedback tal cual (eso confundía a los dueños,
 * que veían su propio comentario "pegado" dentro de la respuesta pública):
 * en vez de eso, elige una variante de plantilla según palabras clave del
 * feedback, para que el resultado se vea distinto sin filtrar el feedback.
 */
function mockGenerate(params: GenerateParams, riskLevel: RiskLevel): string {
  const { business, reviewRating, reviewAuthor, feedback } = params;
  const firstName = reviewAuthor.split(" ")[0] || "Hola";
  const f = feedback ? normalize(feedback) : "";

  if (riskLevel === "HIGH") {
    return generateContainmentTemplate(business, reviewAuthor);
  }

  const wantsFormal = /formal|serio|profesional/.test(f);
  const wantsShort = /cort|breve|resum|directo/.test(f);
  const wantsResolved = /resuelto|solucion|arregl|corregi/.test(f);

  const positive = reviewRating >= 4;

  if (positive) {
    if (wantsFormal) {
      return `Estimado/a ${firstName}, le agradecemos sinceramente el tiempo dedicado a compartir su experiencia. Nos complace saber que su visita a ${business.name} cumplió con sus expectativas, y valoramos mucho su confianza. Seguiremos trabajando para mantener este nivel de atención en cada visita. Quedamos a su disposición para lo que necesite. — ${business.responderName}`;
    }
    if (wantsShort) {
      return `¡Gracias ${firstName} por tu reseña! Nos alegra mucho que hayas tenido una buena experiencia. Te esperamos pronto de nuevo. — ${business.responderName}`;
    }
    return `¡Muchas gracias ${firstName} por tomarte el tiempo de dejarnos esta reseña! Nos alegra muchísimo saber que tu experiencia con nosotros fue tan buena — comentarios como el tuyo son los que nos motivan a seguir cuidando cada detalle. En ${business.name} nos esforzamos por que cada visita se sienta especial, así que significa mucho que se haya notado. Esperamos poder recibirte de nuevo muy pronto. — ${business.responderName}`;
  }

  if (wantsResolved) {
    return `Hola ${firstName}, gracias por tu paciencia y por avisarnos. Ya revisamos internamente lo que comentas y tomamos las medidas necesarias para que no vuelva a pasar. Nos encantaría que nos dieras otra oportunidad para demostrarte el servicio que realmente queremos ofrecer. Cualquier cosa, no dudes en escribirnos directamente. — ${business.responderName}`;
  }
  if (wantsFormal) {
    return `Estimado/a ${firstName}, lamentamos que su experiencia no haya cumplido con lo que esperaba. Agradecemos que nos lo haga saber, ya que nos permite identificar oportunidades de mejora. Le invitamos a contactarnos directamente para revisar su caso con el detalle que merece. — ${business.responderName}`;
  }
  if (wantsShort) {
    return `Hola ${firstName}, gracias por avisarnos y disculpa las molestias. Escríbenos en privado para resolverlo. — ${business.responderName}`;
  }
  return `Hola ${firstName}, gracias por tomarte el tiempo de contarnos tu experiencia, de verdad lo valoramos. Lamentamos mucho que en esta ocasión no haya sido lo que esperabas — no es el estándar con el que queremos que te quedes de nosotros. Nos gustaría entender mejor qué pasó para poder solucionarlo: si nos escribes en privado con más detalles, con gusto lo revisamos personalmente. Gracias de nuevo por decírnoslo, comentarios como el tuyo nos ayudan a mejorar. — ${business.responderName}`;
}

export async function generateResponse(params: GenerateParams, riskLevel: RiskLevel): Promise<string> {
  const client = getClient();

  if (riskLevel === "HIGH") {
    // Riesgo alto: nunca se genera una respuesta completa automáticamente.
    // Se ofrece solo la plantilla corta de contención (determinística).
    return generateContainmentTemplate(params.business, params.reviewAuthor);
  }

  if (!client) {
    return mockGenerate(params, riskLevel);
  }

  const { business, reviewRating, reviewText, reviewAuthor, kbEntries, feedback, previousContent } = params;
  const context = buildKnowledgeBaseContext(kbEntries);

  const systemPrompt = `Eres el asistente que redacta, en nombre del dueño de un negocio, la respuesta pública a una reseña de Google.

Reglas estrictas:
- Usa SOLO la información de la base de conocimiento del negocio provista abajo. NUNCA inventes precios, promesas, políticas ni datos que no estén ahí.
- Respeta estrictamente la lista de "cosas que NUNCA se deben decir o prometer".
- Escribe en el idioma: ${business.languages}.
- Usa el tono de marca declarado por el negocio.
- Escribe una respuesta completa de 4 a 6 frases: agradece o reconoce el comentario, menciona algo concreto de la reseña o del negocio (usando la base de conocimiento, nunca inventado), y cierra con una invitación clara (volver, contactar en privado, etc.). Evita respuestas telegráficas o genéricas de una sola línea.
- Sé natural y humano — no suenes corporativo ni robótico, aunque la respuesta sea más larga.
- Firma la respuesta como: ${business.responderName}.
- No repitas literalmente el texto de la reseña.
- Riesgo de la reseña detectado: ${riskLevel} (LOW = elogio o comentario neutro; MEDIUM = queja normal de producto/servicio, responde con empatía y disposición a resolver, sin prometer compensaciones que no estén en la base de conocimiento).`;

  const userPrompt = `Base de conocimiento del negocio "${business.name}" (sector: ${business.sector}):
${context}

Reseña recibida:
- Autor: ${reviewAuthor}
- Calificación: ${reviewRating}/5
- Texto: "${reviewText}"

${
  feedback && previousContent
    ? `El dueño ya vio esta respuesta anterior y pidió ajustarla:\nRespuesta anterior: "${previousContent}"\nFeedback del dueño: "${feedback}"\n\nGenera una nueva versión incorporando ese feedback.`
    : "Genera la respuesta pública a esta reseña."
}

Responde ÚNICAMENTE con el texto de la respuesta, sin comillas ni explicaciones adicionales.`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (textBlock && textBlock.type === "text") {
      return textBlock.text.trim();
    }
    return mockGenerate(params, riskLevel);
  } catch (err) {
    console.error("Error generando respuesta con Claude, usando fallback mock:", err);
    return mockGenerate(params, riskLevel);
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
