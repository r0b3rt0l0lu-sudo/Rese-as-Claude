import { requireCurrentBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import NotificationsList from "@/components/NotificationsList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const business = await requireCurrentBusiness();
  const notifications = await prisma.notification.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <PageHeader
        title="Notificaciones"
        description="Bandeja de pendientes dentro de la app. El canal WhatsApp queda preparado para una fase posterior."
      />
      <NotificationsList notifications={notifications} />
    </div>
  );
}
