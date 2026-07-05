# Vertex Web - System Context & AI Agent Rules

## 🎯 Project Objective
Vertex Web is the "Front Door" (marketing and technical blog) of a SaaS ecosystem. It is designed to showcase high-level software architecture, web performance, and technical depth for international Senior/Tech Lead engineering roles.

## 🌍 Language & Localization
- **STRICT RULE:** The entire codebase MUST be written in English.
- This includes components, variables, comments, documentation, commit messages, and routing.

## 🛠️ Tech Stack & Architecture
- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (Base UI primitives)
- **Content:** MDX for dynamic and interactive blog posts.
- **Data Fetching:** React Server Components (RSC) by default.

## 🏗️ Design Patterns & React Best Practices
- **Server-First Approach:** Default to Server Components. Only add `'use client'` at the lowest possible leaf node in the component tree where interactivity (hooks, event listeners) is strictly required.
- **Folder Structure:** Follow a Feature-Sliced / Domain-driven organization inside `src/` (e.g., `src/features/blog`, `src/features/auth`, `src/components/ui`). Do not dump everything into a flat `components` folder.
- **State Management:** Prefer URL Search Params and Next.js Server Actions. Minimize global client state.
- **Performance:** Optimize for Core Web Vitals. Utilize `next/image`, `next/font`, and dynamic imports for heavy interactive MDX components.
- **Security:** Do not expose sensitive API logic. Trust HttpOnly cookies for auth state integration with `vertex-api`.
- **Edge Interception:** For route interception at the Edge, use the Next.js 16 `proxy.ts` convention instead of the deprecated `middleware.ts`.
- **Authentication:** There is no standalone `/login` route. Sign-in happens through the `LoginModal` (triggered from the header), which calls the real `loginAction` Server Action. Unauthenticated access to protected routes (`/dashboard/**`, gated by `proxy.ts`) redirects to `/`, not to a login page. `logoutAction` takes an optional `redirectTo`: omit it on public pages so the visitor stays put after signing out; pass a path (e.g. `/`) on admin-only pages that can't be rendered once signed out.

## 🧩 Route Groups & Dual Visual Identity
The app currently runs **two distinct visual identities** side by side, split across route groups. The true root `src/app/layout.tsx` only sets up fonts, `<html>/<body>`, and `ThemeProvider` — it renders no chrome of its own, so each group below supplies its own Header/Footer:
- **`(site)`** — the original neutral "Vertex" Shadcn theme (light/dark via `next-themes`). Contains `/projects`, `/dashboard` (hub), `/dashboard/projects`. Chrome: `src/components/layout/Header.tsx` + `Footer.tsx`.
- **`(blog)`** — the public "samuel.dev" identity (fixed dark, emerald/cyan accents, glass header). Contains `/` (the blog home/listing — **this is the site's main entry point now**, not `(site)`'s old hero page). Chrome + shared pieces live in `src/components/blog-identity/`.
- **`(blog-admin)`** — same samuel.dev identity, for real authenticated post management. Contains `/dashboard/posts` and `/dashboard/posts/[id]/edit`. Its header shows a real "Sair" (logout) instead of the public "Login" trigger, since these routes are already gated by `proxy.ts`.
- **`blog/`** (no parentheses, a real path segment) — `/blog/[slug]`, the individual post reading page. Same samuel.dev identity/chrome as `(blog)`, kept as a plain segment (not a group) because it needs the literal `/blog` URL prefix; `blog/page.tsx` is just a `redirect("/")` for the old `/blog` index.

When adding a new route, decide which identity it belongs to before picking a folder — don't assume `(site)`'s Header/Footer apply everywhere.

## 🌿 Version Control & Git Strategy
- **Branching Model:** Gitflow standard (`main`, `develop`, `feature/*`, `bugfix/*`).
- **Semantic Commits:** ALL commit messages MUST follow the Conventional Commits specification strictly in English (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).
- **Atomic Commits:** Commits MUST be atomic, representing a single logical change.
- **AI Git Execution:** When asked to commit, analyze staged files, craft an appropriate Semantic Commit in English.

## 🤖 AI Assistant Directives
1. **Always read this file** when starting a new session or generating UI components.
2. **No interactive inputs:** Always use non-interactive CLI flags (e.g., `--yes`, `--ts`, `--tailwind`, `--app`, `--src-dir`, `-d`).
3. **Shadcn UI:** When adding new components, always use the Shadcn CLI natively.
