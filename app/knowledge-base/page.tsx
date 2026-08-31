import { requireCurrentBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import KnowledgeBaseManager from "@/components/KnowledgeBaseManager";
import DocumentUploader from "@/components/DocumentUploader";

export const dynamic = "force-dynamic";

export default async function KnowledgeBasePage() {
  const business = await requireCurrentBusiness();
  const entries = await prisma.knowledgeBaseEntry.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Base de conocimiento"
        description="Todo lo que la IA usa para responder: tu onboarding, tus políticas, lo que nunca debe decir, y lo que ha aprendido de tus ediciones y feedback."
      />
      <DocumentUploader />
      <KnowledgeBaseManager entries={entries} />
    </div>
  );
}
