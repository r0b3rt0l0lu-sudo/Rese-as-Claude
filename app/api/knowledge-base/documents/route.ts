import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentBusiness } from "@/lib/business";
import { logAudit } from "@/lib/audit";

// Se importa el módulo interno directamente (no el index.js del paquete):
// el index.js de pdf-parse tiene un bloque de "modo debug" que, cuando el
// bundler de Next.js lo empaqueta, intenta leer un PDF de prueba que no
// existe en el build final y revienta. El módulo interno no tiene ese código.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (data: Buffer) => Promise<{ text: string }>;

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_CHARS = 4000; // evita inflar cada prompt de la IA con documentos enormes

export async function POST(req: NextRequest) {
  const business = await requireCurrentBusiness();

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "El archivo supera el límite de 5MB." }, { status: 400 });
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isText = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
  if (!isPdf && !isText) {
    return NextResponse.json({ error: "Solo se aceptan archivos PDF (.pdf) o texto plano (.txt)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text: string;

  try {
    if (isPdf) {
      const data = await pdfParse(buffer);
      text = data.text;
    } else {
      text = buffer.toString("utf-8");
    }
  } catch (err) {
    console.error("Error extrayendo texto del documento:", err);
    return NextResponse.json({ error: "No se pudo leer el contenido del archivo." }, { status: 400 });
  }

  text = text.trim();
  if (text.length === 0) {
    return NextResponse.json({ error: "El archivo no tiene texto legible." }, { status: 400 });
  }

  const truncated = text.length > MAX_TEXT_CHARS;
  const finalText = truncated ? `${text.slice(0, MAX_TEXT_CHARS)}\n[...documento truncado...]` : text;

  const entry = await prisma.knowledgeBaseEntry.create({
    data: {
      businessId: business.id,
      type: "DOCUMENT",
      label: file.name,
      value: finalText,
    },
  });

  await logAudit({
    businessId: business.id,
    action: "DOCUMENT_UPLOADED",
    actor: "HUMAN",
    detail: `Documento "${file.name}" agregado a la base de conocimiento${truncated ? " (truncado por tamaño)" : ""}.`,
  });

  return NextResponse.json({ entry });
}
