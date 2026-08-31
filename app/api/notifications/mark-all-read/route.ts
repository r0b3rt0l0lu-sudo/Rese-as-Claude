import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";

export async function POST() {
  const business = await requireCurrentBusiness();
  await prisma.notification.updateMany({
    where: { businessId: business.id, read: false },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}
