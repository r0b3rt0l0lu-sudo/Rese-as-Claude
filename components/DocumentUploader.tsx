"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/knowledge-base/documents", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo subir el documento.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-5 mb-6">
      <p className="text-sm font-semibold text-gray-900 mb-1">Subir documento del negocio</p>
      <p className="text-xs text-brand-300 mb-3">
        PDF o texto plano (.txt) — un menú, catálogo, lista de precios, políticas escritas, etc. El texto se
        extrae y queda disponible como contexto adicional para la IA al generar respuestas.
      </p>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-accent-300 px-4 py-2 text-sm font-medium text-accent-700 hover:bg-accent-50 transition-colors">
          {uploading ? "Subiendo..." : "Elegir archivo"}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
        {fileName && !error && !uploading && <span className="text-xs text-brand-300">✓ {fileName} subido</span>}
      </div>
      {error && <p className="text-sm text-risk-high mt-2">{error}</p>}
    </div>
  );
}
