import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const business = await requireCurrentBusiness();

  const notification = await prisma.notification.findFirst({
    where: { id: params.id, businessId: business.id },
  });
  if (!notification) return NextResponse.json({ error: "No encontrada." }, { status: 404 });

  await prisma.notification.update({ where: { id: notification.id }, data: { read: true } });

  return NextResponse.json({ ok: true });
}
