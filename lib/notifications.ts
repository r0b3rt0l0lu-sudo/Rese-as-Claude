import { prisma } from "./prisma";

export async function createNotification(params: {
  businessId: string;
  type: "HIGH_RISK_REVIEW" | "PENDING_APPROVAL" | "AUTOPILOT_SUGGESTED" | "RESPONSE_REJECTED";
  title: string;
  body: string;
  reviewId?: string;
}) {
  // Canal IN_APP en el MVP. El campo "channel" ya permite agregar "WHATSAPP"
  // en una fase posterior sin cambios de modelo de datos.
  return prisma.notification.create({
    data: {
      businessId: params.businessId,
      channel: "IN_APP",
      type: params.type,
      title: params.title,
      body: params.body,
      reviewId: params.reviewId,
    },
  });
}
