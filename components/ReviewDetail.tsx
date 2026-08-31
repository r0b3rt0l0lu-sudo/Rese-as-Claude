"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RiskBadge from "@/components/RiskBadge";
import Stars from "@/components/Stars";

interface ResponseVersion {
  id: string;
  version: number;
  content: string;
  origin: "AI" | "HUMAN_EDIT";
  feedback: string | null;
}

interface ReviewData {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskReasons: string;
  status: "PENDING" | "RESPONDED" | "DISMISSED";
  responses: ResponseVersion[];
  sendRecords: { approvedBy: "MANUAL" | "AUTOPILOT"; editedBeforeApprove: boolean }[];
}

export default function ReviewDetail({ review }: { review: ReviewData }) {
  const router = useRouter();
  const latest = review.responses[review.responses.length - 1];

  const [content, setContent] = useState(latest?.content ?? "");
  const [editNote, setEditNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [busy, setBusy] = useState<"approve" | "regenerate" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isPending = review.status === "PENDING";
  const reasons: { keyword: string; category: string }[] = (() => {
    try {
      return JSON.parse(review.riskReasons);
    } catch {
      return [];
    }
  })();

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleApprove() {
    setBusy("approve");
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${review.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, editNote: editNote || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo aprobar la respuesta.");
      await handleCopy();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRegenerate() {
    if (!feedback.trim()) return;
    setBusy("regenerate");
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${review.id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo regenerar la respuesta.");
      setContent(data.content);
      setFeedback("");
      setShowFeedbackBox(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="font-semibold text-gray-900">{review.authorName}</span>
          <Stars rating={review.rating} />
          <RiskBadge level={review.riskLevel} />
        </div>
        <p className="text-gray-700">{review.text}</p>
        {reasons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {reasons.map((r, i) => (
              <span key={i} className="text-xs bg-red-50 text-risk-high border border-red-200 rounded-full px-2 py-0.5">
                {r.keyword} · {r.category}
              </span>
            ))}
          </div>
        )}
      </div>

      {review.riskLevel === "HIGH" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ Riesgo alto detectado: no se generó una respuesta completa automáticamente. Solo se sugiere una
          plantilla corta para invitar a hablar en privado. Revisa con cuidado antes de enviar.
        </div>
      )}

      <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Respuesta sugerida</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
          rows={5}
          value={content}
          disabled={!isPending}
          onChange={(e) => setContent(e.target.value)}
        />

        {isPending && content.trim() !== (latest?.content.trim() ?? "") && (
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              ¿Por qué hiciste este cambio? (opcional — ayuda a mejorar futuras respuestas)
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Ej: preferimos no usar la palabra 'lamentamos'"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex flex-wrap gap-2 mt-4">
          {isPending ? (
            <>
              <button
                onClick={handleApprove}
                disabled={busy !== null}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
              >
                {busy === "approve" ? "Aprobando..." : "✅ Aprobar y copiar"}
              </button>
              <button
                onClick={() => setShowFeedbackBox((v) => !v)}
                disabled={busy !== null}
                className="rounded-lg border border-accent-200 px-4 py-2 text-sm font-medium text-accent-700 hover:bg-accent-50 disabled:opacity-60 transition-colors"
              >
                🔄 Regenerar con feedback
              </button>
              <button
                onClick={handleCopy}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copied ? "¡Copiado!" : "📋 Copiar"}
              </button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-risk-low bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
              ✅ Enviada (copiada manualmente en Google)
              {review.sendRecords[0]?.approvedBy === "AUTOPILOT" && " · por autopiloto"}
            </span>
          )}
        </div>

        {isPending && showFeedbackBox && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dile a la IA qué cambiar (en tus palabras)
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              rows={2}
              placeholder='Ej: "hazla más formal" o "menciona que ya solucionamos el problema"'
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <button
              onClick={handleRegenerate}
              disabled={busy !== null || !feedback.trim()}
              className="mt-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-60 transition-colors"
            >
              {busy === "regenerate" ? "Regenerando..." : "Generar nueva versión"}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Este feedback se guardará como una preferencia aprendida en la base de conocimiento del negocio.
            </p>
          </div>
        )}
      </div>

      {review.responses.length > 1 && (
        <details className="bg-white border border-brand-100 rounded-2xl shadow-sm p-5">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            Historial de versiones ({review.responses.length})
          </summary>
          <ul className="mt-3 space-y-3">
            {review.responses.map((r) => (
              <li key={r.id} className="text-sm border-l-2 border-gray-100 pl-3">
                <p className="text-xs text-gray-400 mb-0.5">
                  v{r.version} · {r.origin === "AI" ? "Generada por IA" : "Editada manualmente"}
                  {r.feedback && ` · feedback: "${r.feedback}"`}
                </p>
                <p className="text-gray-600">{r.content}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
