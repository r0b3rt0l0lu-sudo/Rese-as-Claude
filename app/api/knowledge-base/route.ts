import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  type: z.enum(["ONBOARDING", "POLICY", "NEVER_SAY", "LEARNED"]),
  label: z.string().min(2),
  value: z.string().min(2),
});

export async function POST(req: NextRequest) {
  const business = await requireCurrentBusiness();
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await prisma.knowledgeBaseEntry.create({
    data: { businessId: business.id, ...parsed.data },
  });

  await logAudit({
    businessId: business.id,
    action: "KNOWLEDGE_BASE_ENTRY_ADDED",
    actor: "HUMAN",
    detail: `"${parsed.data.label}" agregada manualmente a la base de conocimiento.`,
  });

  return NextResponse.json({ entry });
}

const toggleSchema = z.object({ id: z.string(), active: z.boolean() });

export async function PATCH(req: NextRequest) {
  const business = await requireCurrentBusiness();
  const body = await req.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await prisma.knowledgeBaseEntry.findFirst({
    where: { id: parsed.data.id, businessId: business.id },
  });
  if (!entry) return NextResponse.json({ error: "No encontrada." }, { status: 404 });

  await prisma.knowledgeBaseEntry.update({ where: { id: entry.id }, data: { active: parsed.data.active } });

  return NextResponse.json({ ok: true });
}
