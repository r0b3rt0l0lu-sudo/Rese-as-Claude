import { prisma } from "./prisma";
import type { AuditActor } from "@prisma/client";

export async function logAudit(params: {
  businessId: string;
  action: string;
  actor: AuditActor;
  reviewId?: string;
  detail?: string;
}) {
  return prisma.auditLog.create({
    data: {
      businessId: params.businessId,
      action: params.action,
      actor: params.actor,
      reviewId: params.reviewId,
      detail: params.detail,
    },
  });
}
