import type { RiskKeyword, RiskLevel } from "@prisma/client";

export interface TriageResult {
  level: RiskLevel;
  reasons: { keyword: string; category: string }[];
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // quita acentos para comparar de forma robusta
}

/**
 * Clasifica una reseña en riesgo bajo/medio/alto.
 * El riesgo alto (keywords sensibles) siempre gana, sin importar la calificación:
 * una reseña de 5 estrellas que mencione un accidente igual se marca como prioritaria.
 */
export function triageReview(
  rating: number,
  text: string,
  activeKeywords: Pick<RiskKeyword, "keyword" | "category">[]
): TriageResult {
  const normalizedText = normalize(text);

  const matches = activeKeywords.filter((k) => normalizedText.includes(normalize(k.keyword)));

  if (matches.length > 0) {
    return {
      level: "HIGH",
      reasons: matches.map((m) => ({ keyword: m.keyword, category: m.category })),
    };
  }

  if (rating >= 4) {
    return { level: "LOW", reasons: [] };
  }

  return { level: "MEDIUM", reasons: [] };
}
