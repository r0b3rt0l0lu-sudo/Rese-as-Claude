const CONFIG: Record<string, { label: string; classes: string }> = {
  LOW: { label: "Riesgo bajo", classes: "bg-emerald-50 text-risk-low border border-emerald-200" },
  MEDIUM: { label: "Riesgo medio", classes: "bg-amber-50 text-risk-medium border border-amber-200" },
  HIGH: { label: "Riesgo alto — prioritaria", classes: "bg-red-50 text-risk-high border border-red-200" },
};

export default function RiskBadge({ level }: { level: string }) {
  const cfg = CONFIG[level] ?? CONFIG.MEDIUM;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
