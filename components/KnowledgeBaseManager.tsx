"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Entry {
  id: string;
  type: "ONBOARDING" | "POLICY" | "NEVER_SAY" | "LEARNED" | "DOCUMENT";
  label: string;
  value: string;
  active: boolean;
  sourceReviewId: string | null;
  createdAt: string | Date;
}

const TYPE_LABELS: Record<Entry["type"], string> = {
  ONBOARDING: "Base del onboarding",
  POLICY: "Política",
  NEVER_SAY: "Nunca decir",
  LEARNED: "Aprendida (feedback / edición)",
  DOCUMENT: "Documentos subidos",
};

const TYPE_ICON: Record<Entry["type"], string> = {
  ONBOARDING: "📋",
  POLICY: "📜",
  NEVER_SAY: "🚫",
  LEARNED: "✨",
  DOCUMENT: "📄",
};

export default function KnowledgeBaseManager({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<Entry["type"]>("POLICY");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/knowledge-base", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, label, value }),
    });
    setLabel("");
    setValue("");
    setSubmitting(false);
    router.refresh();
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch("/api/knowledge-base", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    router.refresh();
  }

  const grouped = (["ONBOARDING", "POLICY", "NEVER_SAY", "LEARNED", "DOCUMENT"] as const).map((t) => ({
    type: t,
    items: entries.filter((e) => e.type === t),
  }));

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white border border-brand-100 rounded-2xl shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-900 mb-3">Agregar entrada manualmente</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as Entry["type"])}
          >
            <option value="POLICY">Política</option>
            <option value="NEVER_SAY">Nunca decir</option>
            <option value="ONBOARDING">Base del onboarding</option>
          </select>
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
            placeholder="Etiqueta (ej: Horario de atención)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <textarea
          className="w-full mt-3 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          rows={2}
          placeholder="Contenido"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting || !label || !value}
          className="mt-3 rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
        >
          Agregar
        </button>
      </form>

      {grouped.map((group) => (
        <div key={group.type} className="bg-white border border-brand-100 rounded-2xl shadow-sm">
          <div
            className={`px-5 py-3 border-b border-gray-100 flex items-center gap-2 ${
              group.type === "LEARNED" ? "bg-accent-50/60" : ""
            }`}
          >
            <span aria-hidden>{TYPE_ICON[group.type]}</span>
            <h3
              className={`font-semibold text-sm ${group.type === "LEARNED" ? "text-accent-700" : "text-gray-900"}`}
            >
              {TYPE_LABELS[group.type]}
            </h3>
          </div>
          {group.items.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-400">Sin entradas todavía.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {group.items.map((item) => (
                <li key={item.id} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div className={item.active ? "" : "opacity-40"}>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className={`text-sm text-gray-500 ${item.type === "DOCUMENT" ? "line-clamp-3" : ""}`}>
                      {item.value}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.id, !item.active)}
                    className="shrink-0 text-xs font-medium rounded-full border border-gray-200 px-2.5 py-1 text-gray-500 hover:border-brand-300 hover:text-brand-700"
                  >
                    {item.active ? "Desactivar" : "Activar"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
