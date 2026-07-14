import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN",
    );
  }

  redis = new Redis({ url, token });
  return redis;
}

export const SHORT_PREFIX = "s:";
export const SECRET_PREFIX = "x:";
export const RATE_PREFIX = "rl:";

/** Short links live 90 days by default. */
export const SHORT_TTL_SECONDS = 60 * 60 * 24 * 90;

/** Unopened secrets expire after 7 days. */
export const SECRET_TTL_SECONDS = 60 * 60 * 24 * 7;
