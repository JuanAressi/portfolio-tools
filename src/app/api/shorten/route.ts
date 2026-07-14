import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  getRedis,
  SHORT_PREFIX,
  SHORT_TTL_SECONDS,
} from "@/lib/redis";
import { normalizeAndValidateUrl } from "@/lib/url";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
);

export async function POST(request: Request) {
  try {
    const limited = await rateLimit(clientIp(request), "shorten");
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfter) },
        },
      );
    }

    const body = (await request.json()) as { url?: string };
    const validated = normalizeAndValidateUrl(body.url ?? "");
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const redis = getRedis();
    let code = nanoid();
    // Extremely unlikely collision; retry a few times.
    for (let i = 0; i < 5; i++) {
      const exists = await redis.exists(`${SHORT_PREFIX}${code}`);
      if (!exists) break;
      code = nanoid();
    }

    await redis.set(`${SHORT_PREFIX}${code}`, validated.url, {
      ex: SHORT_TTL_SECONDS,
    });

    const origin = new URL(request.url).origin;
    return NextResponse.json({
      code,
      shortUrl: `${origin}/s/${code}`,
      url: validated.url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("UPSTASH") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
