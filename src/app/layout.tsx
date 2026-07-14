import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Syne } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Portfolio Tools",
  description:
    "URL shortener and one-time encrypted secrets — personal utility tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${plexSans.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <div className="grid-overlay fixed inset-0 pointer-events-none" />
        <header className="relative z-10 border-b border-line/80 bg-surface">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
            <Link href="/" className="group">
              <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-ink">
                Portfolio Tools
              </span>
              <span className="mt-0.5 block text-xs text-muted transition group-hover:text-accent">
                personal utilities
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-muted">
              <Link href="/shorten" className="hover:text-ink">
                Shorten
              </Link>
              <Link href="/secret" className="hover:text-ink">
                Secret
              </Link>
            </nav>
          </div>
        </header>
        <main className="relative z-10 flex-1">{children}</main>
        <footer className="relative z-10 border-t border-line/80 py-6 text-center text-xs text-muted">
          Built by{" "}
          <a
            href="https://juanaressi.github.io/portfolio-interactive/"
            className="text-ink underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Juan Aressi
          </a>
        </footer>
      </body>
    </html>
  );
}
