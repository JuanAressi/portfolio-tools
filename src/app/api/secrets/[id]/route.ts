import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getRedis, SECRET_PREFIX } from "@/lib/redis";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const limited = await rateLimit(clientIp(request), "secrets-get");
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfter) },
        },
      );
    }

    const { id } = await params;
    if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const redis = getRedis();
    // Atomic get-and-delete: second visitor always loses.
    const ciphertext = await redis.getdel<string>(`${SECRET_PREFIX}${id}`);

    if (!ciphertext) {
      return NextResponse.json(
        { error: "Secret already destroyed or never existed" },
        { status: 410 },
      );
    }

    return NextResponse.json({ ciphertext });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("UPSTASH") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
