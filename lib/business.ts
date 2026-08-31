import { prisma } from "./prisma";

/**
 * El MVP opera con un solo negocio por instalación (multi-usuario/roles
 * queda fuera de alcance). Este helper centraliza esa suposición para que
 * sea fácil de cambiar a multi-tenant más adelante.
 */
export async function getCurrentBusiness() {
  return prisma.business.findFirst({ orderBy: { createdAt: "asc" } });
}

export async function requireCurrentBusiness() {
  const business = await getCurrentBusiness();
  if (!business) {
    throw new Error("No hay ningún negocio configurado todavía. Completa el onboarding primero.");
  }
  return business;
}
