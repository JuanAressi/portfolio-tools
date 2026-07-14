import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  getRedis,
  SECRET_PREFIX,
  SECRET_TTL_SECONDS,
} from "@/lib/redis";

export async function POST(request: Request) {
  try {
    const limited = await rateLimit(clientIp(request), "secrets");
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfter) },
        },
      );
    }

    const body = (await request.json()) as { ciphertext?: string };
    const ciphertext = body.ciphertext?.trim();

    if (!ciphertext) {
      return NextResponse.json(
        { error: "ciphertext is required" },
        { status: 400 },
      );
    }

    // Refuse absurd payloads (~256 KB ciphertext).
    if (ciphertext.length > 350_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const id = nanoid(16);
    const redis = getRedis();
    await redis.set(`${SECRET_PREFIX}${id}`, ciphertext, {
      ex: SECRET_TTL_SECONDS,
    });

    return NextResponse.json({ id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("UPSTASH") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
