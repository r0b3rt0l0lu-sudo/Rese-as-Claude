"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ThresholdsForm({
  shadowModeReviewThreshold,
  autopilotApprovalThreshold,
}: {
  shadowModeReviewThreshold: number;
  autopilotApprovalThreshold: number;
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(shadowModeReviewThreshold);
  const [approvalPct, setApprovalPct] = useState(Math.round(autopilotApprovalThreshold * 100));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings/thresholds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shadowModeReviewThreshold: reviews,
        autopilotApprovalThreshold: approvalPct / 100,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-5">
      <h3 className="font-semibold text-gray-900">Confianza progresiva / modo sombra</h3>
      <p className="text-sm text-gray-500 mt-0.5 mb-4">
        Define cuántas respuestas manuales necesitas enviar y qué tasa de aprobación-sin-editar debes alcanzar
        antes de que el sistema te ofrezca activar el autopiloto.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Respuestas manuales antes de poder ofrecer autopiloto
          </label>
          <input
            type="number"
            min={1}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={reviews}
            onChange={(e) => setReviews(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            % mínimo aprobado sin editar (riesgo bajo)
          </label>
          <input
            type="number"
            min={50}
            max={100}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={approvalPct}
            onChange={(e) => setApprovalPct(Number(e.target.value))}
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar cambios"}
      </button>
    </div>
  );
}
