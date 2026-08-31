"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-[11px] font-semibold uppercase tracking-wide text-accent-300 hover:text-accent-200 transition-colors"
    >
      Cerrar sesión →
    </button>
  );
}
