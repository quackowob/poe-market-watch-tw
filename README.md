# POE Market Watch

Path of Exile 1 market dashboard for the Taiwan server `Mirage` league (`遠古蜃景`).

The project is currently optimized for two workflows:

- Local Docker-first development with hot reload.
- Static GitHub Pages deployment with build-time market data generation.

No local Node.js, npm, or pnpm installation is required for Docker development.

## Features

- Dashboard for strongbox-related drops and high-value items.
- Pages for Scarabs, Delirium Orbs, Beasts, Divination Cards, Currency, and Fragments.
- Traditional Chinese item display with English names preserved for search.
- Favorite items and customizable dashboard/navigation order.
- Static market snapshot served from `public/data/market.json`.
- Data freshness metadata served from `public/data/meta.json`.
- Stale-data warning when the snapshot is older than 2 hours.

## Screenshots

Placeholder for public release screenshots:

- Dashboard
- Scarabs
- Delirium Orbs
- Beasts
- Divination Cards

## Data Sources

Primary source:

- PoEDB TW Economy

Fallback source:

- poe.ninja, used only when PoEDB is unavailable, parsing fails, or a category is missing.

Important notes:

- Taiwan server and global server prices can differ significantly.
- Prices are references only and are not guaranteed trade prices.
- Heat values are market activity estimates and must not be treated as official transaction volume.
- `volume`, `count`, and `listingCount` in source data are displayed as heat or estimated heat in the UI.

## Unofficial Disclaimer

POE Market Watch is not an official Grinding Gear Games tool and is not affiliated with Grinding Gear Games.

Path of Exile, GGG, PoEDB, poe.ninja, related names, icons, and data belong to their respective rights holders.

Do not put `POESESSID`, account cookies, tokens, or API keys in a public repository.

## Docker Local Development

Create `.env`:

```bash
cp .env.example .env
```

Start local development:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000
```

The dev container will:

1. Install dependencies inside Docker.
2. Generate `public/data/market.json` and `public/data/meta.json`.
3. Start `next dev` with hot reload.

Stop:

```bash
docker compose down
```

Clear Docker volumes:

```bash
docker compose down -v
```

## Static Production Preview

Build and serve the static export locally:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Open:

```text
http://localhost:3000
```

This mode serves `out/` with `scripts/serve-static.mjs`. It does not use a Next.js server runtime.

Stop:

```bash
docker compose -f docker-compose.prod.yml down
```

## Market Data

Generate market data manually:

```bash
docker compose exec web npm run build:market-data
```

Generate market data and static export:

```bash
docker compose exec web npm run build:pages
```

Output:

```text
public/data/market.json
public/data/meta.json
```

`meta.json` contains:

- `updatedAt`
- `source`
- `stale`
- `errorMessage`
- `itemCount`

If a market data update fails and a previous successful `market.json` exists, the previous snapshot is kept and `meta.json` is marked stale.

## GitHub Pages Deployment

Workflow:

```text
.github/workflows/deploy-pages.yml
```

The workflow:

1. Installs dependencies with `npm install --no-package-lock`.
2. Runs `npm run build:market-data`.
3. Configures `NEXT_PUBLIC_BASE_PATH` for project pages.
4. Runs `npm run build`.
5. Uploads `out/` to GitHub Pages.

Repository settings:

1. Enable GitHub Pages.
2. Set Pages source to GitHub Actions.
3. Ensure Actions permissions allow Pages deployment.

The workflow also runs on a 30-minute schedule.

## Static Export Design

GitHub Pages does not provide a server runtime. Runtime data fetching is therefore avoided in UI routes.

Current data path:

```text
build step -> PoEDB / fallback providers -> public/data/*.json -> frontend
```

The UI reads through `lib/marketData.ts`, not directly from provider implementations. This keeps the option open to switch local/server builds back to provider-based fetching later.

Do not make high-volume direct PoEDB requests from the browser. Do not use GitHub Pages as a high-frequency API server.

## Useful Scripts

```bash
npm run build:market-data
npm run build:pages
npm run build:i18n
npm run update:i18n:beasts
npm run report:i18n
```

Run these through Docker for normal local work:

```bash
docker compose exec web npm run <script>
```

## Known Limitations

- PoEDB does not provide a stable public JSON API for every category, so some data is parsed from HTML.
- Beast data currently may require poe.ninja fallback.
- GitHub Pages data can become stale between scheduled builds.
- Historical price storage is not implemented.
- No price alert or Discord notification system is implemented yet.

## Roadmap

- Public screenshots
- Better static data cache diagnostics
- Price alerts
- Discord notifications
- Historical price charts
- Stash scanning
- Private local `POESESSID` integrations
- External storage for long-term historical data

## License

Project code is licensed under MIT. See `LICENSE`.

PoE, PoEDB, poe.ninja, GGG names, icons, and data rights belong to their respective rights holders. If PoEDB wiki content is quoted or reused, follow PoEDB's content license terms.
