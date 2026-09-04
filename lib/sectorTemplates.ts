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
      { rating: 5, text: "Un lugar increíble, el mejor plato de la ciudad y el mesero súper atento." },
      { rating: 5, text: "Fuimos en familia y todos quedamos encantados, se nota que cuidan cada detalle." },
      { rating: 2, text: "Tardaron más de una hora en traer el plato principal y llegó frío." },
      { rating: 2, text: "El sabor estuvo bien pero el lugar estaba sucio y el mesero fue algo cortante." },
      { rating: 2, text: "Nos cobraron de más y cuando lo señalamos nadie nos dio una explicación clara." },
      { rating: 1, text: "Mi familia se intoxicó después de comer ahí, vamos a poner una demanda." },
      { rating: 1, text: "Encontramos un insecto en la comida, es una falta de higiene gravísima, voy a denunciarlos." },
      { rating: 1, text: "Un mesero fue agresivo con mi pareja, esto es un caso claro de discriminación." },
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
      { rating: 5, text: "La mejor asesoría de color que me han dado, quedé feliz con el resultado." },
      { rating: 5, text: "Ambiente muy agradable y el estilista escuchó exactamente lo que quería." },
      { rating: 2, text: "Llegué a mi hora y me atendieron 40 minutos tarde." },
      { rating: 2, text: "El corte quedó disparejo y tuve que pedir que lo arreglaran." },
      { rating: 2, text: "Buena atención pero el precio final fue más alto de lo que me habían dicho." },
      {
        rating: 1,
        text: "Me hicieron una decoloración y terminé con el cuero cabelludo irritado, esto es una negligencia y voy a poner una denuncia.",
      },
      {
        rating: 1,
        text: "Me quemaron el cabello con un químico mal aplicado, voy a buscar un abogado por esto.",
      },
      {
        rating: 1,
        text: "La estilista tuvo un trato humillante conmigo enfrente de otras clientas, pienso denunciarlo.",
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
      { rating: 5, text: "Me explicaron todo con transparencia antes de cotizar, se ganaron mi confianza." },
      { rating: 5, text: "Repararon mi auto el mismo día y quedó funcionando perfecto." },
      { rating: 2, text: "Me devolvieron el auto con un rayón nuevo que no tenía antes." },
      { rating: 2, text: "La reparación tardó el doble de lo prometido y nadie me avisó del retraso." },
      { rating: 2, text: "Cotizaron un precio y al final cobraron más sin explicar el porqué." },
      {
        rating: 1,
        text: "Nos devolvieron el carro con los frenos fallando y casi tenemos un accidente en la carretera, esto pudo haber sido una tragedia.",
      },
      {
        rating: 1,
        text: "Usaron una pieza que no era original sin avisarme, esto es un fraude y voy a poner una denuncia.",
      },
      {
        rating: 1,
        text: "El mecánico se puso agresivo cuando reclamé, sentí que me amenazó, voy a contactar a un abogado.",
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
      { rating: 5, text: "El seguimiento después de mi consulta fue excelente, se nota que les importa el paciente." },
      { rating: 5, text: "Tiempos de espera muy cortos y el equipo médico muy profesional." },
      { rating: 2, text: "Tuve que esperar más de una hora para mi cita." },
      { rating: 2, text: "El doctor se veía apurado y no sentí que me explicara bien el diagnóstico." },
      { rating: 2, text: "Me reagendaron la cita dos veces sin avisarme con tiempo." },
      {
        rating: 1,
        text: "Mi tratamiento salió mal y ahora tengo complicaciones, voy a contactar a mi abogado.",
      },
      {
        rating: 1,
        text: "Me dieron un diagnóstico equivocado y esto empeoró mi condición, esto es mala praxis.",
      },
      {
        rating: 1,
        text: "Filtraron mis resultados médicos a otra persona, esto es una violación grave a mi privacidad.",
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
      { rating: 5, text: "Superó mis expectativas, el equipo fue muy atento en todo momento." },
      { rating: 5, text: "Muy buena relación calidad-precio, volveré sin duda." },
      { rating: 2, text: "El servicio tardó más de lo prometido." },
      { rating: 2, text: "La atención fue correcta pero el lugar necesita más orden y limpieza." },
      { rating: 2, text: "Cobraron un extra que no me habían mencionado antes." },
      {
        rating: 1,
        text: "El personal fue muy agresivo conmigo, sentí que me amenazaron, voy a poner una denuncia.",
      },
      {
        rating: 1,
        text: "Tuve un accidente por negligencia del personal y nadie se hizo responsable, voy a contactar a un abogado.",
      },
      {
        rating: 1,
        text: "Me discriminaron abiertamente frente a otros clientes, esto es intolerable.",
      },
    ],
  },
};

export const SECTOR_OPTIONS: { value: Sector; label: string }[] = Object.entries(SECTOR_TEMPLATES).map(
  ([value, tpl]) => ({ value: value as Sector, label: tpl.label })
);
