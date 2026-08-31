import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  keyword: z.string().min(2),
  category: z.enum(["salud", "discriminacion", "legal", "acoso", "seguridad", "menores", "otro"]),
});

export async function POST(req: NextRequest) {
  const business = await requireCurrentBusiness();
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const keyword = await prisma.riskKeyword.create({
    data: { businessId: business.id, keyword: parsed.data.keyword, category: parsed.data.category },
  });

  await logAudit({
    businessId: business.id,
    action: "RISK_KEYWORD_ADDED",
    actor: "HUMAN",
    detail: `Palabra clave agregada: "${parsed.data.keyword}" (${parsed.data.category}).`,
  });

  return NextResponse.json({ keyword });
}

const toggleSchema = z.object({ id: z.string(), enabled: z.boolean() });

export async function PATCH(req: NextRequest) {
  const business = await requireCurrentBusiness();
  const body = await req.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const keyword = await prisma.riskKeyword.findFirst({
    where: { id: parsed.data.id, businessId: business.id },
  });
  if (!keyword) return NextResponse.json({ error: "No encontrada." }, { status: 404 });

  await prisma.riskKeyword.update({ where: { id: keyword.id }, data: { enabled: parsed.data.enabled } });

  await logAudit({
    businessId: business.id,
    action: parsed.data.enabled ? "RISK_KEYWORD_ENABLED" : "RISK_KEYWORD_DISABLED",
    actor: "HUMAN",
    detail: `Palabra clave "${keyword.keyword}".`,
  });

  return NextResponse.json({ ok: true });
}
