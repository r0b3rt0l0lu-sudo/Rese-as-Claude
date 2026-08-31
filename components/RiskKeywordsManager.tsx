"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Keyword {
  id: string;
  keyword: string;
  category: string;
  enabled: boolean;
}

const CATEGORIES = [
  { value: "salud", label: "Salud / intoxicación" },
  { value: "discriminacion", label: "Discriminación" },
  { value: "legal", label: "Amenaza legal" },
  { value: "acoso", label: "Acoso / amenazas" },
  { value: "seguridad", label: "Seguridad" },
  { value: "menores", label: "Menores" },
  { value: "otro", label: "Otro" },
];

export default function RiskKeywordsManager({ keywords }: { keywords: Keyword[] }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("otro");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/settings/risk-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, category }),
    });
    setKeyword("");
    setSubmitting(false);
    router.refresh();
  }

  async function handleToggle(id: string, enabled: boolean) {
    await fetch("/api/settings/risk-keywords", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
    router.refresh();
  }

  return (
    <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-5">
      <h3 className="font-semibold text-gray-900">Palabras clave de riesgo alto</h3>
      <p className="text-sm text-gray-500 mt-0.5 mb-4">
        Cualquier reseña que mencione una de estas palabras se marca como riesgo alto y prioritaria, sin importar
        la calificación.
      </p>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-4">
        <input
          className="flex-1 min-w-[10rem] rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Nueva palabra o frase"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting || keyword.trim().length < 2}
          className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
        >
          Agregar
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto">
        {keywords.map((k) => (
          <button
            key={k.id}
            onClick={() => handleToggle(k.id, !k.enabled)}
            className={`text-xs rounded-full px-2.5 py-1 border ${
              k.enabled
                ? "bg-red-50 text-risk-high border-red-200"
                : "bg-gray-50 text-gray-400 border-gray-200 line-through"
            }`}
            title={k.enabled ? "Click para desactivar" : "Click para activar"}
          >
            {k.keyword}
          </button>
        ))}
      </div>
    </div>
  );
}
