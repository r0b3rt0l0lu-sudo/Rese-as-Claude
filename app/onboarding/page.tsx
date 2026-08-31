import { redirect } from "next/navigation";
import { businessExists } from "@/lib/business";
import OnboardingForm from "@/components/OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  // Ya existe un negocio en esta instalación: no se puede volver a crear
  // otro (single-tenant). Manda a iniciar sesión en vez de re-onboardear.
  const exists = await businessExists();
  if (exists) redirect("/login");

  return <OnboardingForm />;
}
