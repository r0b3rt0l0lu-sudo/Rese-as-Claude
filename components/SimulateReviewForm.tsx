"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuickExample {
  rating: number;
  text: string;
}

export default function SimulateReviewForm({ examples }: { examples: QuickExample[] }) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, rating, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear la reseña.");
      router.push(`/reviews/${data.review.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-brand-100 rounded-2xl shadow-sm p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del autor de la reseña</label>
        <input
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Ej: Carla Pérez"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className={`h-10 w-10 rounded-lg text-sm font-semibold border transition-colors ${
                rating === n ? "bg-brand-500 text-white border-brand-500" : "border-gray-300 text-gray-600"
              }`}
            >
              {n}★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Texto de la reseña</label>
        <textarea
          required
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe o pega el texto de una reseña..."
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {examples.map((ex, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                setRating(ex.rating);
                setText(ex.text);
              }}
              className={`text-xs rounded-full border px-3 py-1 transition-colors ${
                ex.rating <= 1
                  ? "border-accent-200 text-accent-700 hover:border-accent-400 hover:bg-accent-50"
                  : "border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              Ejemplo {ex.rating}★{ex.rating <= 1 ? " (riesgo alto)" : ""}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Los ejemplos están adaptados al sector de tu negocio.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
      >
        {submitting ? "Procesando..." : "Recibir reseña y generar respuesta"}
      </button>
    </form>
  );
}
