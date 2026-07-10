---
name: verify
description: How to launch and drive vertex-web end-to-end for runtime verification (dev servers, seeded data, surface probes).
---

# Verifying vertex-web at runtime

## Prerequisites
- Postgres runs via vertex-api's docker compose: container `vertex-api-postgres-1`, port 5432, credentials `user`/`password`, database `vertex_api` (from `D:\github\vertex-api\.env`). Check with `docker ps` — it's often already up.
- vertex-api lives at `D:\github\vertex-api` and must be running for any page that fetches posts/profile.

## Launch
```powershell
# In D:\github\vertex-api (background):
npm run start:dev        # NestJS on :3333

# In D:\github\vertex-web (background):
npm run dev              # Next.js on :3000
```
Wait for both ports with `Test-NetConnection localhost -Port 3333/3000`. First page compile after boot takes several seconds — allow generous timeouts on the first request.

## Test data
`npm run db:seed` in vertex-api only creates topics + users, **no posts**. Insert posts directly (author ids: `SELECT id FROM users LIMIT 1`):

```powershell
docker exec vertex-api-postgres-1 psql -U user -d vertex_api -c "INSERT INTO posts (title, slug, content, is_published, author_id) VALUES ('T', 't-slug', '## body', true, '<user-uuid>');"
```
Columns are snake_case (`slug_en`, `content_en`, `is_published`). Delete your rows afterwards.

## Driving the surface
- Pages are RSC/SSR — `Invoke-WebRequest` response bodies contain the rendered HTML, good enough for content/metadata assertions (canonical: `<link rel="canonical"...>`; hreflang arrives as a `Link` response header too).
- **Gotcha:** every page embeds the full next-intl messages JSON in the RSC payload, so grepping for message *text* false-positives on pages that don't render it. Match rendered-only markers instead (e.g. a conditional element's Tailwind classes like `border-cyan-500/30`).
- Locale detection: `Accept-Language: en-US,en;q=0.9` on an unprefixed URL triggers the 307 to `/en/...`. A `Cookie: NEXT_LOCALE=...` header sent via `Invoke-WebRequest -Headers` did NOT influence routing in testing — don't rely on it; use Accept-Language.
- Client-side behavior (LanguageSwitcher, dialogs): Playwright is installed. From a script outside the repo, import via absolute URL: `import { chromium } from "file:///D:/github/vertex-web/node_modules/playwright/index.mjs"`. `npx playwright screenshot <url> <file>` works for quick captures.

## Cleanup
Delete inserted posts, then kill the listeners:
```powershell
Get-NetTCPConnection -LocalPort 3000,3333 -State Listen | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -Confirm:$false }
```
