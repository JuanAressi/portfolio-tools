"use client";

import { useMemo, useState } from "react";
import { encodeFragment, encryptText } from "@/lib/crypto";

export default function SecretCreatePage() {
  const [text, setText] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(
    () => text.trim().length > 0 && !loading,
    [text, loading],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLink(null);
    setCopied(false);
    setLoading(true);

    try {
      const { ciphertext, iv, key } = await encryptText(text);
      const res = await fetch("/api/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ciphertext }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error || "Failed to store secret");
        return;
      }

      const fragment = encodeFragment(key, iv);
      const url = `${window.location.origin}/x/${data.id}#${fragment}`;
      setLink(url);
      setText("");
    } catch {
      setError("Encryption or network failed");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-14">
      <div className="rise mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
          One-time secret
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink sm:text-4xl">
          Share text once
        </h1>
        <p className="mt-3 text-muted">
          Encrypted in your browser. The server only stores ciphertext. Opening
          the link burns it forever.
        </p>
      </div>

      <form onSubmit={onSubmit} className="tool-panel rise rise-delay-1 rounded-2xl p-6">
        <label htmlFor="secret" className="mb-2 block text-sm font-medium text-ink">
          Secret text
        </label>
        <textarea
          id="secret"
          className="input-field min-h-40 resize-y font-mono text-sm"
          placeholder="Paste a password, token, or note…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <p className="mt-2 text-xs text-muted">
          The encryption key stays in the URL fragment (#…) and never hits the
          server.
        </p>
        <button type="submit" className="btn-primary mt-4 w-full" disabled={!canSubmit}>
          {loading ? "Encrypting…" : "Create one-time link"}
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

      {link && (
        <div className="tool-panel mt-4 rounded-2xl p-6">
          <p className="mb-2 text-sm font-medium text-ink">One-time link</p>
          <code className="block break-all rounded-lg bg-accent-soft px-3 py-3 font-mono text-xs text-ink">
            {link}
          </code>
          <p className="mt-3 text-xs text-muted">
            Copy the full URL including the # part. Anyone who opens it once
            destroys it.
          </p>
          <button type="button" className="btn-ghost mt-4" onClick={copy}>
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
