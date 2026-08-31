import { requireCurrentBusiness } from "@/lib/business";
import { SECTOR_TEMPLATES, type Sector } from "@/lib/sectorTemplates";
import PageHeader from "@/components/PageHeader";
import SimulateReviewForm from "@/components/SimulateReviewForm";

export const dynamic = "force-dynamic";

export default async function SimulateReviewPage() {
  const business = await requireCurrentBusiness();
  const examples = SECTOR_TEMPLATES[business.sector as Sector]?.exampleReviews ?? SECTOR_TEMPLATES.generico.exampleReviews;

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <PageHeader
        title="Simular reseña entrante"
        description="Como todavía no está conectada la API real de Google, usa este formulario para probar el flujo completo: triaje de riesgo, generación de respuesta y aprobación."
      />
      <SimulateReviewForm examples={examples} />
    </div>
  );
}
