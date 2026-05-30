# 開發注意事項

## Docker-first

- 本機只需要 Docker / Docker Compose。
- 不要求本機安裝 Node.js、npm 或 pnpm。
- 不把 `node_modules` 寫進本機專案資料夾；開發環境使用 Docker volume。

## 版本管理

- 專案已初始化 Git。
- 每次修改後先檢查 `git status --short`。
- 提交前確認沒有誤加 `.env`、`node_modules`、`.next` 或暫存工具檔。
- 完成可驗證的修改後建立語意清楚的 commit。
- 不覆蓋或回復使用者未要求回復的變更。
