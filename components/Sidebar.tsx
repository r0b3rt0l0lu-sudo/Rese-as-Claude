import Link from "next/link";

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
    <aside className="w-72 shrink-0 border-r border-brand-100 bg-white flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-brand-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white font-bold">
            R
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">Reseñas IA</p>
            <p className="text-xs text-gray-500 leading-tight truncate max-w-[10rem]">{businessName}</p>
          </div>
        </div>
        <div className="mt-3">
          {autopilotEnabled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              🚀 Autopiloto activo (riesgo bajo)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
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
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </span>
              {badge !== null && (
                <span className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-xs font-semibold h-5 min-w-[1.25rem] px-1">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-brand-100">
        <p className="text-[11px] leading-snug text-gray-400">
          Envío en modo manual asistido. Copia y pega tus respuestas en Google — la integración automática
          llegará como mejora incremental.
        </p>
      </div>
    </aside>
  );
}
