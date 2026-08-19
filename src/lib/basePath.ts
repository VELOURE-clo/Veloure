// Prefix for public/ asset URLs. Empty everywhere except the GitHub Pages
// static-export build, which serves the app from a /Veloure subpath rather
// than the domain root — see next.config.ts and .github/workflows/pages.yml.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string) {
  return `${BASE_PATH}${path}`;
}
