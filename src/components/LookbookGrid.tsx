"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { asset } from "@/lib/basePath";

const COLUMNS: { images: { src: string; alt: string }[]; offset: number }[] = [
  {
    offset: -40,
    images: [
      { src: "/images/tee-bordeaux.jpg", alt: "Signature Rib Tee, Bordeaux" },
      { src: "/images/detail-stitching.jpg", alt: "Detailaufnahme Naht, Denim" },
    ],
  },
  {
    offset: 60,
    images: [
      { src: "/images/jeans-front.jpg", alt: "Considered Denim, Frontansicht" },
      { src: "/images/detail-embroidery.jpg", alt: "Gold-Stickerei Detail" },
      { src: "/images/longsleeve-onmodel-back.jpg", alt: "VELOURE Longsleeve, Rückansicht" },
    ],
  },
  {
    offset: -20,
    images: [
      { src: "/images/unbox-open.jpg", alt: "VELOURE Verpackung, geöffnet" },
      { src: "/images/tee-offwhite.jpg", alt: "Signature Rib Tee, Off White" },
      { src: "/images/longsleeve-embroidery.jpg", alt: "Tonale Veloure-Stickerei im Nacken" },
    ],
  },
];

export default function LookbookGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const columnRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (window.innerWidth < 768) return; // mobile: static stack, no parallax

    const ctx = gsap.context(() => {
      columnRefs.current.forEach((col, i) => {
        if (!col) return;
        const offset = COLUMNS[i]?.offset ?? 0;
        gsap.fromTo(
          col,
          { y: 0 },
          {
            y: offset,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="lookbook" className="bg-ink-black px-6 py-28 md:px-10 md:py-40">
      <p className="mb-12 text-xs font-medium uppercase tracking-[0.28em] text-ink-bronze md:mb-16">
        Lookbook
      </p>
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {COLUMNS.map((column, i) => (
          <div
            key={i}
            ref={(el) => {
              columnRefs.current[i] = el;
            }}
            className="flex flex-col gap-6 md:gap-8"
          >
            {column.images.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[3/4] w-full overflow-hidden bg-ink-charcoal"
              >
                <Image
                  src={asset(img.src)}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
