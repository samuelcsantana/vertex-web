# Rendering strategies

What renders when, for every route in this app, and why. Written against measured build output rather than
inferred from the source — the two disagreed, and the source was wrong.

## Summary

| | |
|---|---|
| **SSG + ISR** | `/` (home/listing), `/blog` (redirect), `/auth/callback` — prerendered per locale, revalidated every 60s |
| **SSR by requirement** | `/dashboard/**`, `/profile` — declared with `force-dynamic` |
| **SSR by constraint** | `/about`, `/blog/[slug]` — see [What is left](#what-is-left) |
| **RSC + CSR** | throughout; `'use client'` only at interactive leaves |

## How to read the current state

`npm run build` prints the authoritative answer. `○` is static, `●` is prerendered via `generateStaticParams`,
`ƒ` is per-request:

```
Route (app)                              Revalidate  Expire
├ ● /[locale]                                    1m      1y
│ ├ /pt
│ ├ /en
│ └ /es
├ ƒ /[locale]/about
├ ƒ /[locale]/blog/[slug]
├ ƒ /[locale]/dashboard/posts
```

Do not infer the strategy from the source. Two things that look like proof are not:

- **`generateStaticParams` being present does not make a route static.** It declares which params to prerender;
  anything dynamic in the render still forces per-request rendering, and the route silently comes out `ƒ`.
- **`next: { revalidate: 60 }` on a `fetch` is not ISR.** It is Data Cache revalidation. A page can be rebuilt
  from scratch on every request while those fetches are served from cache. ISR is the page itself being
  regenerated — the `Revalidate` column above is where that shows up.

Before the work described below, every route in this app was `ƒ` while the code contained both of those signals.

## What made everything dynamic

### The authenticated header (fixed)

`BlogHeader` read the auth cookie in a Server Component to choose between the login button and the account menu,
and it is rendered from `(blog)/layout.tsx`. **One component in a layout made every public page per-request** — a
page with no data of its own still came out `ƒ`, which is how this was found.

The shape of that design was the actual problem: every anonymous visitor paid for a `getProfile` round trip to
vertex-api so that the site's single admin could see edit buttons.

Auth is now resolved after hydration instead:

- `GET /api/me` reads the HttpOnly cookie server-side and returns the narrow `CurrentUser` shape (no token, no
  raw JWT claims). It is the only place client code can learn who it is.
- `CurrentUserProvider` sits in `(blog)/layout.tsx` and fetches it once for the whole public tree, so the header
  and any admin controls inside a page share one request.
- `BlogHeader`, `HomeAdminPanel` and `PostAdminActions` read that context.

Two properties this has to preserve, and does:

- **`isAuthenticated` is not `user !== null`.** Cookie presence gates the authenticated header; the profile call
  only supplies avatar and name. A vertex-api hiccup must not flip a signed-in visitor back to a login button, so
  `/api/me` returns both flags separately.
- **Admin controls render nothing, not hidden markup.** `PostAdminActions`/`HomeAdminPanel` return `null` for
  non-admins. Whatever they returned would otherwise be baked into HTML served to every visitor. Verified against
  the prerendered output: `.next/server/app/pt.html` contains no `/dashboard` link.

Authorisation itself did not move. `deletePostAction` still re-reads the cookie server-side and vertex-api still
enforces the role — resolving `isAdmin` on the client is presentation only and cannot grant anything.

**Cost:** the signed-in owner briefly sees the logged-out header before `/api/me` answers. Nobody else does; for
every other visitor the first paint is already the final state.

**Consequence to remember:** auth state is now React state, so a Server Action that changes the cookie no longer
updates the UI by itself. `router.refresh()` re-fetches the RSC payload but cannot touch client context. Every
login/logout path therefore also calls `refresh()` from `useCurrentUser` — see `LoginModal` and
`AdminHeaderActions`. The `(blog-admin)` tree has no provider and still resolves the profile server-side, where
that call is a deliberate no-op.

### next-intl reading the request (fixed)

`[locale]/layout.tsx`'s `generateMetadata` called `getLocale()`, which resolves the locale from request headers.
In the **root** layout that single call opted the entire app into per-request rendering, invisibly and
independently of any real reason.

It now reads `params.locale` with a `hasLocale` fallback — same behaviour for a garbage locale segment, no request
access — and `setRequestLocale(locale)` is called in **every layout and page that should prerender**, not only the
root one. That last part matters: layouts and pages render concurrently, so a child can reach for the locale
before an ancestor has cached it and fall back to headers. The home page stayed `ƒ` until `(blog)/layout.tsx` got
its own call, because `BlogFooter` translates.

## What is left

`/about` and `/blog/[slug]` are still per-request, each for its own reason.

**Both:** `getSiteUrl()` (`src/lib/site-url.ts`) reads the `Host` header, and it is called from `generateMetadata`.
Metadata cannot be deferred behind Suspense, so any route whose metadata needs the host is per-request, full stop.

The alternative is to treat the canonical origin as a constant (`NEXT_PUBLIC_SITE_URL`, pointed at the www variant
the apex already redirects to) rather than an observation of what served the request. The honest state of that
argument:

- **For the constant:** the original bug it fixed was the env var pointing at the apex domain, which is a value
  problem, not a mechanism problem. A canonical URL is a decision about which URL is authoritative, not an
  observation of which host answered.
- **Against, and this one is verified:** the current behaviour was tested live against LinkedIn's crawler. The
  replacement has not been.
- **An argument that does *not* hold up:** that host-derivation leaks preview deployments into the index. Checked
  on a real preview — Vercel puts previews behind SSO and serves them with `X-Robots-Tag: noindex`, so a crawler
  never sees the self-referencing canonical or the sitemap that `robots.ts` derives the same way. Worth recording
  because it was raised as a reason to switch, and it is not one.

Which leaves the trade-off narrower than it first looked: a verified SEO behaviour on one side, two routes that
cannot be prerendered on the other.

**`/blog/[slug]` additionally:** the page resolves the signed-in user for `CommentsSection`, not just for admin
controls. That is a real per-request dependency and a larger refactor than the header was — the comments UI would
need to fetch its own author identity. There is no point starting it while the metadata constraint above keeps the
route dynamic anyway.

## Operational notes

- **A build during a vertex-api outage bakes an empty page.** `getPosts()` swallows fetch failures and returns
  `[]`, so the home page prerenders its "no posts yet" state and serves it until the next revalidation. ISR bounds
  the exposure to ~60s after the first request once the API is back. Under the previous SSR setup the same outage
  produced the same empty page, just per request; SSG extends the duration rather than introducing the failure. If
  that window is ever unacceptable, the fix is to let the build fail loudly instead of swallowing the error.
- **Login and logout invalidate the whole ISR cache.** `loginAction`/`logoutAction` call
  `revalidatePath("/", "layout")`, which existed to bust the server-rendered header. The header no longer needs
  it, but other flows still rely on those calls, so they stay. Only the site owner logs in, so the cost is
  negligible — but it is the reason a logout regenerates the home page.
- **`revalidatePath("/", "layout")` is deliberate, not lazy.** `post-actions.ts` documents that the narrower
  variants were tested and verified not to bust the listing cache.

## Attempted and reverted: Cache Components

Next.js 16 can move the static/dynamic boundary from the route to the component: a page prerenders a static shell
and each request-dependent part streams in as a Suspense hole. That would have solved the header problem without
moving auth to the client, and would also cover `/blog/[slug]`'s comments.

`cacheComponents: true` was enabled and worked through: route segment configs are rejected by the flag, `new Date()`
in the footer's copyright line needed `use cache` + `cacheLife`, and the cookie reads needed Suspense boundaries.

**It was reverted, blocked by next-intl 4.13.1.** That version resolves its config per request via
`getRequestConfig` and has no awareness of `use cache`, so every Server Component that translates counts as
uncached data accessed outside Suspense. The build fails on `BlogHeaderShell`, which only calls
`useTranslations("Navigation")`. Caching the message catalogs behind `use cache` was tried and does not help — the
blocker is the per-request config resolution, not the messages. Since the header, footer and nav all translate,
there is no prerenderable shell left to salvage.

Revisit when next-intl supports Cache Components. The Suspense boundaries added during the attempt were kept in
`(blog-admin)/layout.tsx` and `dashboard/layout.tsx`, where they still pay for themselves as streaming boundaries:
the chrome flushes without waiting on the profile round trip.
