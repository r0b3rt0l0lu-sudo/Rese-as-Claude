// Palabras/patrones clave por defecto para detectar riesgo ALTO.
// Configurables y ampliables por negocio (se cargan en RiskKeyword al
// crear el negocio, y se pueden editar/agregar desde Ajustes).

export interface DefaultRiskKeyword {
  keyword: string;
  category: "salud" | "discriminacion" | "legal" | "acoso" | "seguridad" | "menores";
}

export const DEFAULT_RISK_KEYWORDS: DefaultRiskKeyword[] = [
  // Salud / intoxicación
  { keyword: "intoxicaci", category: "salud" },
  { keyword: "envenen", category: "salud" },
  { keyword: "hospital", category: "salud" },
  { keyword: "vomit", category: "salud" },
  { keyword: "alergia", category: "salud" },
  { keyword: "alérgic", category: "salud" },
  { keyword: "enferm", category: "salud" },

  // Discriminación
  { keyword: "discrimin", category: "discriminacion" },
  { keyword: "racis", category: "discriminacion" },
  { keyword: "xenófob", category: "discriminacion" },
  { keyword: "homofób", category: "discriminacion" },
  { keyword: "machis", category: "discriminacion" },

  // Amenazas legales
  { keyword: "demanda", category: "legal" },
  { keyword: "abogado", category: "legal" },
  { keyword: "denuncia", category: "legal" },
  { keyword: "legal", category: "legal" },
  { keyword: "juicio", category: "legal" },
  { keyword: "fiscal", category: "legal" },

  // Acoso
  { keyword: "acoso", category: "acoso" },
  { keyword: "acosó", category: "acoso" },
  { keyword: "abuso", category: "acoso" },
  { keyword: "abusó", category: "acoso" },
  { keyword: "amenaz", category: "acoso" },

  // Seguridad
  { keyword: "robo", category: "seguridad" },
  { keyword: "robaron", category: "seguridad" },
  { keyword: "asalto", category: "seguridad" },
  { keyword: "incendio", category: "seguridad" },
  { keyword: "accidente", category: "seguridad" },
  { keyword: "arma", category: "seguridad" },
  { keyword: "violencia", category: "seguridad" },

  // Menores
  { keyword: "menor de edad", category: "menores" },
  { keyword: "niño", category: "menores" },
  { keyword: "niña", category: "menores" },
  { keyword: "infantil", category: "menores" },
];
