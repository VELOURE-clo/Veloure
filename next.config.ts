import type { NextConfig } from "next";

// GitHub Pages serves this repo from https://<org>.github.io/Veloure/, a
// subpath rather than the domain root, and has no image-optimization
// server. Both only apply to the static-export build the Pages workflow
// runs (GITHUB_PAGES=true) — the normal `next dev` / `next build` used
// everywhere else (Vercel included) is unaffected.
const basePath = process.env.GITHUB_PAGES === "true" ? "/Veloure" : "";

const nextConfig: NextConfig = {
  ...(process.env.GITHUB_PAGES === "true" && {
    output: "export",
    basePath,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
