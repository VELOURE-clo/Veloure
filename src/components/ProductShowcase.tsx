"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { asset } from "@/lib/basePath";

type Product = {
  name: string;
  image: string | null;
  placeholderFile: string;
  story: string;
  reverse: boolean;
};

// Tee and Denim are still placeholders — real photography to follow.
// Drop the matching file into /public/images/ and set `image` below
// (see the Longsleeve entry for the pattern).
const PRODUCTS: Product[] = [
  {
    name: "Heavyweight Rib Tee",
    image: null,
    placeholderFile: "/public/images/tee.jpg",
    story:
      "300 GSM Baumwoll-Rippstrick, in Deutschland konfektioniert. Kein Shirt, das sich nach dem dritten Waschgang verliert — eines, das seine Form behält.",
    reverse: false,
  },
  {
    name: "Longsleeve",
    image: "/images/longsleeve-onmodel-front.jpg",
    placeholderFile: "/public/images/longsleeve.jpg",
    story:
      "100% mercerisierte Baumwolle, offener Rugby-Kragen, Dropped Shoulder für eine lockere Silhouette. Branding nur tonal — eine Veloure-Stickerei im Nacken, sonst nichts.",
    reverse: true,
  },
  {
    name: "Considered Denim",
    image: null,
    placeholderFile: "/public/images/jeans.jpg",
    story:
      "14.5oz rohes Indigo-Denim, 3x1 Rechtsköper. Unbehandelt, damit die Falten mit der Zeit dir gehören und nicht der Fabrik.",
    reverse: false,
  },
];

function ProductPanel({ product, index }: { product: Product; index: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (!sectionRef.current) return;

    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) return; // mobile: plain stacked flow, no pin

    const ctx = gsap.context(() => {
      gsap.set(imageRef.current, { opacity: 0, scale: 1.08 });
      gsap.set(textRef.current, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=70%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(imageRef.current, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 0).to(
        textRef.current,
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        0.15
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-ink-black py-24 md:py-0"
    >
      <div
        className={`mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-6 md:flex-row md:items-center md:gap-16 md:px-16 ${
          product.reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        <div
          ref={imageRef}
          className="relative aspect-[4/5] w-full overflow-hidden bg-ink-charcoal md:w-1/2"
        >
          {product.image ? (
            <Image
              src={asset(product.image)}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority={index === 0}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed border-ink-bronze/40 text-center">
              <span className="text-xs uppercase tracking-[0.28em] text-ink-bronze">
                Platzhalter
              </span>
              <span className="px-8 text-sm text-ink-stone">
                Foto folgt — {product.placeholderFile}
              </span>
            </div>
          )}
        </div>

        <div ref={textRef} className="md:w-1/2">
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-ink-bronze">
            0{index + 1}
          </span>
          <h3 className="mt-3 font-display text-4xl font-semibold text-ink-offwhite md:text-5xl">
            {product.name}
          </h3>
          <p className="mt-5 max-w-md text-ink-stone">{product.story}</p>
        </div>
      </div>
    </section>
  );
}

export default function ProductShowcase() {
  return (
    <div id="collection">
      {PRODUCTS.map((product, i) => (
        <ProductPanel key={product.name} product={product} index={i} />
      ))}
    </div>
  );
}
