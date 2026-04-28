# syntax=docker/dockerfile:1.7

# Multi-stage build for the omega-interface Next.js app.
# Builds the standalone server bundle and runs it under a non-root user
# on a minimal alpine runtime. Final image is ~150 MB.
#
# Build context expects the omega-interface repo root. Design tokens
# (`app/app/_generated/tokens.css`) are committed, so the build does not
# need the omega-docs sibling — `pnpm sync-tokens` is skipped here and
# the runtime uses the in-repo file. Token drift is caught upstream by
# the pre-commit hook on the docs repo.

ARG NODE_VERSION=20.18-alpine

# ──────────────────────────────────────────────────────────────────────
# deps — install with the workspace's pinned pnpm version
# ──────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /repo

RUN npm install -g pnpm@10.33.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/package.json ./app/

RUN pnpm install --frozen-lockfile --ignore-scripts

# ──────────────────────────────────────────────────────────────────────
# builder — produce the standalone Next.js server bundle
# ──────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /repo

RUN npm install -g pnpm@10.33.0

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/app/node_modules ./app/node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Skip the `sync-tokens` workspace wrapper (depends on the omega-docs
# sibling which isn't in this build context). Use the committed
# tokens.css and run the app build directly.
RUN pnpm --filter @omega/app build

# ──────────────────────────────────────────────────────────────────────
# runner — minimal runtime image with the standalone server
# ──────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /repo/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/app/.next/static ./app/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/app/public ./app/public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "app/server.js"]
