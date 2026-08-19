export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-bronze/20 bg-ink-black px-6 py-12 md:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.32em] text-ink-offwhite">
            Veloure
          </p>
          <p className="mt-1 text-xs text-ink-stone">
            &copy; {year} Veloure. Designed in Germany.
          </p>
        </div>

        <nav aria-label="Social" className="flex gap-6 text-xs uppercase tracking-[0.2em] text-ink-stone">
          <a href="#" className="transition-colors hover:text-ink-bronze">
            Instagram
          </a>
          <a href="#" className="transition-colors hover:text-ink-bronze">
            TikTok
          </a>
        </nav>
      </div>
    </footer>
  );
}
