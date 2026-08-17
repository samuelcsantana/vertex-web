# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

vertex-web is the Next.js frontend for samuelsantana.dev — a personal engineering blog / technical portfolio built
as a showcase of senior-level frontend architecture. It talks to **vertex-api** (a separate NestJS + Fastify +
Drizzle repo, `D:\github\vertex-api`) over REST. The two apps are deployed on different domains (Vercel vs. Render),
which drives several architectural decisions below (cross-domain OAuth, runtime-derived canonical URLs).

This repo's own `AGENTS.md` is the canonical, exhaustive AI-agent rules doc — read it before touching auth, i18n,
route groups, or accessibility patterns. This file summarizes the same ground plus commands; when the two disagree,
`AGENTS.md` wins.

**This Next.js version has breaking changes vs. your training data.** Check `node_modules/next/dist/docs/` for the
relevant guide before writing App Router code, and heed deprecation notices (e.g. `proxy.ts` vs `middleware.ts`
below).

## Commands

```bash
npm install
cp .env.example .env.local   # fill in values — see README's env var table

npm run dev              # Next.js dev server on :3021 (Turbopack)
npm run build             # production build
npm start                 # serve the production build on :3021

npm run lint               # eslint

npm test                   # vitest run (unit/component)
npm run test:watch         # vitest watch mode
npm run test:coverage      # vitest with coverage
npx vitest run path/to/file.test.ts            # single file
npx vitest run -t "test name substring"        # single test by name

npm run test:e2e           # playwright — needs vertex-web dev server AND a running vertex-api instance
npx playwright test e2e/some.spec.ts           # single e2e file
```

