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

## 🌿 Version Control & Git Strategy
- **Branching Model:** Gitflow standard (`main`, `develop`, `feature/*`, `bugfix/*`).
- **Semantic Commits:** ALL commit messages MUST follow the Conventional Commits specification strictly in English (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).
- **Atomic Commits:** Commits MUST be atomic, representing a single logical change.
- **AI Git Execution:** When asked to commit, analyze staged files, craft an appropriate Semantic Commit in English.

## 🤖 AI Assistant Directives
1. **Always read this file** when starting a new session or generating UI components.
2. **No interactive inputs:** Always use non-interactive CLI flags (e.g., `--yes`, `--ts`, `--tailwind`, `--app`, `--src-dir`, `-d`).
3. **Shadcn UI:** When adding new components, always use the Shadcn CLI natively.
