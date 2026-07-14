import Link from "next/link";

const tools = [
  {
    href: "/shorten",
    title: "URL Shortener",
    blurb: "Turn a long URL into a short redirect link. No account.",
    tag: "lookup + 302",
  },
  {
    href: "/secret",
    title: "One-time Secret",
    blurb:
      "Encrypt text in your browser. The link works once, then the ciphertext is destroyed.",
    tag: "AES-GCM · burn-after-read",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:py-24">
      <div className="rise mb-12 max-w-xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Utility hub
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
          Portfolio Tools
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Small utilities I built and ship myself. Use them, share them, then
          check the source.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool, i) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`tool-panel rise group rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-accent ${
              i === 0 ? "rise-delay-1" : "rise-delay-2"
            }`}
          >
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-accent">
              {tool.tag}
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              {tool.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {tool.blurb}
            </p>
            <span className="mt-6 inline-flex text-sm font-semibold text-ink group-hover:text-accent">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
