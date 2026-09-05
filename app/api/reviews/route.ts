import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";
import { triageReview } from "@/lib/triage";
import { generateResponse } from "@/lib/ai";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { maybeNotifyAutopilotEligible } from "@/lib/autopilot";

const schema = z.object({
  authorName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1),
});

// Simula la recepción de una reseña de Google (no hay integración real con
// la API todavía). Dispara el triaje de riesgo y la generación inicial de
// respuesta, y aplica el autopiloto si corresponde.
export async function POST(req: NextRequest) {
  const business = await requireCurrentBusiness();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { authorName, rating, text } = parsed.data;

  const activeKeywords = await prisma.riskKeyword.findMany({
    where: { businessId: business.id, enabled: true },
  });

  const triage = triageReview(rating, text, activeKeywords);

  const review = await prisma.review.create({
    data: {
      businessId: business.id,
      authorName,
      rating,
      text,
      riskLevel: triage.level,
      riskReasons: JSON.stringify(triage.reasons),
    },
  });

  await logAudit({
    businessId: business.id,
    reviewId: review.id,
    action: "REVIEW_RECEIVED",
    actor: "SYSTEM",
    detail: `Reseña de ${authorName} (${rating}★) clasificada como riesgo ${triage.level}.`,
  });

  const kbEntries = await prisma.knowledgeBaseEntry.findMany({
    where: { businessId: business.id, active: true },
  });

  const { content, aiError } = await generateResponse(
    {
      business,
      reviewRating: rating,
      reviewText: text,
      reviewAuthor: authorName,
      kbEntries,
    },
    triage.level
  );

  const generatedResponse = await prisma.generatedResponse.create({
    data: { reviewId: review.id, version: 1, content, origin: "AI" },
  });

  await logAudit({
    businessId: business.id,
    reviewId: review.id,
    action: "RESPONSE_GENERATED",
    actor: "SYSTEM",
    detail: aiError
      ? `Primera versión generada con el fallback mock — la IA real falló: ${aiError}`
      : "Primera versión de respuesta generada por IA.",
  });

  if (triage.level === "HIGH") {
    await createNotification({
      businessId: business.id,
      type: "HIGH_RISK_REVIEW",
      title: "⚠️ Reseña prioritaria — requiere tu atención",
      body: `Reseña de ${authorName} (${rating}★) marcada como riesgo alto: ${
        triage.reasons.map((r) => r.keyword).join(", ") || "contenido sensible"
      }. Revísala cuanto antes.`,
      reviewId: review.id,
    });
  } else if (business.autopilotEnabled && triage.level === "LOW") {
    // Autopiloto: auto-aprueba reseñas de riesgo bajo. El envío sigue siendo
    // manual asistido (no hay integración real con la API de Google todavía),
    // así que el dueño solo necesita copiar y pegar — ya no necesita aprobar.
    await prisma.sendRecord.create({
      data: {
        reviewId: review.id,
        responseId: generatedResponse.id,
        sentVia: "MANUAL_COPY",
        approvedBy: "AUTOPILOT",
        editedBeforeApprove: false,
      },
    });
    await prisma.review.update({ where: { id: review.id }, data: { status: "RESPONDED" } });
    await logAudit({
      businessId: business.id,
      reviewId: review.id,
      action: "RESPONSE_AUTO_APPROVED",
      actor: "AUTOPILOT",
      detail: "Aprobada automáticamente por el autopiloto (riesgo bajo).",
    });
    await createNotification({
      businessId: business.id,
      type: "PENDING_APPROVAL",
      title: "🚀 Autopiloto respondió una reseña",
      body: `Se aprobó automáticamente la respuesta para ${authorName} (${rating}★). Cópiala en Google cuando quieras.`,
      reviewId: review.id,
    });
  } else {
    await createNotification({
      businessId: business.id,
      type: "PENDING_APPROVAL",
      title: "Nueva reseña esperando tu aprobación",
      body: `Reseña de ${authorName} (${rating}★, riesgo ${triage.level}) con una respuesta sugerida lista para revisar.`,
      reviewId: review.id,
    });
  }

  await maybeNotifyAutopilotEligible(business);

  const finalReview = await prisma.review.findUnique({
    where: { id: review.id },
    include: { responses: { orderBy: { version: "desc" }, take: 1 } },
  });

  return NextResponse.json({ review: finalReview });
}
