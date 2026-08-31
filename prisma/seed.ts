// Script opcional de demo: crea un negocio de ejemplo (restaurante) con
// reseñas de las tres categorías de riesgo, para explorar la app sin pasar
// por el onboarding manualmente. No se ejecuta automáticamente — es un
// atajo para pruebas (`npm run db:seed`).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_RISK_KEYWORDS } from "../lib/riskKeywords";
import { SECTOR_TEMPLATES } from "../lib/sectorTemplates";
import { triageReview } from "../lib/triage";
import { generateResponse } from "../lib/ai";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@vigilia.app";
const DEMO_PASSWORD = "demo1234";

async function main() {
  const existing = await prisma.business.findFirst();
  if (existing) {
    console.log("Ya existe un negocio configurado, no se hace nada. Borra prisma/dev.db si quieres reiniciar.");
    return;
  }

  const template = SECTOR_TEMPLATES.restaurante;
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const business = await prisma.business.create({
    data: {
      name: "Restaurante La Marina (demo)",
      sector: "restaurante",
      brandTone: template.brandTonePlaceholder,
      responderName: "María, dueña de La Marina",
      languages: "es",
      email: DEMO_EMAIL,
      passwordHash,
      knowledgeBase: {
        create: [
          { type: "ONBOARDING", label: "Tono de marca", value: template.brandTonePlaceholder },
          { type: "POLICY", label: "Política de devoluciones/cancelaciones", value: template.policyPlaceholder },
          { type: "NEVER_SAY", label: "Cosas que la IA nunca debe prometer o decir", value: template.neverSayPlaceholder },
        ],
      },
      riskKeywords: {
        create: DEFAULT_RISK_KEYWORDS.map((k) => ({ keyword: k.keyword, category: k.category })),
      },
    },
  });

  const kbEntries = await prisma.knowledgeBaseEntry.findMany({ where: { businessId: business.id } });
  const riskKeywords = await prisma.riskKeyword.findMany({ where: { businessId: business.id } });

  const demoAuthors = ["Carla Pérez", "Jorge Ruiz", "Ana Gómez"];

  for (let i = 0; i < template.exampleReviews.length; i++) {
    const example = template.exampleReviews[i];
    const authorName = demoAuthors[i] ?? `Cliente ${i + 1}`;
    const triage = triageReview(example.rating, example.text, riskKeywords);

    const review = await prisma.review.create({
      data: {
        businessId: business.id,
        authorName,
        rating: example.rating,
        text: example.text,
        riskLevel: triage.level,
        riskReasons: JSON.stringify(triage.reasons),
      },
    });

    const content = await generateResponse(
      {
        business,
        reviewRating: example.rating,
        reviewText: example.text,
        reviewAuthor: authorName,
        kbEntries,
      },
      triage.level
    );

    await prisma.generatedResponse.create({
      data: { reviewId: review.id, version: 1, content, origin: "AI" },
    });
  }

  console.log(`Negocio de demo "${business.name}" creado con ${template.exampleReviews.length} reseñas de ejemplo.`);
  console.log(`Inicia sesión con: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
