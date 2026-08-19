"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { asset } from "@/lib/basePath";

// Headline options — pick one, the others are kept here for reference:
// 1. "Gewicht, das man spürt."       (Weight you can feel.)
// 2. "Material zuerst."               (Material first.)
// 3. "Was gutes Gewicht bedeutet."    (What good weight means.)
const HEADLINE = "Gewicht, das man spürt.";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-end overflow-hidden bg-ink-black"
    >
      <div className="absolute inset-0">
        <Image
          src={asset("/images/tee-black.jpg")}
          alt="VELOURE heavyweight ribbed tee — placeholder hero visual"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-black via-ink-black/40 to-ink-black/10" />
      </div>

      <div className="relative z-10 w-full px-6 pb-20 md:px-10 md:pb-28">
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.32em] text-ink-bronze"
          >
            Debut Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="font-display text-[13vw] leading-[0.95] font-semibold tracking-tight text-ink-offwhite md:text-[7vw]"
          >
            {HEADLINE}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="mt-6 max-w-md text-base text-ink-stone md:text-lg"
          >
            Ein heavyweight Rib-Shirt, ein Premium-Trainingsanzug und
            durchdachter Denim. Drei Stücke, gebaut um zu bestehen.
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-8 right-6 z-10 hidden flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.28em] text-ink-stone md:right-10 md:flex"
      >
        <span className="h-10 w-px bg-gradient-to-b from-ink-bronze to-transparent" />
        Scroll
      </motion.div>
    </section>
  );
}
