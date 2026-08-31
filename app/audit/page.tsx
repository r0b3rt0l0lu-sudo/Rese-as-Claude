import Link from "next/link";
import { requireCurrentBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

const ACTOR_LABEL: Record<string, string> = {
  HUMAN: "👤 Dueño",
  AUTOPILOT: "🚀 Autopiloto",
  SYSTEM: "⚙️ Sistema",
};

export default async function AuditPage() {
  const business = await requireCurrentBusiness();
  const logs = await prisma.auditLog.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Historial auditable"
        description="Registro de qué se envió, cuándo, y si fue aprobado manualmente o por el autopiloto."
      />

      <div className="bg-white border border-brand-100 rounded-2xl shadow-sm">
        <ul className="divide-y divide-gray-100">
          {logs.map((log) => (
            <li key={log.id} className="px-5 py-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">{ACTOR_LABEL[log.actor] ?? log.actor}</span> · {log.action}
                </p>
                {log.detail && <p className="text-sm text-gray-500 mt-0.5">{log.detail}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString("es")}</p>
                {log.reviewId && (
                  <Link href={`/reviews/${log.reviewId}`} className="text-xs font-medium text-brand-600 hover:underline">
                    Ver reseña →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
        {logs.length === 0 && (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Todavía no hay actividad registrada.</p>
        )}
      </div>
    </div>
  );
}
