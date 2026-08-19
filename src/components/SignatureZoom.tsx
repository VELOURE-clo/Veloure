"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { asset } from "@/lib/basePath";

const FRAGMENTS = [
  {
    label: "300 GSM",
    text: "Schwer genug, um zu fallen, wie es soll — nicht wie ein T-Shirt, das sich anfühlt wie eines.",
  },
  {
    label: "Doppelt gezwirntes Garn",
    text: "Engere Garndrehung für Formstabilität, die den Waschgang übersteht.",
  },
  {
    label: "Verstärkte Rippstruktur",
    text: "Jede Rippe einzeln verstärkt vernäht, damit die Form erhalten bleibt.",
  },
];

/**
 * Signature moment. On desktop with motion enabled: pins the section and
 * cross-fades from the full garment into a genuine macro shot of the
 * rib-knit texture as the user scrolls, with material-fact fragments
 * timed to the same scrub. On mobile or under reduced-motion, this
 * collapses to a plain stacked section with a simple fade-up reveal (or
 * no animation at all) — never a pinned/scrubbed sequence there, both
 * for performance and because pinning reads poorly on small screens.
 */
export default function SignatureZoom() {
  const sectionRef = useRef<HTMLElement>(null);
  const wideRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLDivElement>(null);
  const fragmentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (!sectionRef.current || !wideRef.current || !closeRef.current) return;

    const isDesktop = window.innerWidth >= 768;

    const ctx = gsap.context(() => {
      if (isDesktop) {
        gsap.set(wideRef.current, { opacity: 1, scale: 1 });
        gsap.set(closeRef.current, { opacity: 0, scale: 1.15 });
        gsap.set(fragmentRefs.current, { opacity: 0, y: 16 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=280%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        tl.to(wideRef.current, { scale: 1.35, opacity: 0, ease: "power1.in", duration: 1 }, 0)
          .to(closeRef.current, { scale: 1, opacity: 1, ease: "power1.out", duration: 1 }, 0.1)
          .to(closeRef.current, { scale: 1.25, ease: "none", duration: 2 }, 1);

        // Positions below are in the timeline's own seconds (the crossfade
        // above runs from 0-3), NOT normalized 0-1 fractions — spacing
        // fragments across the post-crossfade zoom (t > 1.1) with real
        // gaps between each fade-in/hold/fade-out so they never overlap.
        const fragmentStarts = [1.2, 1.85, 2.5];
        fragmentRefs.current.forEach((el, i) => {
          if (!el) return;
          const start = fragmentStarts[i] ?? 1.2 + i * 0.65;
          tl.to(el, { opacity: 1, y: 0, duration: 0.2 }, start).to(
            el,
            { opacity: 0, y: -16, duration: 0.2 },
            start + 0.45
          );
        });
      } else {
        // Mobile: no pin, no zoom — just a gentle fade-up as each piece
        // scrolls into view, in normal document flow.
        gsap.set(closeRef.current, { opacity: 1, scale: 1 });
        const targets = [closeRef.current, ...fragmentRefs.current].filter(
          (el): el is HTMLDivElement => Boolean(el)
        );
        gsap.set(targets, { opacity: 0, y: 20 });
        ScrollTrigger.batch(targets, {
          start: "top 88%",
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.12 }),
          once: true,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col overflow-hidden bg-ink-black md:h-screen md:block"
    >
      <div className="relative aspect-[4/5] w-full md:absolute md:inset-0 md:aspect-auto md:h-full">
        <div ref={wideRef} className="absolute inset-0 hidden md:block">
          <Image src={asset("/images/tee-black.jpg")} alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div ref={closeRef} className="absolute inset-0">
          <Image
            src={asset("/images/detail-fabricswirl.jpg")}
            alt="Nahaufnahme der schweren Rippstrick-Struktur des VELOURE Tees"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-ink-black/25 md:block hidden" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 py-16 md:absolute md:inset-0 md:flex-row md:justify-center md:gap-0 md:py-0">
        {FRAGMENTS.map((fragment, i) => (
          <div
            key={fragment.label}
            ref={(el) => {
              fragmentRefs.current[i] = el;
            }}
            className="max-w-md text-center md:absolute"
          >
            <p className="font-display text-2xl font-semibold text-ink-offwhite md:text-4xl">
              {fragment.label}
            </p>
            <p className="mt-3 text-sm text-ink-stone md:text-base">{fragment.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
