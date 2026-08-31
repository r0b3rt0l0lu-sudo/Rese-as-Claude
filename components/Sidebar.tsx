import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Resumen", icon: "📊" },
  { href: "/reviews", label: "Bandeja de aprobación", icon: "📥" },
  { href: "/reviews/simulate", label: "Recibir reseña (prueba)", icon: "➕" },
  { href: "/knowledge-base", label: "Base de conocimiento", icon: "📚" },
  { href: "/notifications", label: "Notificaciones", icon: "🔔" },
  { href: "/audit", label: "Historial auditable", icon: "🕒" },
  { href: "/settings", label: "Ajustes", icon: "⚙️" },
];

export default function Sidebar({
  businessName,
  pendingCount,
  unreadNotifications,
  autopilotEnabled,
}: {
  businessName: string;
  pendingCount: number;
  unreadNotifications: number;
  autopilotEnabled: boolean;
}) {
  return (
    <aside className="w-72 shrink-0 bg-brand-900 text-cream-100 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-accent-500 text-accent-400 font-serif font-bold">
            V
          </span>
          <div>
            <p className="text-sm font-serif font-semibold tracking-wide leading-tight">VigilIA</p>
            <p className="text-[11px] uppercase tracking-wide text-brand-200 leading-tight truncate max-w-[10rem]">
              {businessName}
            </p>
          </div>
        </div>
        <div className="mt-3">
          {autopilotEnabled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/15 border border-accent-500/40 px-2.5 py-1 text-[11px] font-medium text-accent-300">
              🚀 Autopiloto activo (riesgo bajo)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-brand-200">
              🛡️ Modo sombra / manual
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          let badge: number | null = null;
          if (item.href === "/reviews" && pendingCount > 0) badge = pendingCount;
          if (item.href === "/notifications" && unreadNotifications > 0) badge = unreadNotifications;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-brand-100 hover:bg-white/5 hover:text-accent-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </span>
              {badge !== null && (
                <span className="inline-flex items-center justify-center rounded-full bg-accent-500 text-brand-900 text-xs font-bold h-5 min-w-[1.25rem] px-1">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-3">
        <p className="text-[11px] leading-snug text-brand-300">
          Envío en modo manual asistido. Copia y pega tus respuestas en Google — la integración automática
          llegará como mejora incremental.
        </p>
        <LogoutButton />
      </div>
    </aside>
  );
}
