import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";
import { generateResponse } from "@/lib/ai";
import { logAudit } from "@/lib/audit";

const schema = z.object({ feedback: z.string().optional() });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const business = await requireCurrentBusiness();

  const review = await prisma.review.findFirst({
    where: { id: params.id, businessId: business.id },
    include: { responses: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!review) return NextResponse.json({ error: "Reseña no encontrada." }, { status: 404 });
  if (review.status !== "PENDING") {
    return NextResponse.json({ error: "Esta reseña ya fue respondida." }, { status: 409 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const feedback = parsed.data.feedback?.trim() || null;

  const latest = review.responses[0];
  const kbEntries = await prisma.knowledgeBaseEntry.findMany({
    where: { businessId: business.id, active: true },
  });

  // Sin feedback, igual se pide una versión ALTERNATIVA (no la misma de
  // siempre): ver lib/ai.ts, que varía la redacción cuando hay
  // previousContent aunque no haya feedback explícito.
  const { content, aiError } = await generateResponse(
    {
      business,
      reviewRating: review.rating,
      reviewText: review.text,
      reviewAuthor: review.authorName,
      kbEntries,
      feedback,
      previousContent: latest?.content ?? null,
    },
    review.riskLevel
  );

  const newResponse = await prisma.generatedResponse.create({
    data: {
      reviewId: review.id,
      version: (latest?.version ?? 0) + 1,
      content,
      origin: "AI",
      feedback,
    },
  });

  // Solo se guarda como regla aprendida si el dueño realmente dio feedback
  // en palabras — pedir "otra versión" sin más no enseña nada nuevo.
  if (feedback) {
    await prisma.knowledgeBaseEntry.create({
      data: {
        businessId: business.id,
        type: "LEARNED",
        label: "Preferencia aprendida de una regeneración",
        value: feedback,
        sourceReviewId: review.id,
      },
    });
  }

  await logAudit({
    businessId: business.id,
    reviewId: review.id,
    action: "RESPONSE_REGENERATED",
    actor: "HUMAN",
    detail:
      (feedback ? `Feedback: "${feedback}"` : "Regenerada sin feedback (pidió otra versión).") +
      (aiError ? ` — usó fallback mock, la IA real falló: ${aiError}` : ""),
  });

  return NextResponse.json({ content: newResponse.content, aiError });
}
