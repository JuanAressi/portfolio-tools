const BLOCKED_PROTOCOLS = new Set([
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
]);

export function normalizeAndValidateUrl(
  input: string,
): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "URL is required" };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    try {
      parsed = new URL(`https://${trimmed}`);
    } catch {
      return { ok: false, error: "Invalid URL" };
    }
  }

  const protocol = parsed.protocol.toLowerCase();
  if (BLOCKED_PROTOCOLS.has(protocol)) {
    return { ok: false, error: "Protocol not allowed" };
  }

  if (protocol !== "http:" && protocol !== "https:") {
    return { ok: false, error: "Only http and https URLs are allowed" };
  }

  if (!parsed.hostname) {
    return { ok: false, error: "URL must include a hostname" };
  }

  return { ok: true, url: parsed.toString() };
}
