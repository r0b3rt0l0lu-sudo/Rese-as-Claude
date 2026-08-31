"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AutopilotEligibility } from "@/lib/autopilot";

export default function AutopilotBanner({ eligibility }: { eligibility: AutopilotEligibility }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!eligibility.eligible) return null;

  async function handleEnable() {
    setLoading(true);
    await fetch("/api/settings/autopilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: true }),
    });
    router.refresh();
  }

  return (
    <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="font-semibold text-brand-800">🚀 Ya puedes activar el autopiloto</p>
        <p className="text-sm text-brand-700 mt-0.5">
          Llevas {eligibility.totalResponded} respuestas enviadas y un {Math.round((eligibility.approvalRate ?? 0) * 100)}%
          de aprobación sin editar en reseñas de riesgo bajo. Solo esas reseñas se aprobarán automáticamente — puedes
          pausarlo cuando quieras.
        </p>
      </div>
      <button
        onClick={handleEnable}
        disabled={loading}
        className="shrink-0 rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60 transition-colors"
      >
        {loading ? "Activando..." : "Activar autopiloto"}
      </button>
    </div>
  );
}
