# GEO Raydar Frontend

Next.js 14 App Router frontend for GEO Raydar, deployed on Vercel at [www.georaydar.com](https://www.georaydar.com). Backed by a FastAPI service on Railway at `geotracker-production-89b8.up.railway.app`.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Auth | Hand-rolled HMAC-SHA256 tokens (Railway backend) + BFF session cookie |
| Deployment | Vercel |

---

## Architecture

The frontend and backend live on different domains. This creates a cross-domain cookie problem: the Railway `httpOnly` auth cookie is invisible to the Next.js middleware running on `www.georaydar.com`.

The solution is a BFF (Backend for Frontend) session route:

1. User logs in: browser POSTs credentials to Railway backend, which sets an `httpOnly` cookie on its own domain and returns a signed token in the JSON response body.
2. Frontend calls `/api/auth/session` (a Next.js API route on the Vercel domain) with that token.
3. The session route verifies the token's HMAC signature against `USER_SECRET_KEY`, checks expiry, then sets a `geo_session` cookie on `www.georaydar.com`.
4. Next.js middleware reads `geo_session` to protect `/dashboard` and `/admin` routes.
5. Every Railway API call still uses `credentials: 'include'` so the Railway `httpOnly` cookie goes along for full server-side auth verification.

---

## Security Hardening

This section documents every security control in place as of May 2026.

### Authentication

**Token scheme.** The Railway backend uses HMAC-SHA256 over a base64url-encoded JSON payload. The format is `base64url(payload).hmac_sha256_hex`. Tokens carry an `exp` field and are verified with constant-time comparison.

**Password hashing.** PBKDF2-HMAC-SHA256 with 200,000 iterations and a random per-user salt (Python `secrets.token_bytes(16)`). Legacy SHA-256 hashes from the previous scheme are still verifiable for existing accounts; a successful legacy login triggers an automatic re-hash to the PBKDF2 format.

**Cookie flags.** The Railway auth cookie (`geo_tracker_token`) is `httpOnly`, `Secure`, `SameSite=none` (required for cross-origin requests). The same-domain session flag (`geo_session`) is `httpOnly`, `Secure` in production, `SameSite=lax`.

**No localStorage.** Auth tokens are never written to `localStorage` or `sessionStorage`. All auth state lives in `httpOnly` cookies, invisible to JavaScript.

**BFF session route verification.** `/app/api/auth/session/route.ts` does not issue `geo_session` on a format check alone. It:

1. Splits the token on the first `.`
2. Computes `HMAC-SHA256(payloadB64, USER_SECRET_KEY)` via the Web Crypto API
3. Compares with the supplied signature in constant time
4. Decodes the base64url payload and rejects expired tokens
5. Returns 401 on any failure; only a valid, unexpired, correctly signed token gets a session cookie

### CSRF Protection

The FastAPI backend has an `http` middleware layer that checks all state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) against two controls:

1. `X-GeoRaydar-Request: 1` custom header, which browsers do not send for cross-site requests
2. `Origin` header checked against the allowed origins list

Public paths (`/api/auth/login`, `/api/auth/signup`, `/health`) are excluded. Any state-changing request from an unexpected origin without the custom header gets a `403`.

The frontend's `fetchAPIAuth` helper adds `X-GeoRaydar-Request: 1` to every authenticated request.

### Rate Limiting

Login is limited to 10 attempts per IP per 60-second window. Signup is limited to 5 attempts per IP per 60-second window. Implemented with a thread-safe in-memory store (`threading.Lock` + `defaultdict`). Returns `429` with a `Retry-After` message on breach.

Note: the limiter is per-process. Railway deployments with multiple container instances each maintain independent counters. Redis-backed limiting would be required for distributed enforcement.

### Authorization

Every protected API route requires `Depends(get_current_user)`, including:

- `GET /api/models`
- `GET /api/queries/sample`
- `POST /api/runs`
- `GET /api/runs/{id}/status`
- `GET /api/runs/{id}/results`

Unauthenticated requests to any of these return `401`.

### OpenAPI Docs Disabled in Production

When the `ENVIRONMENT` env var is `production` (the Railway default), the FastAPI app is initialized with `docs_url=None`, `redoc_url=None`, `openapi_url=None`. `GET /docs` returns `404`.

### No Secrets in Client Bundles

- `USER_SECRET_KEY` is a server-only environment variable (not prefixed `NEXT_PUBLIC_`)
- Auth tokens are never passed to client components
- The BFF session route runs server-side only
- `NEXT_PUBLIC_API_URL` is the only public env var and contains no credentials

### Middleware Route Protection

`middleware.ts` protects `/dashboard/:path*` and `/admin/:path*`. Unauthenticated visitors are redirected to `/login?from=<original-path>`. The middleware runs at the edge before any page rendering.

---

## Environment Variables

### Vercel (frontend)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Railway backend URL |
| `USER_SECRET_KEY` | Yes | HMAC signing key shared with Railway backend; used to verify tokens before issuing `geo_session` |

### Railway (backend)

| Variable | Required | Description |
|---|---|---|
| `USER_SECRET_KEY` | Yes | HMAC signing key for user tokens |
| `ADMIN_SECRET_KEY` | Yes | HMAC signing key for admin tokens |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `GOOGLE_API_KEY` | Yes | Google Gemini API key |
| `ENVIRONMENT` | Yes | Set to `production` to disable OpenAPI docs |

All Railway variables are stored encrypted. Never commit actual values.

---

## Local Development

```bash
cd geo-tracker-frontend
npm install
cp .env.example .env.local
# Edit .env.local with local backend URL
npm run dev
```

The backend must be running:

```bash
cd geo_tracker
source .venv/bin/activate
uvicorn api.main:app --reload --port 8000
```

---

## Project Structure

```
geo-tracker-frontend/
├── app/
│   ├── api/auth/session/route.ts   # BFF session route (HMAC token verification)
│   ├── dashboard/page.tsx          # Protected dashboard
│   ├── admin/page.tsx              # Protected admin panel
│   ├── login/page.tsx              # Login page
│   └── signup/page.tsx             # Signup page
├── components/
│   └── AuthProvider.tsx            # Auth context, login/logout/signup
├── lib/
│   ├── api.ts                      # API client (credentials:include, X-GeoRaydar-Request header)
│   ├── auth.ts                     # Auth context definition
│   └── types.ts                    # TypeScript types
└── middleware.ts                   # Edge middleware: geo_session route guard
```

---

## Deployment

Push to `main` on GitHub triggers a Vercel deployment automatically. No manual steps required. Set `USER_SECRET_KEY` in Vercel project settings under Environment Variables (Preview + Production).
