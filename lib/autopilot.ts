import { prisma } from "./prisma";
import { createNotification } from "./notifications";
import type { Business } from "@prisma/client";

export interface AutopilotEligibility {
  totalResponded: number;
  lowRiskResponded: number;
  lowRiskApprovedWithoutEdit: number;
  approvalRate: number | null;
  meetsShadowThreshold: boolean;
  meetsApprovalThreshold: boolean;
  eligible: boolean;
}

/**
 * Calcula si el negocio ya "salió" del modo sombra: suficientes respuestas
 * manuales enviadas y una tasa de aprobación-sin-editar (solo riesgo bajo)
 * por encima del umbral configurado. No activa el autopiloto automáticamente
 * — solo indica si se le puede OFRECER al dueño activarlo.
 */
export async function computeAutopilotEligibility(business: Business): Promise<AutopilotEligibility> {
  const sendRecords = await prisma.sendRecord.findMany({
    where: { review: { businessId: business.id } },
    include: { review: true },
  });

  const totalResponded = sendRecords.length;
  const lowRiskRecords = sendRecords.filter((r) => r.review.riskLevel === "LOW");
  const lowRiskResponded = lowRiskRecords.length;
  const lowRiskApprovedWithoutEdit = lowRiskRecords.filter(
    (r) => r.approvedBy === "MANUAL" && !r.editedBeforeApprove
  ).length;

  const approvalRate = lowRiskResponded > 0 ? lowRiskApprovedWithoutEdit / lowRiskResponded : null;

  const meetsShadowThreshold = totalResponded >= business.shadowModeReviewThreshold;
  const meetsApprovalThreshold = approvalRate !== null && approvalRate >= business.autopilotApprovalThreshold;

  return {
    totalResponded,
    lowRiskResponded,
    lowRiskApprovedWithoutEdit,
    approvalRate,
    meetsShadowThreshold,
    meetsApprovalThreshold,
    eligible: meetsShadowThreshold && meetsApprovalThreshold && !business.autopilotEnabled,
  };
}

/**
 * Se llama después de cada aprobación manual. Si el negocio recién se
 * volvió elegible para autopiloto, crea una notificación (evitando duplicar
 * si ya hay una sin leer).
 */
export async function maybeNotifyAutopilotEligible(business: Business) {
  const eligibility = await computeAutopilotEligibility(business);
  if (!eligibility.eligible) return;

  const existing = await prisma.notification.findFirst({
    where: { businessId: business.id, type: "AUTOPILOT_SUGGESTED", read: false },
  });
  if (existing) return;

  await createNotification({
    businessId: business.id,
    type: "AUTOPILOT_SUGGESTED",
    title: "Ya puedes activar el autopiloto",
    body: `Llevas ${eligibility.totalResponded} respuestas enviadas y un ${Math.round(
      (eligibility.approvalRate ?? 0) * 100
    )}% de aprobación sin editar en reseñas de riesgo bajo. Puedes activar el autopiloto solo para riesgo bajo desde Ajustes.`,
  });
}
