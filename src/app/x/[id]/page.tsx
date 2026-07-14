"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { decodeFragment, decryptText } from "@/lib/crypto";

type Status = "loading" | "ready" | "gone" | "error";

export default function SecretConsumePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [status, setStatus] = useState<Status>("loading");
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const parts = decodeFragment(window.location.hash);
      if (!parts) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            "Missing encryption key in the URL fragment. The full link including #… is required.",
          );
        }
        return;
      }

      try {
        const res = await fetch(`/api/secrets/${id}`);
        if (res.status === 410) {
          if (!cancelled) {
            setStatus("gone");
            setMessage("This secret was already viewed or never existed.");
          }
          return;
        }

        const data = (await res.json()) as {
          ciphertext?: string;
          error?: string;
        };

        if (!res.ok || !data.ciphertext) {
          if (!cancelled) {
            setStatus("error");
            setMessage(data.error || "Failed to fetch secret");
          }
          return;
        }

        const text = await decryptText(
          data.ciphertext,
          parts.iv,
          parts.key,
        );

        // Clear fragment from history so refresh cannot re-use a visible key easily.
        history.replaceState(null, "", window.location.pathname);

        if (!cancelled) {
          setPlaintext(text);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Decrypt failed. The link may be incomplete or corrupt.");
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-14">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
          One-time secret
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
          Reveal
        </h1>
      </div>

      {status === "loading" && (
        <div className="tool-panel rounded-2xl p-6 text-muted">
          Fetching and decrypting…
        </div>
      )}

      {status === "gone" && (
        <div
          className="rounded-2xl border border-danger/30 bg-danger-soft p-6 text-danger"
          role="alert"
        >
          <p className="font-semibold">Already destroyed</p>
          <p className="mt-2 text-sm">{message}</p>
          <Link href="/secret" className="btn-ghost mt-4 inline-flex">
            Create a new secret
          </Link>
        </div>
      )}

      {status === "error" && (
        <div
          className="rounded-2xl border border-danger/30 bg-danger-soft p-6 text-danger"
          role="alert"
        >
          <p className="font-semibold">Could not open secret</p>
          <p className="mt-2 text-sm">{message}</p>
          <Link href="/secret" className="btn-ghost mt-4 inline-flex">
            Back
          </Link>
        </div>
      )}

      {status === "ready" && plaintext !== null && (
        <div className="tool-panel rounded-2xl p-6">
          <p className="mb-2 text-sm font-medium text-ink">Decrypted content</p>
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-accent-soft px-3 py-3 font-mono text-sm text-ink">
            {plaintext}
          </pre>
          <p className="mt-4 text-xs text-muted">
            This was a one-time view. Refreshing this page will not show the
            secret again.
          </p>
          <Link href="/secret" className="btn-ghost mt-4 inline-flex">
            Create another
          </Link>
        </div>
      )}
    </div>
  );
}
