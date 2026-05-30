# POE Market Watch

Path of Exile 1 3.28 Mirage（遠古蜃景）市場監控 Dashboard。專案採 Docker-first 開發流程，本機只需要 Docker / Docker Compose，不需要安裝 Node.js、npm 或 pnpm，也不會把 `node_modules` 寫入本機專案資料夾。

## 功能

- Dashboard: 今日熱門甲蟲、我的最愛、譫妄玉市場、高價野獸、高價命運卡、保險箱掉落監控
- Pages: Scarabs、Delirium Orbs、Beasts、Divination Cards、Fragments & Currency
- poe.ninja API integration with in-memory TTL cache
- 繁體中文 i18n map 架構
- 搜尋支援中文與英文名稱
- 所有 volume / count / listingCount 都顯示為「熱度」或「估算熱度」，不宣稱為官方成交量

## 檔案結構

```text
poe-market-watch/
  app/
    beasts/page.tsx
    delirium-orbs/page.tsx
    divination-cards/page.tsx
    fragments-currency/page.tsx
    scarabs/page.tsx
    error.tsx
    globals.css
    layout.tsx
    loading.tsx
    page.tsx
  components/
    HeatHint.tsx
    MarketTable.tsx
    StatCard.tsx
  config/
    beast-notes.json
    favorites.json
    i18n/category-name-map.json
    i18n/item-name-map.json
  lib/
    cache.ts
    config.ts
    format.ts
    i18n.ts
    normalize.ts
    poeNinja.ts
    ranking.ts
    types.ts
  scripts/
    build-i18n-map.ts
  .dockerignore
  .env.example
  Dockerfile
  docker-compose.yml
  docker-compose.prod.yml
  next.config.ts
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.json
```

## .env.example

```env
LEAGUE=Mirage
LEAGUE_ZH=遠古蜃景
MIN_VALUE_CHAOS=10
REFRESH_INTERVAL_MINUTES=30
ENABLE_I18N=true
```

## 安裝步驟

```bash
cp .env.example .env
```

Docker 會在容器內安裝依賴。開發環境的 `node_modules` 使用 Docker volume 掛在 `/app/node_modules`，不會落在本機專案資料夾。

## 開發啟動

```bash
docker compose up --build
```

開啟 http://localhost:3000

## 正式啟動

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

開啟 http://localhost:3000

## 停止服務

```bash
docker compose down
docker compose -f docker-compose.prod.yml down
```

## 清除環境

```bash
docker compose down -v
```

## 開發注意事項

- 本專案採 Docker-first，本機不需要 Node.js、npm 或 pnpm。
- `node_modules` 必須留在 Docker volume，不要寫入本機專案資料夾。
- 每次修改後使用 `git status --short` 檢查工作區，完成一組可驗證修改後建立 commit。
- 不要提交 `.env`、`.next`、`node_modules` 或臨時工具檔。

## 後續 TODO

- 擴充 item-name-map.json，補齊更多 PoEDB / 流亡編年史繁中物品名
- 加入價格歷史圖表與本地歷史快照
- 加入錯誤重試與 poe.ninja API 健康狀態提示
- 增加測試，特別是 normalize 與 ranking 規則
- 加入 Vercel 部署設定與環境變數文件

## 未來擴充建議

- Discord 通知
- 價格警報
- 倉庫掃描
- POESESSID 整合
- 自動查價
- 歷史價格圖表
