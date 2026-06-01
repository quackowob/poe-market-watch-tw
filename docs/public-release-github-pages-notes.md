# Public Release / GitHub Pages Notes

This document records requirements for a future public GitHub release and possible GitHub Pages deployment.

## Privacy And Security

- Never commit `.env`.
- Never commit `POESESSID`.
- Never commit personal accounts, cookies, tokens, or API keys.
- `.gitignore` must include:
  - `.env`
  - `.env.local`
  - `*.log`
  - `node_modules`
  - `.next`
  - `dist`
- The README must warn users not to put `POESESSID` in a public repository.

## Data Source Disclosure

The README and website footer must state:

- This tool is not an official GGG tool.
- This tool is not affiliated with Grinding Gear Games.
- Market data source is PoEDB TW Economy.
- Fallback data may come from poe.ninja.
- Prices are reference values only and are not guaranteed trade prices.

## PoEDB Usage Etiquette

- Do not make large direct PoEDB requests from the user's browser.
- The GitHub Pages version should fetch market data during the build step.
- Build output should write data to `public/data/market.json`.
- The frontend should only read this project's own static JSON.
- Default update frequency must not be lower than 30 minutes.
- Crawlers must include:
  - Error handling
  - Timeout
  - Retry backoff
- User-Agent must clearly identify the project name and GitHub repository URL.

## GitHub Pages Constraints

- Avoid committing large historical JSON datasets.
- Do not use GitHub Pages as a high-frequency API server.
- `public/data` should only keep:
  - Latest `market.json`
  - Latest `meta.json`
- If historical prices are needed later, use an external database or GitHub Releases instead of accumulating unlimited data in the repository.

## License

- Add a `LICENSE` file.
- Recommended license: MIT License.
- README must explain:
  - Project code is licensed under MIT.
  - PoE, PoEDB, poe.ninja, GGG names, icons, and data rights belong to their respective rights holders.
  - If PoEDB wiki content is quoted or reused, follow PoEDB's content license terms.

## Public README Requirements

The public README must include:

- Project purpose
- Screenshot section placeholder
- Data sources
- Unofficial disclaimer
- Docker local startup
- GitHub Pages deployment instructions
- How to update market data
- Known limitations
- Roadmap

## Robots / No-Index

If the project is initially just a personal portfolio/demo, add `public/robots.txt`:

```txt
User-agent: *
Disallow:
```

If the site should not be indexed later, change it to:

```txt
User-agent: *
Disallow: /
```

## Error Handling And Fallback

- If PoEDB fetch fails, the build must not generate a blank website.
- Keep the previous successful `market.json`.
- UI must show a stale-data warning when using old data.
- `meta.json` must include:
  - `updatedAt`
  - `source`
  - `stale`
  - `errorMessage`

