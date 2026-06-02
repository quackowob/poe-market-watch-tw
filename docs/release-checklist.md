# Release Checklist

## Before First Public Release

- [ ] README complete
- [ ] LICENSE exists
- [ ] `.gitignore` correct
- [ ] `.dockerignore` correct
- [ ] No `.env`
- [ ] No `POESESSID`
- [ ] No cookie
- [ ] No token
- [ ] No API key
- [ ] No local absolute path
- [ ] GitHub Pages build succeeds

## Before Each Release

- [ ] `npm run build:market-data` succeeds
- [ ] `npm run build` succeeds
- [ ] `npm run build:pages` succeeds

## RC1 Verification Commands

Run through Docker:

```bash
docker compose up -d --build
docker compose exec web npm run build:market-data
docker compose exec web npm run build
docker compose exec web npm run build:pages
```

Expected outputs:

- `public/data/market.json`
- `public/data/meta.json`
- `out/`
