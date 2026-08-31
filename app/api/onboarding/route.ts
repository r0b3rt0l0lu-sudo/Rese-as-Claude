import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RISK_KEYWORDS } from "@/lib/riskKeywords";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2),
  sector: z.enum(["restaurante", "peluqueria", "taller", "clinica", "generico"]),
  brandTone: z.string().min(3),
  strengths: z.string().optional(),
  responderName: z.string().min(2),
  languages: z.array(z.string()).min(1),
  policy: z.string().min(3),
  neverSay: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const existing = await prisma.business.findFirst();
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe un negocio configurado en esta instalación." },
      { status: 409 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existingEmail = await prisma.business.findUnique({ where: { email: data.email } });
  if (existingEmail) {
    return NextResponse.json({ error: "Ese correo ya está en uso." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const business = await prisma.business.create({
    data: {
      name: data.name,
      sector: data.sector,
      brandTone: data.brandTone,
      responderName: data.responderName,
      languages: data.languages.join(","),
      email: data.email,
      passwordHash,
      knowledgeBase: {
        create: [
          { type: "ONBOARDING", label: "Tono de marca", value: data.brandTone },
          { type: "ONBOARDING", label: "Nombre/firma de quien responde", value: data.responderName },
          ...(data.strengths && data.strengths.trim().length > 0
            ? [{ type: "ONBOARDING" as const, label: "Fortalezas del negocio", value: data.strengths.trim() }]
            : []),
          { type: "POLICY", label: "Política de devoluciones/cancelaciones", value: data.policy },
          { type: "NEVER_SAY", label: "Cosas que la IA nunca debe prometer o decir", value: data.neverSay },
        ],
      },
      riskKeywords: {
        create: DEFAULT_RISK_KEYWORDS.map((k) => ({ keyword: k.keyword, category: k.category })),
      },
    },
  });

  await logAudit({
    businessId: business.id,
    action: "BUSINESS_CREATED",
    actor: "HUMAN",
    detail: `Negocio "${business.name}" (${business.sector}) configurado vía onboarding.`,
  });

  return NextResponse.json({ business });
}
