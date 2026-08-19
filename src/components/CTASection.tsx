"use client";

import { useState, type FormEvent } from "react";

export default function CTASection() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = (new FormData(form).get("email") as string) ?? "";
    if (!email || !form.checkValidity()) {
      setStatus("error");
      return;
    }
    setStatus("success");
    form.reset();
  }

  return (
    <section id="cta" className="bg-ink-black px-6 py-28 text-center md:py-40">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-bronze">
          Drop 01
        </p>
        <h2 className="mt-5 font-display text-4xl font-semibold text-ink-offwhite md:text-5xl">
          Als Erster informiert werden.
        </h2>
        <p className="mt-4 text-ink-stone">
          Limitierte Erstauflage. Keine Vorverkaufsspiele, keine Warteliste-Spam
          — nur eine Nachricht, wenn es losgeht.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="email" className="sr-only">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="deine@email.de"
              className="flex-1 border border-ink-bronze/40 bg-transparent px-5 py-3.5 text-ink-offwhite placeholder:text-ink-stone/60 transition-colors focus:border-ink-bronze focus:outline-none"
            />
            <button
              type="submit"
              className="border border-ink-bronze bg-ink-bronze px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-ink-black transition-colors hover:bg-ink-offwhite hover:border-ink-offwhite"
            >
              Benachrichtigen
            </button>
          </div>
          <p
            role="status"
            aria-live="polite"
            className={`mt-4 text-sm ${
              status === "error"
                ? "text-red-400"
                : status === "success"
                ? "text-ink-bronze"
                : "text-ink-stone/70"
            }`}
          >
            {status === "success"
              ? "Danke — du bist auf der Liste."
              : status === "error"
              ? "Bitte eine gültige E-Mail-Adresse eingeben."
              : "Keine Weitergabe deiner Daten. Jederzeit abbestellbar."}
          </p>
        </form>
      </div>
    </section>
  );
}