There is no standalone typecheck script; `npm run build` (or your editor's TS server) is how type errors surface.
Husky + lint-staged run `secretlint` on staged files at commit time.

For end-to-end runtime verification (launching both dev servers, seeding data, driving pages), use the
`vertex-web:verify` skill rather than improvising — it documents the Postgres container, seed gotchas, and
locale-routing quirks (e.g. `Accept-Language` triggers locale redirects; a `NEXT_LOCALE` cookie does not).

### Docker (local dev convenience only)

`docker compose up -d --build` builds this app alongside a `vertex-api`-shaped setup. Production still deploys to
Vercel via plain `npm run build`/`npm start` (no `output: "standalone"`) — the Docker image intentionally does not
change that. Note the two API URL vars behave differently: `NEXT_PUBLIC_VERTEX_API_URL` is inlined at **build** time
(a Docker build arg), while `VERTEX_API_URL` is server-only and read at **runtime**.

## Architecture

### Tech stack
Next.js 16 (App Router, Turbopack), TypeScript strict mode, Tailwind CSS v4 (no `tailwind.config.ts` — `@plugin`
directives live in `globals.css`), `next-intl` for i18n, react-hook-form + zod, React Server Components by default.

**No component library.** `shadcn` CLI and `components.json` are still present as dev dependencies but every
component in the codebase is hand-rolled Tailwind (`src/components/blog-identity/`, forms, dialogs) — there is no
`src/components/ui`. Reaching for the Shadcn CLI would be a deliberate reintroduction, not a continuation of
existing patterns.

**Post content is Markdown in the database, not MDX files.** Bodies render client-side via `react-markdown` +
`remark-gfm` + `rehype-highlight`/`rehype-pretty-code` (see `EditPostForm`/`CreatePostForm`'s preview tab and
`blog/[slug]/page.tsx`). `@next/mdx` is configured in `next.config.ts` but nothing in the current authoring/render
path actually consumes `.mdx` files.

### Folder structure
Feature-sliced under `src/`: `src/features/{posts,auth,about,comments,topics,users}/`, each with its own
`actions/` (Server Actions), `api/` (fetch wrappers to vertex-api), `components/`, and sometimes `schemas/`
(zod) or `utils/`. Shared chrome lives in `src/components/blog-identity/`. Don't dump new code into a flat
`components/` folder — follow the existing feature slice.

### Routing: locale sub-paths + route groups
Every route lives under `src/app/[locale]/` (no bare `src/app/page.tsx`). Locales are `pt` (default, unprefixed),
`en`, `es` (`src/i18n/config.ts`), with `localePrefix: "as-needed"` — `/pt/...` is invalid and 307s to the
unprefixed path. Always import `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from `@/i18n/routing`,
never from `next/link`/`next/navigation`, or locale-awareness breaks. `notFound()` is the one exception (still from
`next/navigation`). A quirk: TS doesn't narrow `redirect(...)` from `@/i18n/routing` as `never`-returning, so every
guard-and-redirect call site uses `throw redirect(...)`.

Two route groups share one visual identity (the legacy neutral "Vertex" theme is fully deleted):
- **`(blog)`** — public: `/` (home/listing), `/about`, `blog/[slug]`. `blog/[slug]` is nested *inside* `(blog)`
  (not a sibling) specifically so it shares one `layout.tsx` instance with `/` and `/about` — previously a
  duplicated layout file caused the header to unmount/remount on navigation even though the JSX was byte-identical.
  **Never copy-paste a layout file to tweak chrome; if a route needs different chrome, it belongs in a different
  group.**
- **`(blog-admin)`** — authenticated management: `/dashboard/posts`, `/dashboard/posts/[id]/edit`,
  `/dashboard/topics`, `/dashboard/about`, `/dashboard/users`, `/profile`. Shows "Sair" (logout) instead of the
  public login trigger.
- `auth/callback/` and `robots.ts`/`sitemap.ts` are plain segments outside both groups (the latter two are required
  by Next.js file convention to sit at the true `src/app/` root, outside `[locale]/`).

### Auth: two-tier gating, cross-domain OAuth
`proxy.ts` (not `middleware.ts` — Next 16 hard-errors if both exist) does double duty: next-intl locale routing, and
gating `/dashboard/**` + `/profile` behind **access-token cookie presence** (locale prefix stripped first, so
`/dashboard` and `/en/dashboard` are recognized as the same route). Presence-only means the Edge proxy can prove
"logged in" but never "authorized as admin" — it can't verify a JWT without a network round-trip. The real
admin-role check lives in `(blog-admin)/dashboard/layout.tsx`, which calls `getProfile(accessToken)` and checks
`profile?.role === "admin"`, `throw redirect(...)`-ing otherwise. **Any new admin-only UI must check the resolved
role server-side, never just cookie presence** — a real bug shipped from trusting cookie presence as an `isAdmin`
proxy. `/profile` deliberately sits outside `dashboard/layout.tsx`'s admin gate (any authenticated user should
reach it).

There is no standalone `/login` route — sign-in happens through `LoginModal` (email/password via `loginAction`
Server Action, or OAuth popups to vertex-api's `/auth/google`/`/auth/github`).

**Cross-domain OAuth (Token Callback Pattern):** vertex-api can't set a cookie this app can read (different
domains — only appeared to work in local dev because `localhost:3000`/`3333` share a hostname). Instead: (1) the
OAuth popup navigates to vertex-api's `/auth/google|github` directly; (2) vertex-api's callback mints a
short-lived, single-use exchange code and redirects to `src/app/[locale]/auth/callback`; (3) that page strips the
code from the URL immediately (`history.replaceState`, before the exchange request fires), then calls
`exchangeOAuthCodeAction` which trades the code server-to-server (`POST /auth/exchange`) and sets this app's own
cookie; (4) since Google/GitHub's OAuth pages send a strict `Cross-Origin-Opener-Policy` that severs
`window.opener`, the callback page broadcasts success over a `BroadcastChannel` (`src/features/auth/constants.ts`)
rather than reloading the opener directly — `LoginModal` listens for that broadcast instead of polling. Read this
section (and `AGENTS.md`'s longer version) before touching anything under `src/features/auth/` or the OAuth popups.

### i18n beyond UI strings
Per-locale content is a data-model concern, not just message catalogs: posts (title/slug/content/metaDescription)
and About content carry optional `...En`/`...Es` fields alongside required pt ones. `getLocalizedContent` /
`getTranslatedLocales` (`src/features/posts/utils/localized-content.ts`) are deliberately shape-generic so both
posts and `/about` share the same resolution helpers. A locale without its own translation renders the pt text plus
an amber fallback notice; admin forms use the same pt/en/es tab pattern everywhere.

User-facing API errors are translated **by code, not by hardcoded strings**. vertex-api attaches a machine-readable
`code` to every visitor-facing error; resolve via `apiErrorMessage(response, fallbackKey)` /
`apiErrorsTranslator()` (`src/lib/api-error-message.ts`), which map to the `ApiErrors` message namespace.
`src/lib/api-error-codes.ts` must stay in sync with vertex-api's `src/common/constants/error-codes.ts` — a new
user-facing failure needs a code in both repos plus an `ApiErrors` key in all three locale files.

`sitemap.ts` emits per-locale entries with real hreflang alternates; routes with per-locale DB content (posts,
`/about`) only get entries for locales they're genuinely translated into, via `getTranslatedLocales` — otherwise
crawlers get hreflang pointing at duplicate pt content under the wrong language tag.

### SEO: runtime-derived URLs
Canonical/OG/sitemap/robots URLs are derived from the request's `Host` header at runtime
(`src/lib/site-url.ts`), not solely from `NEXT_PUBLIC_SITE_URL` — so they always match whatever domain actually
served the request. The env var still feeds the root layout's static `metadataBase` and the no-request fallback.

### Accessibility conventions (standing rules post-WCAG audit)
- Any new modal/dialog/popover must use `src/hooks/useDialogBehavior.ts` (focus trap, Escape-to-close,
  initial-focus, focus-restoration) — see `ConfirmDialog.tsx`/`LoginModal.tsx` for the
  `role="dialog" aria-modal="true" aria-labelledby={titleId}` pairing.
- Any surface rendering user-authored Markdown should reuse
  `src/components/blog-identity/markdownHeadingComponents.tsx`'s `createHeadingComponents(headings?)` (remaps
  `h1`→`h2` etc. so authored content never produces a second `<h1>`). Pass a `headings` array from
  `extractHeadings` (`src/features/posts/utils/extract-headings.ts`) to get matching `id`s for
  `<TableOfContents>` — the id derivation happens once, in one place, so the sidebar and anchors can't drift.
- `text-slate-500` is banned (fails 4.5:1 on dark backgrounds) — use `text-slate-400`. Focus rings use
  `ring-emerald-500/70`, not `/50`.
- Every form input needs a real `<label htmlFor>`, `aria-invalid` + `aria-describedby` → `id="{field}-error"` with
  `role="alert"` on validation error.

### Testing strategy (deliberately two layers)
- **Vitest + RTL** — pure logic (`src/features/*/utils`, `src/features/*/schemas`) and components with real
  branching behavior worth locking in. Wired into CI. Most of `src/features/**/actions` and `**/api` are thin
  Server Action forwards to vertex-api and most components are thin composition over those — deliberately not
  unit-tested; the E2E layer covers that path instead.
- **Playwright** (`e2e/`) — locale routing, language switcher, dashboard gating, mobile layout. Runs against a
  **real** vertex-api instance, no mocking. **Not wired into CI** (would require standing up Postgres + seeded
  vertex-api as CI services).

### Server Components / state
Default to Server Components; `'use client'` only at the smallest leaf needing interactivity. Prefer URL search
params and Server Actions over global client state. Auth state is resolved server-side and threaded down as
props — never read from `localStorage`, since the access token is `HttpOnly`.

## Git workflow
Gitflow (`main`, `develop`, `feature/*`, `bugfix/*`). `main` is branch-protected (no direct push, even for admins;
squash-merge only). Conventional Commits in English, enforced on the squash-merge commit that lands on `main`
(throwaway commits on a feature branch don't need to individually comply). After merging, fast-forward `develop`
from `main`.
