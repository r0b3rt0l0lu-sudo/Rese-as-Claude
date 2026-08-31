import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";
import { generateResponse } from "@/lib/ai";
import { logAudit } from "@/lib/audit";

const schema = z.object({ feedback: z.string().min(2) });

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
  const { feedback } = parsed.data;

  const latest = review.responses[0];
  const kbEntries = await prisma.knowledgeBaseEntry.findMany({
    where: { businessId: business.id, active: true },
  });

  const content = await generateResponse(
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

  await prisma.knowledgeBaseEntry.create({
    data: {
      businessId: business.id,
      type: "LEARNED",
      label: "Preferencia aprendida de una regeneración",
      value: feedback,
      sourceReviewId: review.id,
    },
  });

  await logAudit({
    businessId: business.id,
    reviewId: review.id,
    action: "RESPONSE_REGENERATED",
    actor: "HUMAN",
    detail: `Feedback: "${feedback}"`,
  });

  return NextResponse.json({ content: newResponse.content });
}
