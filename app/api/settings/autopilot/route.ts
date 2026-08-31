import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";
import { logAudit } from "@/lib/audit";
import { computeAutopilotEligibility } from "@/lib/autopilot";

const schema = z.object({ enabled: z.boolean() });

export async function POST(req: NextRequest) {
  const business = await requireCurrentBusiness();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { enabled } = parsed.data;

  if (enabled) {
    const eligibility = await computeAutopilotEligibility(business);
    if (!eligibility.meetsShadowThreshold || !eligibility.meetsApprovalThreshold) {
      return NextResponse.json(
        { error: "Todavía no cumples los requisitos de confianza progresiva para activar el autopiloto." },
        { status: 400 }
      );
    }
  }

  await prisma.business.update({
    where: { id: business.id },
    data: { autopilotEnabled: enabled, autopilotEnabledAt: enabled ? new Date() : null },
  });

  await logAudit({
    businessId: business.id,
    action: enabled ? "AUTOPILOT_ENABLED" : "AUTOPILOT_PAUSED",
    actor: "HUMAN",
    detail: enabled
      ? "El dueño activó el autopiloto para reseñas de riesgo bajo."
      : "El dueño pausó el autopiloto.",
  });

  return NextResponse.json({ autopilotEnabled: enabled });
}
