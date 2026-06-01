# POE Market Watch

Static market dashboard for Path of Exile 1, focused on the Taiwan server Mirage league.

- League: `Mirage`
- Traditional Chinese league name: `遠古蜃景`
- Main workflows: Strongbox, Bestiary, Delirium Orb, Scarab, Currency, Fragment, Omen, Divination Card monitoring

## Status

The app supports two modes:

- Local Docker development with hot reload.
- Static GitHub Pages deployment with market data generated at build time.

No local Node.js, npm, or pnpm installation is required for Docker development.

## Screenshots

Placeholder for public release screenshots:

- Dashboard
- Scarabs
- Delirium Orbs
- Beasts
- Divination Cards

## Data Sources

- Primary source: PoEDB TW Economy
- Fallback source: poe.ninja, when a category is unavailable or parsing fails

Prices are references only and are not guaranteed trade prices. Heat values are market activity estimates and must not be treated as official transaction volume.

## Unofficial Disclaimer

POE Market Watch is not an official Grinding Gear Games tool and is not affiliated with Grinding Gear Games.

Path of Exile, GGG, PoEDB, poe.ninja, related names, icons, and data belong to their respective rights holders.

Do not put `POESESSID`, account cookies, tokens, or API keys in a public repository.

## Docker Local Development

Create `.env` from the example:

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

Stop:

```bash
docker compose down
```

Clear Docker volumes:

```bash
docker compose down -v
```

Dependencies are installed inside Docker volumes. `node_modules` is not required on the host project folder.

## Static Production Preview

Build and serve the static export through Docker:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Open:

```text
http://localhost:3000
```

Stop:

```bash
docker compose -f docker-compose.prod.yml down
```

## Market Data Build

Generate static market data:

```bash
docker compose exec web npm run build:market-data
```

Output files:

```text
public/data/market.json
public/data/meta.json
```

`meta.json` includes:

- `updatedAt`
- `source`
- `stale`
- `errorMessage`
- `itemCount`

If data fetching fails and a previous successful `market.json` exists, the previous data is kept and `meta.json` is marked stale.

Build the full static export:

```bash
docker compose exec web npm run build:pages
```

## GitHub Pages Deployment

GitHub Actions workflow:

```text
.github/workflows/deploy-pages.yml
```

The workflow:

1. Installs dependencies with `npm ci`.
2. Runs `npm run build:market-data`.
3. Runs `npm run build`.
4. Uploads `out/` to GitHub Pages.

Repository settings required:

1. Enable GitHub Pages.
2. Set source to GitHub Actions.
3. Ensure Actions permissions allow Pages deployment.

Scheduled updates run every 30 minutes.

## Static Export Notes

GitHub Pages does not provide a server runtime. The frontend reads static data generated during build:

```text
/data/market.json
/data/meta.json
```

Do not make high-volume direct PoEDB requests from the browser. Do not use GitHub Pages as a high-frequency API server.

## Known Limitations

- PoEDB has no stable public API for every category, so some data is parsed from HTML.
- Some categories may use poe.ninja fallback data.
- Taiwan server prices and global server fallback prices can differ significantly.
- Static data may be stale between scheduled builds.
- Historical price storage is not implemented.

## Roadmap

- Public release screenshots
- GitHub Pages static data caching polish
- Discord notifications
- Price alerts
- Stash scanning
- POESESSID-supported private local integrations
- Historical price charts through an external database or GitHub Releases

## License

Project code is licensed under MIT. See `LICENSE`.

PoE, PoEDB, poe.ninja, GGG names, icons, and data rights belong to their respective rights holders. If PoEDB wiki content is quoted or reused, follow PoEDB's content license terms.
