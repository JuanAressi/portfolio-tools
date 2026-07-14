# Portfolio Tools

Personal utility hub: **URL shortener** + **one-time encrypted secrets**.

Live demo (after deploy): `https://<your-app>.vercel.app`  
Portfolio: [juanaressi.github.io/portfolio-interactive](https://juanaressi.github.io/portfolio-interactive/)

## Tools

### URL shortener

1. `POST /api/shorten` stores `s:{code} → url` in Redis.
2. `GET /s/{code}` looks up the key and returns **302** to the destination.
3. Codes expire after 90 days. Rate-limited.

### One-time secret

1. Browser encrypts with **AES-GCM** (Web Crypto). Plaintext never leaves the client.
2. Server stores **ciphertext only** under `x:{id}` (7-day TTL if unopened).
3. Link format: `/x/{id}#{key}.{iv}` — the `#fragment` is not sent to the server.
4. `GET /api/secrets/{id}` uses Redis **`GETDEL`** (atomic). Second visitor gets **410 Gone**.

```
Sender encrypts → POST ciphertext → share link with #key
Receiver opens → GETDEL ciphertext → decrypt in browser → gone forever
```

## Stack

- Next.js (App Router) + TypeScript
- Upstash Redis
- Vercel

## Local setup

```bash
cp .env.example .env.local
# fill UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
npm install
npm run dev
```

## Deploy (Vercel + Upstash, ~$0)

1. Create a free Redis DB at [Upstash](https://console.upstash.com).
2. Push this repo to GitHub.
3. Import the repo in [Vercel](https://vercel.com) → Framework: Next.js.
4. Add env vars `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
5. Deploy. You get `https://<project>.vercel.app` with no custom domain required.
6. Link that URL from your portfolio.

## Project layout

```
src/app/          pages + API routes
src/lib/crypto.ts client AES-GCM
src/lib/redis.ts  Upstash client
src/lib/rate-limit.ts
src/lib/url.ts    URL allowlist
```
