import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  shadowModeReviewThreshold: z.number().int().min(1).max(1000),
  autopilotApprovalThreshold: z.number().min(0.5).max(1),
});

export async function POST(req: NextRequest) {
  const business = await requireCurrentBusiness();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.business.update({
    where: { id: business.id },
    data: parsed.data,
  });

  await logAudit({
    businessId: business.id,
    action: "THRESHOLDS_UPDATED",
    actor: "HUMAN",
    detail: `Umbral de reseñas: ${parsed.data.shadowModeReviewThreshold}, umbral de aprobación: ${Math.round(
      parsed.data.autopilotApprovalThreshold * 100
    )}%.`,
  });

  return NextResponse.json({ ok: true });
}
