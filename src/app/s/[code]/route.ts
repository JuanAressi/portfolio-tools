import { NextResponse } from "next/server";
import { getRedis, SHORT_PREFIX } from "@/lib/redis";

type Params = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { code } = await params;
    if (!code || !/^[A-Za-z0-9_-]{4,32}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const redis = getRedis();
    const url = await redis.get<string>(`${SHORT_PREFIX}${code}`);

    if (!url) {
      return NextResponse.redirect(new URL("/shorten?missing=1", _request.url));
    }

    return NextResponse.redirect(url, 302);
  } catch {
    return NextResponse.json(
      { error: "Shortener unavailable" },
      { status: 503 },
    );
  }
}
