# syntax=docker/dockerfile:1

# Production stays on Vercel — this image exists for local-dev parity with
# vertex-api's Docker setup, not as a deployment artifact. It deliberately
# does NOT use Next.js's `output: "standalone"` build (which would require a
# next.config.ts change with zero local-dev benefit and unknown risk to the
# Vercel deployment); it just runs a plain `npm run build` + `npm start`
# instead, at the cost of a heavier image.

# ---- builder: install deps and build the app ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Next.js inlines NEXT_PUBLIC_* vars into the client bundle at build time
# (same reasoning as Vite's VITE_* vars) — this must be a build arg, not a
# runtime environment variable, or the browser bundle would keep pointing at
# whatever default was baked in here.
ARG NEXT_PUBLIC_VERTEX_API_URL=http://localhost:3020
ENV NEXT_PUBLIC_VERTEX_API_URL=${NEXT_PUBLIC_VERTEX_API_URL}

RUN npm run build

# ---- runner: run the production server ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3021

# `next start` defaults to port 3000. package.json's "start" script is
# pinned to `next start -p 3021` (kept in sync with local non-Docker dev —
# see package.json), so plain `npm start` already binds the right port here.
CMD ["npm", "start"]
