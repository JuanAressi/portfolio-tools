# Deploy checklist

## 1. Upstash (free)

1. Sign up at https://console.upstash.com
2. Create a Redis database
3. Copy **REST URL** and **REST TOKEN**

## 2. Vercel (free)

CLI is not logged in on this machine (`vercel login` required). Prefer the dashboard:

1. Open https://vercel.com/new
2. Import `JuanAressi/portfolio-tools`
3. Add environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy → copy the `*.vercel.app` URL

## 3. Portfolio link

Local change in `portfolio-interactive`:
- Nav item **Tools** → currently points at the GitHub repo
- After Vercel: change `href` on `#portfolio-tools-link` in `src/index.html` to your `*.vercel.app` URL, then rebuild and push GH Pages

## Local smoke test

```bash
cp .env.example .env.local
# paste Upstash credentials
npm run dev
```
