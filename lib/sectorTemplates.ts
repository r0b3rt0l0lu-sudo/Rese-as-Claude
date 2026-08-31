// Plantillas por sector. El MVP se lanza con "restaurante" totalmente
// desarrollado y "generico" como base neutra; el resto queda como stub
// para que el modelo de datos y la UI ya soporten agregar sectores nuevos
// sin cambios estructurales.

export type Sector = "restaurante" | "peluqueria" | "taller" | "clinica" | "generico";

export interface SectorTemplate {
  label: string;
  brandTonePlaceholder: string;
  strengthsPlaceholder: string;
  policyPlaceholder: string;
  neverSayPlaceholder: string;
  exampleReviews: { rating: number; text: string }[];
}

export const SECTOR_TEMPLATES: Record<Sector, SectorTemplate> = {
  restaurante: {
    label: "Restaurante",
    brandTonePlaceholder:
      "Cercano, cálido y agradecido. Evitamos sonar corporativos; hablamos como el dueño del local.",
    strengthsPlaceholder:
      "Ingredientes frescos y de proveedores locales, recetas familiares, ambiente acogedor para grupos y familias.",
    policyPlaceholder:
      "Si un cliente tuvo un problema con un plato, lo invitamos a escribirnos por privado para compensarlo (no prometemos reembolsos en la respuesta pública).",
    neverSayPlaceholder:
      "Nunca admitir públicamente intoxicación alimentaria ni prometer reembolsos o descuentos específicos en la respuesta pública.",
    exampleReviews: [
      { rating: 5, text: "La comida excelente y el servicio muy amable, volveremos seguro." },
      { rating: 2, text: "Tardaron más de una hora en traer el plato principal y llegó frío." },
      { rating: 1, text: "Mi familia se intoxicó después de comer ahí, vamos a poner una demanda." },
    ],
  },
  peluqueria: {
    label: "Peluquería / salón de belleza",
    brandTonePlaceholder: "Profesional, moderno y cercano, como hablarle a una clienta habitual.",
    strengthsPlaceholder:
      "Estilistas certificados, productos de marca profesional, asesoría personalizada antes de cada servicio.",
    policyPlaceholder:
      "Si el resultado no fue el esperado, ofrecemos una cita de retoque gratuita dentro de los 7 días siguientes.",
    neverSayPlaceholder: "Nunca prometer resultados exactos de color/corte en la respuesta pública.",
    exampleReviews: [
      { rating: 5, text: "Amo cómo me dejaron el cabello, súper profesionales." },
      { rating: 2, text: "Llegué a mi hora y me atendieron 40 minutos tarde." },
      {
        rating: 1,
        text: "Me hicieron una decoloración y terminé con el cuero cabelludo irritado, esto es una negligencia y voy a poner una denuncia.",
      },
    ],
  },
  taller: {
    label: "Taller mecánico",
    brandTonePlaceholder: "Directo, honesto y técnico pero sin tecnicismos innecesarios.",
    strengthsPlaceholder:
      "Diagnóstico transparente antes de cotizar, repuestos originales, mecánicos con más de 10 años de experiencia.",
    policyPlaceholder: "Toda reparación tiene 30 días de garantía sobre la pieza y mano de obra.",
    neverSayPlaceholder: "Nunca admitir responsabilidad por daños al vehículo sin revisión previa del caso.",
    exampleReviews: [
      { rating: 5, text: "Diagnóstico rápido y precio justo, muy recomendable." },
      { rating: 2, text: "Me devolvieron el auto con un rayón nuevo que no tenía antes." },
      {
        rating: 1,
        text: "Nos devolvieron el carro con los frenos fallando y casi tenemos un accidente en la carretera, esto pudo haber sido una tragedia.",
      },
    ],
  },
  clinica: {
    label: "Clínica / consultorio",
    brandTonePlaceholder: "Empático, profesional y tranquilizador.",
    strengthsPlaceholder:
      "Equipo médico especializado, tiempos de espera cortos, seguimiento personalizado después de cada consulta.",
    policyPlaceholder: "Las citas se pueden reprogramar hasta con 24 horas de anticipación sin costo.",
    neverSayPlaceholder:
      "Nunca dar diagnósticos, confirmar tratamientos ni discutir información médica de un paciente en una respuesta pública.",
    exampleReviews: [
      { rating: 5, text: "El doctor muy atento y me explicó todo con paciencia." },
      { rating: 2, text: "Tuve que esperar más de una hora para mi cita." },
      {
        rating: 1,
        text: "Mi tratamiento salió mal y ahora tengo complicaciones, voy a contactar a mi abogado.",
      },
    ],
  },
  generico: {
    label: "Genérico (sin plantilla específica)",
    brandTonePlaceholder: "Profesional y cercano.",
    strengthsPlaceholder: "Describe aquí lo que hace destacar a tu negocio frente a la competencia.",
    policyPlaceholder: "Describe aquí tu política de devoluciones, cancelaciones o garantías.",
    neverSayPlaceholder: "Describe aquí cosas que la IA nunca debe prometer o decir.",
    exampleReviews: [
      { rating: 5, text: "Excelente atención, muy recomendado." },
      { rating: 2, text: "El servicio tardó más de lo prometido." },
      {
        rating: 1,
        text: "El personal fue muy agresivo conmigo, sentí que me amenazaron, voy a poner una denuncia.",
      },
    ],
  },
};

export const SECTOR_OPTIONS: { value: Sector; label: string }[] = Object.entries(SECTOR_TEMPLATES).map(
  ([value, tpl]) => ({ value: value as Sector, label: tpl.label })
);
