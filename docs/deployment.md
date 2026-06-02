# Deployment

## Docker Development

Requirements:

- Docker
- Docker Compose

Start local development:

```bash
docker compose up --build
```

The development container:

1. Installs dependencies inside Docker.
2. Attempts to generate `public/data/market.json` and `public/data/meta.json`.
3. Starts `next dev` on port `3000`.

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

## Local Static Production Preview

Build and run the static export:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Open:

```text
http://localhost:3000
```

This serves the generated `out/` directory through `scripts/serve-static.mjs`. It does not run a Next.js server runtime.

Stop:

```bash
docker compose -f docker-compose.prod.yml down
```

## GitHub Pages Deployment

Workflow:

```text
.github/workflows/deploy-pages.yml
```

Triggers:

- Push to `main`
- Push to `master`
- Manual `workflow_dispatch`
- Scheduled run every 30 minutes

Required GitHub settings:

1. Enable GitHub Pages.
2. Set Pages source to GitHub Actions.
3. Ensure Actions permissions allow Pages deployment.

Build process:

1. Install dependencies with `npm ci` from `package-lock.json`.
2. Run `npm run build:market-data`.
3. Configure `NEXT_PUBLIC_BASE_PATH`.
4. Run `npm run build`.
5. Upload `out/` to GitHub Pages.

## Base Path Rules

For a user or organization site:

```text
username.github.io
```

`NEXT_PUBLIC_BASE_PATH` must be empty.

For a project site:

```text
username.github.io/repository
```

`NEXT_PUBLIC_BASE_PATH` must be:

```text
/repository
```

The workflow derives this from `github.event.repository.name`.

## Manual Data Update

When the dev container is running:

```bash
docker compose exec web npm run build:market-data
```

Expected files:

```text
public/data/market.json
public/data/meta.json
```

## Troubleshooting

### Docker Desktop is not running

Symptom:

```text
failed to connect to the docker API
```

Fix:

Start Docker Desktop and rerun the command.

### Stale or incompatible Docker dependency volume

Symptom:

```text
npm warn ERESOLVE overriding peer dependency
```

Fix:

```bash
docker compose down -v
docker compose up --build
```

### GitHub Pages shows broken asset paths

Likely cause:

- Incorrect `NEXT_PUBLIC_BASE_PATH`

Fix:

- For `username.github.io`, use an empty base path.
- For `username.github.io/repository`, use `/repository`.

### Market data is stale

Likely causes:

- PoEDB request failed.
- Workflow schedule has not run yet.
- Previous successful data was retained after a failed update.

Check:

```text
public/data/meta.json
```

Fields to inspect:

- `updatedAt`
- `stale`
- `errorMessage`

### PoEDB parser fails after site changes

Likely cause:

- PoEDB changed HTML structure.

Fix:

- Update `lib/parsers/poedbParser.ts`.
- Re-run `npm run build:market-data`.
