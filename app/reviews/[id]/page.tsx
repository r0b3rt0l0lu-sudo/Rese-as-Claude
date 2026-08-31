import { notFound } from "next/navigation";
import { requireCurrentBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import ReviewDetail from "@/components/ReviewDetail";

export const dynamic = "force-dynamic";

export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  const business = await requireCurrentBusiness();

  const review = await prisma.review.findFirst({
    where: { id: params.id, businessId: business.id },
    include: {
      responses: { orderBy: { version: "asc" } },
      sendRecords: true,
    },
  });

  if (!review) notFound();

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <PageHeader title="Detalle de la reseña" description="Aprueba, edita o pide una regeneración antes de enviar." />
      <ReviewDetail review={review} />
    </div>
  );
}
