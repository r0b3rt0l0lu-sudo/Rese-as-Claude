import { requireCurrentBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import { computeAutopilotEligibility } from "@/lib/autopilot";
import { isAiConfigured } from "@/lib/ai";
import PageHeader from "@/components/PageHeader";
import AutopilotControl from "@/components/AutopilotControl";
import ThresholdsForm from "@/components/ThresholdsForm";
import RiskKeywordsManager from "@/components/RiskKeywordsManager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const business = await requireCurrentBusiness();
  const [eligibility, riskKeywords] = await Promise.all([
    computeAutopilotEligibility(business),
    prisma.riskKeyword.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
      <PageHeader title="Ajustes" description="Autopiloto, umbrales de confianza y palabras clave de riesgo." />

      <div
        className={`rounded-xl px-4 py-3 text-sm ${
          isAiConfigured() ? "bg-emerald-50 text-risk-low border border-emerald-200" : "bg-amber-50 text-risk-medium border border-amber-200"
        }`}
      >
        {isAiConfigured()
          ? "✅ Generación con IA real (Claude) activa."
          : "⚠️ No hay ANTHROPIC_API_KEY configurada — se están usando respuestas de ejemplo (modo mock) para que puedas probar el flujo. Agrega tu API key en el archivo .env para generación real."}
      </div>

      <AutopilotControl autopilotEnabled={business.autopilotEnabled} eligibility={eligibility} />
      <ThresholdsForm
        shadowModeReviewThreshold={business.shadowModeReviewThreshold}
        autopilotApprovalThreshold={business.autopilotApprovalThreshold}
      />
      <RiskKeywordsManager keywords={riskKeywords} />
    </div>
  );
}
