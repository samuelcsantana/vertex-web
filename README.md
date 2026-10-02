# vertex-web

[![CI](https://github.com/samuelcsantana/vertex-web/actions/workflows/ci.yml/badge.svg)](https://github.com/samuelcsantana/vertex-web/actions/workflows/ci.yml)
[![Tests](https://github.com/samuelcsantana/vertex-web/actions/workflows/tests.yml/badge.svg)](https://github.com/samuelcsantana/vertex-web/actions/workflows/tests.yml)
[![Security](https://github.com/samuelcsantana/vertex-web/actions/workflows/security.yml/badge.svg)](https://github.com/samuelcsantana/vertex-web/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

The Next.js frontend for **[samuelsantana.dev](https://samuelsantana.dev)** — a personal engineering blog and technical portfolio, built as a showcase of senior-level frontend architecture rather than a typical starter template.

Talks to **[vertex-api](https://github.com/samuelcsantana/vertex-api)**, the NestJS backend, over a REST API. The two are deployed on separate domains (Vercel and AWS Lambda), which shapes a few of the decisions below.

## Highlights

- **Server-first App Router, prerendered public site.** Data fetching happens in Server Components and mutations in Server Actions; every public route is prerendered, so the signed-in user is resolved on the client (see *Architecture notes*) rather than by reading cookies in a public render. `"use client"` is scoped to the smallest leaf that actually needs interactivity (a form, a dropdown, a polling listener).
- **Sub-path i18n that crawlers can actually index.** `next-intl` serves pt (default, unprefixed), `/en`, and `/es` as genuinely distinct URLs via a `proxy.ts` routing middleware — not a cookie that only a browser ever sends. `sitemap.ts` emits entries with real `hreflang` alternates — for posts, only for locales the post is genuinely translated into. Content itself is per-locale too: posts *and* the About page store optional en/es variants next to the required pt text, falling back to pt with a visible notice when a translation is missing.
- **Cross-domain OAuth via the Token Callback Pattern.** Google/GitHub login can't rely on vertex-api setting a cookie directly — it's on a different domain, so the cookie would be scoped to a domain this app's own `cookies()` calls could never see. Instead, the backend redirects the popup to `/auth/callback` with a short-lived, single-use exchange code (never the real token) in the URL; this app trades it for the real session token server-to-server and sets its own cookie. See `src/app/[locale]/auth/callback/` and `exchangeOAuthCodeAction`.
- **Technical SEO.** Dynamic `sitemap.xml`/`robots.txt`, `BlogPosting` JSON-LD on post pages, locale-aware canonical URLs, and Open Graph metadata generated per post.
- **Mobile-first, verified rather than assumed.** Responsive layout changes in this codebase were checked against real narrow-viewport renders, not just class names that look plausible.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript (strict mode)
- Tailwind CSS v4
- [next-intl](https://next-intl.dev) for routing-based i18n
- react-hook-form + zod
- react-markdown (+ remark-gfm, rehype-highlight) for post content — Markdown stored in the database, not MDX files
- `@next/third-parties` for Google Analytics

## Getting started

### Prerequisites

- Node 20+
- A running [vertex-api](https://github.com/samuelcsantana/vertex-api) instance (see its README for setup)

### Setup

```bash
npm install
cp .env.example .env.local   # fill in the values you need — see below
npm run dev
```

Visit [http://localhost:3021](http://localhost:3021). The default locale (pt) serves at the root; `/en` and `/es` are the other two.

### Other scripts

```bash
npm run build          # production build
npm run lint            # eslint
npm test                 # unit/component tests (vitest)
npm run test:watch       # vitest in watch mode
npm run test:coverage    # vitest with a coverage report
npm run test:e2e         # playwright — starts the dev server itself; vertex-api is not needed
```

## Docker

This repo pairs with [vertex-api](https://github.com/samuelcsantana/vertex-api) (the backend, on port `3020`) — vertex-web itself runs on port `3021` in local dev. This is a local-dev convenience only; production still deploys to Vercel, and the image is a plain `npm run build` + `npm start` (no `output: "standalone"`) specifically to keep that deployment untouched.

```bash
docker compose up -d --build
```

There's no `api` service in this compose file — vertex-api is a separate repo/container; point the env vars below at wherever it's actually running. `NEXT_PUBLIC_VERTEX_API_URL` is inlined into the client bundle at **build** time (a Docker build `arg`, same as `VITE_*`-style Vite vars), while `VERTEX_API_URL` is server-only and read at **runtime** (a normal `environment:` var) — see `docker-compose.yml` and `Dockerfile`.

## Testing

Two layers, deliberately not one:

- **Unit/component (Vitest + React Testing Library)** — pure logic (`src/features/*/utils`, `src/features/*/schemas`) and small components with real branching behavior worth locking in (e.g. `TopicPills`'s guard against a missing `topics` array). Fully self-contained, no backend needed, wired into CI (`tests.yml`). As of this writing this covers a handful of well-chosen files completely rather than the whole codebase shallowly — most of `src/features/**/actions` and `**/api` are Server Actions that just forward to vertex-api, and most components are thin composition over those; the better ROI for that code is the E2E layer below, not mocking every `fetch` call.
- **E2E (Playwright)** — `e2e/`, covering locale routing, the language switcher, admin gating, the home page and the Module Federation demo. The suite does **not** need vertex-api: it runs in CI against a production build (`tests.yml`), with nothing listening on the API port. That also bounds what it covers — nothing here would notice vertex-api returning bad data. Specs tagged `@external` load the remote from `cygnus.samuelsantana.dev` and run as their own CI job, so "the remote was down" and "this change broke the site" are never the same failure.

## Environment variables

See [`.env.example`](./.env.example) for the full, documented list. In short:

| Variable | Used by | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `src/lib/site-url.ts` | Local-development override only. The canonical origin used for canonical/OG/sitemap/robots URLs is a constant in `src/lib/site-url.ts`, and that constant wins in production builds; setting this locally just points generated URLs at the dev server. Do not set it in deployment. |
| `VERTEX_API_URL` | Server Actions/Components | Server-only; never sent to the browser. |
| `NEXT_PUBLIC_VERTEX_API_URL` | `LoginModal`, `LinkGithubButton` | Browser-readable — these open the OAuth popup directly against vertex-api. |
| `NEXT_PUBLIC_GA_ID` | root layout | Optional; Analytics is skipped entirely if unset. |

## Architecture notes

- **Public site under the locale, admin outside it.** `src/app/[locale]/(blog)/` holds the home, post and About pages, each prerendered per locale; `blog/[slug]` is a plain segment inside the group because it needs the literal `/blog` URL prefix. The admin panel lives in `src/app/admin/`, outside the locale segment, with its own root layout: it is rendered per request and takes its language from the `NEXT_LOCALE` cookie instead of the URL.
- **`proxy.ts`, not `middleware.ts`.** Next.js 16 deprecated the latter and hard-errors if both exist. This one file does double duty: gating `/admin/**` behind a session cookie check, and next-intl's locale routing for everything else — admin requests are matched so the gate sees them, but never reach next-intl.
- **Auth never enters a public render.** The access token is an `HttpOnly` cookie, invisible to client code. Public pages learn who is signed in from `GET /api/me`, fetched once by `CurrentUserProvider`; components read `useCurrentUser()`, which distinguishes "not answered yet" from "signed out", so the owner never sees a logged-out flash. Reading `cookies()` in a public page would un-prerender it.

## Related repository

- [vertex-api](https://github.com/samuelcsantana/vertex-api) — the NestJS + Fastify + Drizzle backend this app talks to.
