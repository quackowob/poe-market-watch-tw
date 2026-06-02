# Development Notes

## Docker-First

- Local development should only require Docker and Docker Compose.
- Do not require users to install local Node.js, npm, or pnpm.
- Do not rely on host `node_modules`.
- `node_modules` must stay isolated in Docker volumes.

## Version Control

- Keep project changes in Git.
- Check `git status --short` before and after edits.
- Commit meaningful completed work.
- Do not commit unrelated generated files or local secrets.
- Preserve user changes when the worktree is dirty.

## Files That Must Not Be Committed

- `.env`
- `.env.local`
- `POESESSID`
- Personal accounts, cookies, tokens, or API keys
- `node_modules`
- `.next`
- `out`
- `dist`
- `*.log`

## Data Architecture

- GitHub Pages builds must not use a server runtime.
- Market data for public static builds is generated at build time.
- Generated static data lives in:
  - `public/data/market.json`
  - `public/data/meta.json`
- UI pages should read through `lib/marketData.ts`, not directly from providers.
- Provider implementations should remain available for future server/local modes.

## PoEDB Usage

- PoEDB TW Economy is the primary market source for Taiwan server data.
- poe.ninja is fallback only.
- Do not make high-volume PoEDB requests from the browser.
- Crawler requests must use timeout, retry backoff, error handling, and a clear User-Agent.
- Default update frequency should not be lower than 30 minutes.

## Static Export Checks

Before shipping GitHub Pages-related changes, verify when Docker is available:

```bash
docker compose up -d --build
docker compose exec web npm run build:pages
docker compose -f docker-compose.prod.yml up -d --build
```

Expected results:

- `public/data/market.json` is generated.
- `public/data/meta.json` has `updatedAt`, `source`, `stale`, and `itemCount`.
- `next build` exports static pages into `out/`.
- Production Docker serves `out/` with `scripts/serve-static.mjs`.

