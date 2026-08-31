import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";
import { logAudit } from "@/lib/audit";
import { maybeNotifyAutopilotEligible } from "@/lib/autopilot";

const schema = z.object({
  content: z.string().min(1),
  editNote: z.string().optional(),
});

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
  const { content, editNote } = parsed.data;

  const latest = review.responses[0];
  const edited = latest ? content.trim() !== latest.content.trim() : true;

  let finalResponse = latest;
  if (edited) {
    finalResponse = await prisma.generatedResponse.create({
      data: {
        reviewId: review.id,
        version: (latest?.version ?? 0) + 1,
        content,
        origin: "HUMAN_EDIT",
      },
    });

    if (editNote && editNote.trim().length > 0) {
      await prisma.knowledgeBaseEntry.create({
        data: {
          businessId: business.id,
          type: "LEARNED",
          label: "Ajuste aprendido de una edición manual",
          value: editNote.trim(),
          sourceReviewId: review.id,
        },
      });
    }
  }

  await prisma.sendRecord.create({
    data: {
      reviewId: review.id,
      responseId: finalResponse!.id,
      sentVia: "MANUAL_COPY",
      approvedBy: "MANUAL",
      editedBeforeApprove: edited,
    },
  });

  await prisma.review.update({ where: { id: review.id }, data: { status: "RESPONDED" } });

  await logAudit({
    businessId: business.id,
    reviewId: review.id,
    action: "RESPONSE_APPROVED",
    actor: "HUMAN",
    detail: edited ? "Aprobada tras editar el texto sugerido." : "Aprobada sin ediciones.",
  });

  await maybeNotifyAutopilotEligible(business);

  return NextResponse.json({ content: finalResponse!.content });
}
