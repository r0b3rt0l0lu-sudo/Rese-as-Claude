"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { SECTOR_OPTIONS, SECTOR_TEMPLATES, type Sector } from "@/lib/sectorTemplates";

const LANGUAGE_OPTIONS = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "pt", label: "Portugués" },
];

const STEPS = ["Cuenta y negocio", "Tono y firma", "Políticas y límites", "Revisar y confirmar"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [sector, setSector] = useState<Sector>("restaurante");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [strengths, setStrengths] = useState("");
  const [responderName, setResponderName] = useState("");
  const [languages, setLanguages] = useState<string[]>(["es"]);
  const [policy, setPolicy] = useState("");
  const [neverSay, setNeverSay] = useState("");

  const template = SECTOR_TEMPLATES[sector];

  function toggleLanguage(value: string) {
    setLanguages((prev) => (prev.includes(value) ? prev.filter((l) => l !== value) : [...prev, value]));
  }

  function canAdvance(): boolean {
    if (step === 0) return name.trim().length >= 2 && EMAIL_RE.test(email) && password.length >= 8;
    if (step === 1) return brandTone.trim().length >= 3 && responderName.trim().length >= 2 && languages.length > 0;
    if (step === 2) return policy.trim().length >= 3 && neverSay.trim().length >= 3;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sector,
          brandTone,
          strengths,
          responderName,
          languages,
          policy,
          neverSay,
          email,
          password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "No se pudo guardar el negocio.");
      }

      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        throw new Error("Cuenta creada, pero no se pudo iniciar sesión automáticamente. Ve a /login.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border-2 border-accent-500 text-brand-900 text-xl font-serif font-bold mb-3">
            V
          </span>
          <h1 className="text-3xl font-serif font-semibold text-brand-900">Configura tu negocio</h1>
          <p className="text-brand-400 mt-1 text-sm">
            Esta información arma la base de conocimiento que usará la IA para responder tus reseñas.
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    i <= step ? "bg-brand-900 text-accent-300" : "bg-brand-100 text-brand-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-1 text-[11px] text-center uppercase tracking-wide ${
                    i === step ? "text-accent-700 font-semibold" : "text-brand-300"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 -mt-4 ${i < step ? "bg-accent-500" : "bg-brand-100"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-accent-200/60 rounded-2xl shadow-sm p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">
                  Nombre del negocio
                </label>
                <input
                  className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
                  placeholder="Ej: Restaurante La Marina"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">
                  Sector / rubro
                </label>
                <select
                  className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
                  value={sector}
                  onChange={(e) => setSector(e.target.value as Sector)}
                >
                  {SECTOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-brand-300 mt-1">
                  Usamos tu sector para sugerirte ejemplos y plantillas relevantes a tu tipo de negocio.
                </p>
              </div>
              <div className="border-t border-brand-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-400 mb-3">
                  Tu acceso a VigilIA
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
                      placeholder="tucorreo@negocio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">
                  Tono de marca deseado
                </label>
                <textarea
                  className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
                  rows={3}
                  placeholder={template.brandTonePlaceholder}
                  value={brandTone}
                  onChange={(e) => setBrandTone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">
                  Fortalezas del negocio <span className="text-brand-300 font-normal normal-case">(opcional)</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
                  rows={2}
                  placeholder={template.strengthsPlaceholder}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                />
                <p className="text-xs text-brand-300 mt-1">
                  Lo que te hace destacar frente a la competencia. La IA lo puede usar para personalizar mejor sus
                  respuestas.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">
                  Nombre/firma de quien responde en nombre del negocio
                </label>
                <input
                  className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
                  placeholder="Ej: Equipo de La Marina / María, dueña"
                  value={responderName}
                  onChange={(e) => setResponderName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-2">
                  Idioma(s) de respuesta
                </label>
                <div className="flex gap-3 flex-wrap">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <label
                      key={lang.value}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${
                        languages.includes(lang.value)
                          ? "border-accent-500 bg-accent-50 text-accent-700"
                          : "border-brand-200 text-brand-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-accent-500"
                        checked={languages.includes(lang.value)}
                        onChange={() => toggleLanguage(lang.value)}
                      />
                      {lang.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">
                  Política de devoluciones / cancelaciones
                </label>
                <textarea
                  className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
                  rows={3}
                  placeholder={template.policyPlaceholder}
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">
                  Cosas que la IA NUNCA debe prometer o decir
                </label>
                <textarea
                  className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
                  rows={3}
                  placeholder={template.neverSayPlaceholder}
                  value={neverSay}
                  onChange={(e) => setNeverSay(e.target.value)}
                />
                <p className="text-xs text-brand-300 mt-1">
                  Esto se guarda como una regla estricta: la IA la respetará en cada respuesta que genere.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-sm">
              <SummaryRow label="Negocio" value={name} />
              <SummaryRow label="Sector" value={SECTOR_TEMPLATES[sector].label} />
              <SummaryRow label="Correo de acceso" value={email} />
              <SummaryRow label="Tono de marca" value={brandTone} />
              <SummaryRow label="Fortalezas" value={strengths} />
              <SummaryRow label="Firma" value={responderName} />
              <SummaryRow
                label="Idiomas"
                value={languages.map((l) => LANGUAGE_OPTIONS.find((o) => o.value === l)?.label).join(", ")}
              />
              <SummaryRow label="Política" value={policy} />
              <SummaryRow label="Nunca decir" value={neverSay} />
              <p className="text-xs text-brand-300 pt-2">
                Empezarás en <strong>modo sombra</strong>: todas las respuestas requerirán tu aprobación manual
                hasta que el sistema te ofrezca activar el autopiloto para reseñas de riesgo bajo.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-risk-high mt-4">{error}</p>}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
              className="px-4 py-2 text-sm font-medium text-brand-400 rounded-lg disabled:opacity-0"
            >
              Atrás
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => canAdvance() && setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-900 hover:bg-brand-800 rounded-lg disabled:opacity-40 transition-colors"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-900 hover:bg-brand-800 rounded-lg disabled:opacity-60 transition-colors"
              >
                {submitting ? "Guardando..." : "Terminar configuración"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-brand-100 pb-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-300">{label}</span>
      <span className="text-brand-800">{value || "—"}</span>
    </div>
  );
}
