"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string;
  reviewId: string | null;
  read: boolean;
  createdAt: string | Date;
}

const TYPE_ICON: Record<string, string> = {
  HIGH_RISK_REVIEW: "⚠️",
  PENDING_APPROVAL: "📥",
  AUTOPILOT_SUGGESTED: "🚀",
  RESPONSE_REJECTED: "❌",
};

export default function NotificationsList({ notifications }: { notifications: Notif[] }) {
  const router = useRouter();
  const hasUnread = notifications.some((n) => !n.read);

  async function markAllRead() {
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
    router.refresh();
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    router.refresh();
  }

  return (
    <div>
      {hasUnread && (
        <div className="flex justify-end mb-3">
          <button onClick={markAllRead} className="text-sm text-accent-700 font-medium hover:underline">
            Marcar todas como leídas
          </button>
        </div>
      )}
      {notifications.length === 0 ? (
        <div className="bg-white border border-brand-100 rounded-2xl shadow-sm px-5 py-10 text-center text-sm text-gray-400">
          No tienes notificaciones todavía.
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`bg-white border rounded-2xl shadow-sm p-4 flex items-start gap-3 ${
                n.read ? "border-gray-100" : n.type === "AUTOPILOT_SUGGESTED" ? "border-accent-300" : "border-brand-300"
              }`}
            >
              <span className="text-lg">{TYPE_ICON[n.type] ?? "🔔"}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? "text-gray-600" : "text-gray-900 font-semibold"}`}>{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                <div className="flex items-center gap-3 mt-2">
                  {n.reviewId && (
                    <Link href={`/reviews/${n.reviewId}`} className="text-xs font-medium text-accent-700 hover:underline">
                      Ver reseña →
                    </Link>
                  )}
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="text-xs font-medium text-gray-400 hover:text-gray-600">
                      Marcar como leída
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
