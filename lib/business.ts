import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

/**
 * El MVP opera con un solo negocio por instalación (multi-usuario/roles
 * queda fuera de alcance), pero cada instalación ahora requiere iniciar
 * sesión: estas funciones devuelven el negocio del dueño autenticado, no
 * "el primero que exista".
 */
export async function getCurrentBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return prisma.business.findUnique({ where: { id: session.user.businessId } });
}

export async function requireCurrentBusiness() {
  const business = await getCurrentBusiness();
  if (!business) {
    throw new Error("No autenticado o negocio no encontrado.");
  }
  return business;
}

/**
 * Chequeo de existencia sin depender de la sesión — usado por las páginas
 * de /login y /onboarding para decidir a cuál de las dos mandar a alguien
 * que todavía no inició sesión.
 */
export async function businessExists(): Promise<boolean> {
  const count = await prisma.business.count();
  return count > 0;
}
