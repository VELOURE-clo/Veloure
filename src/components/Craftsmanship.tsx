"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

const LINES = [
  "Gefertigt bei einem Familienbetrieb in Portugal — seit über drei Jahrzehnten auf Strickwaren spezialisiert.",
  "[Platzhalter] Jede Charge wird vor Versand von Hand geprüft, Stück für Stück.",
  "[Platzhalter] Kleine Auflagen statt Überproduktion — wir produzieren, was wir verantworten können.",
  "Details zum Fertigungspartner folgen, sobald der finale Vertrag steht.",
];

export default function Craftsmanship() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const targets = lineRefs.current.filter((el): el is HTMLParagraphElement => Boolean(el));
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 18 });
      ScrollTrigger.batch(targets, {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.12 }),
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="craft"
      className="border-y border-ink-bronze/15 bg-ink-black px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-ink-bronze">
          Herstellung
        </p>
        <div className="mt-8 space-y-6">
          {LINES.map((line, i) => (
            <p
              key={line}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className="font-display text-xl leading-relaxed text-ink-offwhite md:text-2xl"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
