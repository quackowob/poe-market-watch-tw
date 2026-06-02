# POE Market Watch

A market monitoring dashboard for **Path of Exile 1 Taiwan Realm** (`Mirage` League / `遠古蜃景`).

English | [繁體中文](README.zh-TW.md)

Live Demo: [https://quackowob.github.io/poe-market-watch-tw/](https://quackowob.github.io/poe-market-watch-tw/)

POE Market Watch is designed for players who primarily farm:

* Strongboxes
* Bestiary
* Delirium

The goal is to quickly identify:

* High-value drops
* Trending items
* Active market categories
* Valuable Strongbox loot
* Items worth keeping or selling

## Features

* Dashboard focused on Strongbox-related loot and high-value items.
* Dedicated pages for:

  * Scarabs
  * Delirium Orbs
  * Beasts
  * Divination Cards
  * Currency
  * Fragments
* Traditional Chinese item names displayed by default.
* English names preserved for search and filtering.
* Favorites / watchlist support.
* Market data snapshots exported to:

  * `public/data/market.json`
  * `public/data/meta.json`
* Data staleness warning when data is older than 2 hours.

## Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Scarabs

![Scarabs](docs/screenshots/scarabs.png)

### Delirium Orbs

![Delirium Orbs](docs/screenshots/delirium-orbs.png)

### Beasts

![Beasts](docs/screenshots/beasts.png)

### Divination Cards

![Divination Cards](docs/screenshots/divination-cards.png)

## Data Sources

### Primary Source

* PoEDB TW Economy

### Fallback Source

* poe.ninja

poe.ninja is only used when:

* PoEDB is unavailable
* Parsing fails
* A category is missing from PoEDB

### Notes

* Taiwan Realm prices may differ significantly from Global Realm prices.
* Prices are provided for reference only.
* Market activity is displayed as **Popularity** or **Estimated Popularity**.
* Popularity does not represent official trade volume.

## Architecture

```text
PoEDB TW Economy
        │
        ▼
 Provider Layer
        │
        ▼
 Normalization
        │
        ▼
  MarketItem
        │
        ▼
 Dashboard UI
```

### Static Export Data Flow

```text
Build Step
     │
     ▼
PoEDB / Fallback Providers
     │
     ▼
public/data/*.json
     │
     ▼
Frontend UI
```

GitHub Pages uses pre-generated static data and does not rely on a server runtime.

## Disclaimer

POE Market Watch is an unofficial community project.

This project is not affiliated with or endorsed by Grinding Gear Games.

Path of Exile, GGG, PoEDB, poe.ninja, and all related trademarks, names, icons, and assets belong to their respective owners.

Do not commit:

* POESESSID
* Account cookies
* API keys
* Personal tokens

to public repositories.

## Local Development (Docker)

Create a local environment file:

```bash
cp .env.example .env
```

Start development:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000
```

The development container will:

1. Install dependencies with `npm ci` from `package-lock.json`.
2. Generate market data.
3. Start Next.js with hot reload enabled.

Stop:

```bash
docker compose down
```

Remove volumes:

```bash
docker compose down -v
```

## Static Production Preview

Build and run the static export:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Open:

```text
http://localhost:3000
```

This mode serves the generated `out/` directory and does not use a Next.js runtime server.

Stop:

```bash
docker compose -f docker-compose.prod.yml down
```

## Market Data

Generate market data manually:

```bash
docker compose exec web npm run build:market-data
```

Generate market data and export the full static site:

```bash
docker compose exec web npm run build:pages
```

Output:

```text
public/data/market.json
public/data/meta.json
```

`meta.json` contains:

* updatedAt
* source
* stale
* errorMessage
* itemCount

If a market update fails, the last successful dataset is preserved and marked as stale.

## GitHub Pages Deployment

Workflow:

```text
.github/workflows/deploy-pages.yml
```

Deployment flow:

1. Install dependencies.
2. Generate market data.
3. Configure base path.
4. Build static pages.
5. Deploy the generated `out/` directory.

The workflow also refreshes market data every 30 minutes.

## Useful Scripts

```bash
npm run build:market-data
npm run build:pages
npm run build:i18n
npm run update:i18n:beasts
npm run report:i18n
```

When developing locally:

```bash
docker compose exec web npm run <script>
```

## Known Limitations

* PoEDB does not provide stable public APIs for all categories.
* Some data is collected through HTML parsing.
* Beast data may require poe.ninja fallback support.
* GitHub Pages data can become stale between scheduled updates.
* Historical price storage is not implemented yet.
* Price alerts and Discord notifications are not implemented yet.

## Roadmap

* Public screenshots
* Improved cache diagnostics
* Price alerts
* Discord notifications
* Historical price charts
* Stash scanning
* Local POESESSID integration
* External storage for long-term historical data

## License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

Path of Exile, GGG, PoEDB, poe.ninja, and related assets belong to their respective owners.

If PoEDB wiki content is referenced or reused, its original licensing terms must be respected.
