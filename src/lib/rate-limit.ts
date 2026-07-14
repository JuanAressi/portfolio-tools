import { getRedis, RATE_PREFIX } from "./redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 20;

export async function rateLimit(
  ip: string,
  bucket: string,
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  const redis = getRedis();
  const key = `${RATE_PREFIX}${bucket}:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  if (count > MAX_REQUESTS) {
    const ttl = await redis.ttl(key);
    return { ok: false, retryAfter: ttl > 0 ? ttl : WINDOW_SECONDS };
  }

  return { ok: true };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}
