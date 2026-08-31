import Link from "next/link";
import { requireCurrentBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import { computeAutopilotEligibility } from "@/lib/autopilot";
import PageHeader from "@/components/PageHeader";
import RiskBadge from "@/components/RiskBadge";
import Stars from "@/components/Stars";
import AutopilotBanner from "@/components/AutopilotBanner";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const business = await requireCurrentBusiness();

  const [pendingLow, pendingMedium, pendingHigh, respondedCount, recentPending, eligibility] = await Promise.all([
    prisma.review.count({ where: { businessId: business.id, status: "PENDING", riskLevel: "LOW" } }),
    prisma.review.count({ where: { businessId: business.id, status: "PENDING", riskLevel: "MEDIUM" } }),
    prisma.review.count({ where: { businessId: business.id, status: "PENDING", riskLevel: "HIGH" } }),
    prisma.review.count({ where: { businessId: business.id, status: "RESPONDED" } }),
    prisma.review.findMany({
      where: { businessId: business.id, status: "PENDING" },
      orderBy: [{ riskLevel: "asc" }, { createdAt: "desc" }],
      take: 5,
      include: { responses: { orderBy: { version: "desc" }, take: 1 } },
    }),
    computeAutopilotEligibility(business),
  ]);

  const totalPending = pendingLow + pendingMedium + pendingHigh;

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <PageHeader
        title={`Hola, ${business.name} 👋`}
        description="Resumen de tus reseñas y el estado de tu asistente de respuestas."
        action={
          <Link
            href="/reviews/simulate"
            className="inline-flex items-center rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 transition-colors"
          >
            + Recibir reseña de prueba
          </Link>
        }
      />

      {!business.autopilotEnabled && (
        <AutopilotBanner eligibility={eligibility} />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pendientes" value={totalPending} tone="accent" icon="📥" />
        <StatCard label="Riesgo alto sin responder" value={pendingHigh} tone="high" icon="🚨" />
        <StatCard label="Riesgo medio sin responder" value={pendingMedium} tone="medium" icon="⚠️" />
        <StatCard label="Respondidas en total" value={respondedCount} tone="low" icon="✅" />
      </div>

      <div className="bg-white border border-brand-100 rounded-2xl shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Pendientes más urgentes</h2>
          <Link href="/reviews" className="text-sm text-accent-700 font-medium hover:underline">
            Ver bandeja completa →
          </Link>
        </div>
        {recentPending.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">
            No hay reseñas pendientes. Usa &ldquo;Recibir reseña de prueba&rdquo; para simular una.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentPending.map((r) => (
              <li key={r.id}>
                <Link href={`/reviews/${r.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-brand-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{r.authorName}</span>
                      <Stars rating={r.rating} />
                    </div>
                    <p className="text-sm text-gray-500 truncate max-w-md">{r.text}</p>
                  </div>
                  <RiskBadge level={r.riskLevel} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "accent" | "high" | "medium" | "low";
  icon: string;
}) {
  const classes: Record<string, string> = {
    accent: "text-accent-700 bg-accent-50",
    high: "text-risk-high bg-red-50",
    medium: "text-risk-medium bg-amber-50",
    low: "text-risk-low bg-emerald-50",
  };
  const iconBg: Record<string, string> = {
    accent: "bg-accent-100",
    high: "bg-red-100",
    medium: "bg-amber-100",
    low: "bg-emerald-100",
  };
  return (
    <div className={`rounded-xl p-4 ${classes[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-serif font-semibold">{value}</p>
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${iconBg[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="text-xs font-medium mt-1">{label}</p>
    </div>
  );
}
