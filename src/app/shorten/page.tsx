"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ShortenForm() {
  const searchParams = useSearchParams();
  const missing = searchParams.get("missing") === "1";

  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    missing ? "That short link was not found or has expired." : null,
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(() => url.trim().length > 0 && !loading, [url, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setShortUrl(null);
    setCopied(false);
    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { shortUrl?: string; error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to shorten URL");
        return;
      }
      setShortUrl(data.shortUrl ?? null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-14">
      <div className="rise mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Shortener
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink sm:text-4xl">
          Shorten a URL
        </h1>
        <p className="mt-3 text-muted">
          Paste a link. Get a short redirect. No login.
        </p>
      </div>

      <form onSubmit={onSubmit} className="tool-panel rise rise-delay-1 rounded-2xl p-6">
        <label htmlFor="url" className="mb-2 block text-sm font-medium text-ink">
          Long URL
        </label>
        <input
          id="url"
          className="input-field"
          type="text"
          inputMode="url"
          placeholder="https://example.com/very/long/path"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoComplete="off"
          required
        />
        <button type="submit" className="btn-primary mt-4 w-full" disabled={!canSubmit}>
          {loading ? "Shortening…" : "Create short link"}
        </button>
      </form>

      {error && (
        <div
          className="mt-4 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {shortUrl && (
        <div className="tool-panel mt-4 rounded-2xl p-6">
          <p className="mb-2 text-sm font-medium text-ink">Your short link</p>
          <code className="block break-all rounded-lg bg-accent-soft px-3 py-3 font-mono text-sm text-ink">
            {shortUrl}
          </code>
          <button type="button" className="btn-ghost mt-4" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ShortenPage() {
  return (
    <Suspense fallback={<div className="px-5 py-14 text-muted">Loading…</div>}>
      <ShortenForm />
    </Suspense>
  );
}
