FROM node:22-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dev

EXPOSE 3000
CMD ["sh", "-c", "rm -rf /app/.next/* && npm ci && (npm run build:market-data || true) && npm run dev -- --hostname 0.0.0.0"]

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:pages

FROM base AS prod

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/out ./out
COPY --from=builder /app/scripts/serve-static.mjs ./scripts/serve-static.mjs

EXPOSE 3000
CMD ["npm", "run", "start"]
