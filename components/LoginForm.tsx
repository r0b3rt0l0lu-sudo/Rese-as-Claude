"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("Correo o contraseña incorrectos.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border-2 border-accent-500 text-brand-900 text-xl font-serif font-bold mb-3">
            V
          </span>
          <h1 className="text-3xl font-serif font-semibold text-brand-900">Bienvenido de nuevo</h1>
          <p className="text-brand-400 mt-1 text-sm">Inicia sesión para gestionar tus reseñas.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-accent-200/60 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5"
        >
          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-brand-400 mb-1">
              Correo electrónico
            </label>
            <input
              required
              type="email"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@negocio.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-brand-400 mb-1">
              Contraseña
            </label>
            <input
              required
              type="password"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-risk-high">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-center text-xs text-brand-400 mt-6">
          ¿Todavía no tienes una cuenta? Ejecuta el onboarding inicial para crear tu negocio y tu acceso.
        </p>
      </div>
    </div>
  );
}
