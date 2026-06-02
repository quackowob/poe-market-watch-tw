# POE Market Watch

POE Market Watch 是給 **Path of Exile 1 台服** `Mirage` 聯盟（`遠古蜃景`）玩家使用的市場監控 Dashboard。

它可以幫助玩家快速查看高價掉落、熱門分類、價格變化，以及保險箱相關掉落，不需要在多個經濟頁面之間來回查詢。

繁體中文 | [English](README.md)

## Live Demo

[https://quackowob.github.io/poe-market-watch-tw/](https://quackowob.github.io/poe-market-watch-tw/)

## 截圖

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### 聖甲蟲

![聖甲蟲](docs/screenshots/scarabs.png)

### 譫妄玉

![譫妄玉](docs/screenshots/delirium-orbs.png)

### 野獸

![野獸](docs/screenshots/beasts.png)

### 命運卡

![命運卡](docs/screenshots/divination-cards.png)

## 功能

- 保險箱相關掉落與高價物品 Dashboard。
- 聖甲蟲、譫妄玉、野獸、命運卡、通貨、碎片市場分頁。
- 優先顯示繁體中文物品名稱，同時保留英文名稱供搜尋。
- 我的最愛 / 觀察清單。
- 表格可依價格、漲跌、熱度、價格 x 熱度排序。
- 顯示每個分類的資料來源。
- 資料超過 2 小時會顯示過期提醒。
- GitHub Pages 靜態展示版，不需要 server runtime。

## 資料來源

主要資料來源：

- PoEDB TW Economy

備援資料來源：

- poe.ninja，僅在 PoEDB 無法連線、解析失敗或缺少分類時使用。

注意事項：

- 台服市場與國際服市場價格可能明顯不同。
- 價格僅供參考，不保證可用該價格成交。
- 熱度是市場活動資料或估算值，不代表官方實際成交量。
- 若分類使用備援資料，UI 會明確標示。

## 快速開始

本機開發只需要 Docker / Docker Compose。

```bash
cp .env.example .env
docker compose up --build
```

開啟：

```text
http://localhost:3000
```

停止：

```bash
docker compose down
```

清除本機 Docker volumes：

```bash
docker compose down -v
```

## 文件連結

- [Developer Guide](docs/developer-guide.md)
- [Deployment Guide](docs/deployment.md)
- [Architecture Notes](docs/architecture.md)
- [Release Checklist](docs/release-checklist.md)
- [Public Release Notes](docs/public-release-github-pages-notes.md)
- [English README](README.md)

## Roadmap

- 價格警報
- Discord 通知
- 歷史價格圖表
- 倉庫掃描
- 私有本機 POESESSID 整合
- 使用外部儲存保存長期歷史資料

## License

程式碼採 MIT License。請見 [LICENSE](LICENSE)。

POE Market Watch 不是 Grinding Gear Games 官方工具，與 Grinding Gear Games 無關。

Path of Exile、GGG、PoEDB、poe.ninja，以及相關名稱、圖示與資料權利歸原權利人所有。
