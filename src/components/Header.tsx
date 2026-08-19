export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      <div className="pointer-events-auto mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <a
          href="#top"
          className="font-display text-sm font-semibold uppercase tracking-[0.32em] text-ink-offwhite"
          aria-label="VELOURE home"
        >
          Veloure
        </a>
        <a
          href="#cta"
          className="hidden md:inline-block border border-ink-bronze/50 px-5 py-2 text-xs font-medium uppercase tracking-[0.2em] text-ink-offwhite transition-colors duration-300 hover:border-ink-bronze hover:text-ink-bronze"
        >
          Notify Me
        </a>
      </div>
    </header>
  );
}
