# Developer Guide

This guide collects implementation details for contributors and maintainers. The README files are intentionally product-focused; technical details live here.

## Provider Architecture

Market data is loaded through provider implementations under `lib/providers/`.

Current providers:

- `PoedbTwProvider`
  - Realm: `TW`
  - Primary market source for Taiwan Realm data
  - Reads PoEDB TW Economy pages
- `PoeNinjaProvider`
  - Realm: `Global`
  - Fallback provider only
  - Used when PoEDB is unavailable, parsing fails, or a category is missing

Provider contract:

```ts
interface MarketDataProvider {
  name: string;
  realm: "TW" | "Global";
  fetchCategory(category: MarketCategory): Promise<MarketItem[]>;
  fetchAll(): Promise<MarketItem[]>;
}
```

Provider output is normalized before reaching the UI. UI components should not depend on PoEDB HTML structure or poe.ninja response shapes.

## Normalization

Normalization lives in `lib/normalize.ts`.

Responsibilities:

- Convert provider-specific rows into `MarketItem`.
- Attach `MarketCategory`.
- Resolve Traditional Chinese names from `config/i18n/*`.
- Preserve English names for search.
- Convert prices into chaos-equivalent values.
- Convert source activity/count fields into heat or estimated heat.

## Static Export

GitHub Pages does not provide a server runtime, so public deployment uses static export.

Build-time data files:

- `public/data/market.json`
- `public/data/meta.json`

Static site output:

- `out/`

The frontend reads static data through `lib/marketData.ts`. This keeps the UI independent from provider implementations and leaves room for future server/provider modes.

## Docker Details

Local development is Docker-first.

```bash
docker compose up --build
```

Development behavior:

1. Install dependencies inside Docker with `npm ci`.
2. Attempt to generate `public/data/market.json` and `public/data/meta.json`.
3. Start `next dev` on port `3000`.

Host `node_modules` is not used. Dependencies are isolated through Docker volumes.

Useful commands:

```bash
docker compose down
docker compose down -v
docker compose exec web npm run build:market-data
docker compose exec web npm run build
docker compose exec web npm run build:pages
```

Production preview:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

This serves the generated `out/` directory with `scripts/serve-static.mjs`.

## GitHub Actions

GitHub Pages deployment is defined in:

```text
.github/workflows/deploy-pages.yml
```

Workflow triggers:

- Push to `main`
- Push to `master`
- Manual `workflow_dispatch`
- Scheduled refresh

Deployment flow:

1. Checkout repository.
2. Set up GitHub Pages.
3. Set up Node.
4. Install dependencies with `npm ci`.
5. Run `npm run build:market-data`.
6. Configure `NEXT_PUBLIC_BASE_PATH`.
7. Run `npm run build`.
8. Upload `out/`.
9. Deploy to GitHub Pages.

## Base Path Rules

For a user or organization site:

```text
username.github.io
```

`NEXT_PUBLIC_BASE_PATH` should be empty.

For a project site:

```text
username.github.io/repository
```

`NEXT_PUBLIC_BASE_PATH` should be:

```text
/repository
```

The workflow derives this from `github.event.repository.name`.

## Build Pipeline

Market data build:

```bash
npm run build:market-data
```

Full static export:

```bash
npm run build:pages
```

Build pipeline:

```text
PoEDB TW Economy
        |
        v
Provider Layer
        |
        v
PoEDB Parser / poe.ninja Fallback
        |
        v
Normalization
        |
        v
public/data/market.json
public/data/meta.json
        |
        v
Next.js Static Export
        |
        v
out/
```

`meta.json` includes:

- `updatedAt`
- `source`
- `categorySources`
- `stale`
- `errorMessage`
- `itemCount`

If a market update fails but a previous successful dataset exists, the build keeps the previous `market.json` and marks `meta.json` as stale.

## Public Release Safety

Do not commit:

- `.env`
- `POESESSID`
- Account cookies
- Tokens
- API keys
- Personal local paths

GitHub Pages should serve static JSON generated at build time. Avoid browser-side bulk requests to PoEDB.
