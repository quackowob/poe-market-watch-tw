# POE Market Watch

POE Market Watch is a market dashboard for **Path of Exile 1 Taiwan Realm** players farming the `Mirage` league (`遠古蜃景`).

It helps players quickly scan high-value drops, active market categories, price movement, and Strongbox-related loot without digging through multiple economy pages.

English | [繁體中文](README.zh-TW.md)

## Live Demo

[https://quackowob.github.io/poe-market-watch-tw/](https://quackowob.github.io/poe-market-watch-tw/)

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

## Features

- Dashboard for Strongbox-related drops and high-value items.
- Dedicated market pages for Scarabs, Delirium Orbs, Beasts, Divination Cards, Currency, and Fragments.
- Traditional Chinese item names with English names preserved for search.
- Favorites / watchlist support.
- Sortable tables for price, price movement, popularity, and value x popularity.
- Per-category data source labels.
- Stale data warning when market data is older than 2 hours.
- Static GitHub Pages demo with no server runtime.

## Data Sources

Primary source:

- PoEDB TW Economy

Fallback source:

- poe.ninja, used only when PoEDB is unavailable, parsing fails, or a category is missing.

Important notes:

- Taiwan Realm prices can differ significantly from Global Realm prices.
- Prices are references only and are not guaranteed trade prices.
- Popularity is market activity data or an estimate. It is not official transaction volume.
- Categories using fallback data are marked clearly in the UI.

## Quick Start

Local development only requires Docker / Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

Open:

```text
http://localhost:3000
```

Stop:

```bash
docker compose down
```

Clear local Docker volumes:

```bash
docker compose down -v
```

## Documentation Links

- [Developer Guide](docs/developer-guide.md)
- [Deployment Guide](docs/deployment.md)
- [Architecture Notes](docs/architecture.md)
- [Release Checklist](docs/release-checklist.md)
- [Public Release Notes](docs/public-release-github-pages-notes.md)
- [繁體中文 README](README.zh-TW.md)

## Roadmap

- Price alerts
- Discord notifications
- Historical price charts
- Stash scanning
- Private local POESESSID integration
- External storage for long-term history

## License

Project code is licensed under the MIT License. See [LICENSE](LICENSE).

POE Market Watch is not an official Grinding Gear Games tool and is not affiliated with Grinding Gear Games.

Path of Exile, GGG, PoEDB, poe.ninja, and related names, icons, and data belong to their respective owners.
