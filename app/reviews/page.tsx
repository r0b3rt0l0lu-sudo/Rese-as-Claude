import Link from "next/link";
import { requireCurrentBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import RiskBadge from "@/components/RiskBadge";
import Stars from "@/components/Stars";

export const dynamic = "force-dynamic";

const RISK_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export default async function ReviewsInboxPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const business = await requireCurrentBusiness();
  const tab = searchParams.tab === "respondidas" ? "respondidas" : "pendientes";

  const reviews = await prisma.review.findMany({
    where: { businessId: business.id, status: tab === "pendientes" ? "PENDING" : "RESPONDED" },
    orderBy: { createdAt: "desc" },
    include: {
      responses: { orderBy: { version: "desc" }, take: 1 },
      sendRecords: true,
    },
  });

  if (tab === "pendientes") {
    reviews.sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]);
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Bandeja de aprobación"
        description="Revisa, edita o regenera cada respuesta antes de enviarla. Las de riesgo medio y alto siempre requieren tu aprobación explícita."
      />

      <div className="flex gap-2 mb-5">
        <Tab href="/reviews?tab=pendientes" active={tab === "pendientes"} label="Pendientes" />
        <Tab href="/reviews?tab=respondidas" active={tab === "respondidas"} label="Respondidas" />
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-brand-100 rounded-2xl shadow-sm px-5 py-10 text-center text-sm text-gray-400">
          {tab === "pendientes"
            ? "No hay reseñas pendientes por el momento."
            : "Todavía no has respondido ninguna reseña."}
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => {
            const latest = r.responses[0];
            const sendRecord = r.sendRecords[0];
            return (
              <li key={r.id} className="bg-white border border-brand-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{r.authorName}</span>
                      <Stars rating={r.rating} />
                      <RiskBadge level={r.riskLevel} />
                      {sendRecord?.approvedBy === "AUTOPILOT" && (
                        <span className="text-xs font-medium text-brand-600 bg-brand-50 rounded-full px-2 py-0.5">
                          🚀 Auto-aprobada
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{r.text}</p>
                    {latest && (
                      <p className="text-sm text-gray-400 mt-2 border-l-2 border-brand-100 pl-3 line-clamp-2">
                        {latest.content}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/reviews/${r.id}`}
                    className="shrink-0 rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                  >
                    {tab === "pendientes" ? "Revisar" : "Ver detalle"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Tab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-brand-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
      }`}
    >
      {label}
    </Link>
  );
}
