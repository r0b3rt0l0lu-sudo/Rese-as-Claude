"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AutopilotEligibility } from "@/lib/autopilot";

export default function AutopilotControl({
  autopilotEnabled,
  eligibility,
}: {
  autopilotEnabled: boolean;
  eligibility: AutopilotEligibility;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(enabled: boolean) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/settings/autopilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "No se pudo actualizar el autopiloto.");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Autopiloto (solo riesgo bajo)</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Cuando está activo, las reseñas de riesgo bajo se aprueban automáticamente. Riesgo medio y alto{" "}
            <strong>siempre</strong> requieren tu aprobación manual.
          </p>
        </div>
        {autopilotEnabled ? (
          <button
            onClick={() => toggle(false)}
            disabled={loading}
            className="shrink-0 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm font-semibold hover:bg-red-100 disabled:opacity-60"
          >
            ⏸ Pausar autopiloto
          </button>
        ) : (
          <button
            onClick={() => toggle(true)}
            disabled={loading || !eligibility.eligible}
            title={!eligibility.eligible ? "Aún no cumples los requisitos de confianza progresiva" : undefined}
            className="shrink-0 rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-40"
          >
            Activar autopiloto
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <MiniStat label="Respuestas enviadas" value={eligibility.totalResponded} />
        <MiniStat label="Riesgo bajo respondidas" value={eligibility.lowRiskResponded} />
        <MiniStat
          label="% aprobado sin editar"
          value={eligibility.approvalRate !== null ? `${Math.round(eligibility.approvalRate * 100)}%` : "—"}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-brand-50 rounded-lg py-3">
      <p className="text-lg font-bold text-brand-700">{value}</p>
      <p className="text-[11px] text-brand-600 mt-0.5">{label}</p>
    </div>
  );
}
