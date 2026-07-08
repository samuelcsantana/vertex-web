# vertex-web

[![CI](https://github.com/samuelcsantana/vertex-web/actions/workflows/ci.yml/badge.svg)](https://github.com/samuelcsantana/vertex-web/actions/workflows/ci.yml)
[![Tests](https://github.com/samuelcsantana/vertex-web/actions/workflows/tests.yml/badge.svg)](https://github.com/samuelcsantana/vertex-web/actions/workflows/tests.yml)
[![Security](https://github.com/samuelcsantana/vertex-web/actions/workflows/security.yml/badge.svg)](https://github.com/samuelcsantana/vertex-web/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

The Next.js frontend for **[samuelsantana.dev](https://samuelsantana.dev)** — a personal engineering blog and technical portfolio, built as a showcase of senior-level frontend architecture rather than a typical starter template.

Talks to **[vertex-api](https://github.com/samuelcsantana/vertex-api)**, the NestJS backend, over a REST API. The two are deployed on separate domains (Vercel and Render), which shapes a few of the decisions below.

## Highlights

- **Server-first App Router.** Data fetching and auth checks happen in Server Components and Server Actions by default; `"use client"` is scoped to the smallest leaf that actually needs interactivity (a form, a dropdown, a polling listener).
- **Sub-path i18n that crawlers can actually index.** `next-intl` serves pt (default, unprefixed), `/en`, and `/es` as genuinely distinct URLs via a `proxy.ts` routing middleware — not a cookie that only a browser ever sends. `sitemap.ts` emits one entry per locale per route with real `hreflang` alternates.
- **Cross-domain OAuth via the Token Callback Pattern.** Google/GitHub login can't rely on vertex-api setting a cookie directly — it's on a different domain, so the cookie would be scoped to a domain this app's own `cookies()` calls could never see. Instead, the backend redirects the popup to `/auth/callback` with a short-lived, single-use exchange code (never the real token) in the URL; this app trades it for the real session token server-to-server and sets its own cookie. See `src/app/[locale]/auth/callback/` and `exchangeOAuthCodeAction`.
- **Technical SEO.** Dynamic `sitemap.xml`/`robots.txt`, `BlogPosting` JSON-LD on post pages, locale-aware canonical URLs, and Open Graph metadata generated per post.
- **Mobile-first, verified rather than assumed.** Responsive layout changes in this codebase were checked against real narrow-viewport renders, not just class names that look plausible.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript (strict mode)
- Tailwind CSS v4
- [next-intl](https://next-intl.dev) for routing-based i18n
- react-hook-form + zod
- MDX, react-markdown, rehype-pretty-code for post content
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

Visit [http://localhost:3000](http://localhost:3000). The default locale (pt) serves at the root; `/en` and `/es` are the other two.

### Other scripts

```bash
npm run build          # production build
npm run lint            # eslint
npm test                 # unit/component tests (vitest)
npm run test:watch       # vitest in watch mode
npm run test:coverage    # vitest with a coverage report
npm run test:e2e         # playwright — needs a running dev server *and* vertex-api
```

## Testing

Two layers, deliberately not one:

- **Unit/component (Vitest + React Testing Library)** — pure logic (`src/features/*/utils`, `src/features/*/schemas`) and small components with real branching behavior worth locking in (e.g. `TopicPills`'s guard against a missing `topics` array). Fully self-contained, no backend needed, wired into CI (`tests.yml`). As of this writing this covers a handful of well-chosen files completely rather than the whole codebase shallowly — most of `src/features/**/actions` and `**/api` are Server Actions that just forward to vertex-api, and most components are thin composition over those; the better ROI for that code is the E2E layer below, not mocking every `fetch` call.
- **E2E (Playwright)** — `e2e/`, covering locale routing, the language switcher, dashboard gating, and mobile layout, run against a **real** vertex-api instance (no mocking, matching how this app was actually verified throughout development). **Not wired into CI**: that would mean standing up Postgres + a seeded vertex-api as CI services, which is real, separate infrastructure work, not a config tweak. Run it locally with both `vertex-web`'s dev server and `vertex-api` up.

## Environment variables

See [`.env.example`](./.env.example) for the full, documented list. In short:

| Variable | Used by | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | root layout, `sitemap.ts`, `robots.ts`, post pages | Must be the real production URL in deployment, or canonical/OG URLs silently point at `localhost`. |
| `VERTEX_API_URL` | Server Actions/Components | Server-only; never sent to the browser. |
| `NEXT_PUBLIC_VERTEX_API_URL` | `LoginModal`, `LinkGithubButton` | Browser-readable — these open the OAuth popup directly against vertex-api. |
| `NEXT_PUBLIC_GA_ID` | root layout | Optional; Analytics is skipped entirely if unset. |

## Architecture notes

- **Route groups, not folders-as-decoration.** `(blog)` and `(blog-admin)` share the samuelsantana.dev visual identity but differ in what chrome they render (public login trigger vs. an authenticated "Sair" menu); `blog/[slug]` is a plain segment (not a group) because it needs the literal `/blog` URL prefix. All three live under `src/app/[locale]/`.
- **`proxy.ts`, not `middleware.ts`.** Next.js 16 deprecated the latter and hard-errors if both exist. This one file does double duty: next-intl's locale routing, and gating `/dashboard/**` and `/profile` behind a session cookie check — with the locale prefix stripped first, since `/dashboard` (pt) and `/en/dashboard` need the same gate.
- **Auth state is resolved server-side and threaded down as props**, never read from `localStorage` or an unauthenticated client guess — the access token is `HttpOnly` and simply isn't visible to client code.

## Related repository

- [vertex-api](https://github.com/samuelcsantana/vertex-api) — the NestJS + Fastify + Drizzle backend this app talks to.
