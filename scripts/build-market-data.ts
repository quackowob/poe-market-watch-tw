import fs from "node:fs/promises";
import path from "node:path";
import { fetchMarketDataWithProviders } from "../lib/providers";
import type { MarketDataMeta, MarketDataSource, MarketItem } from "../lib/types";

const dataDir = path.join(process.cwd(), "public", "data");
const marketDataPath = path.join(dataDir, "market.json");
const marketMetaPath = path.join(dataDir, "meta.json");

async function readJson<T>(filePath: string): Promise<T | undefined> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch {
    return undefined;
  }
}

async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sourceLabel(source: MarketDataSource) {
  if (source.realm === "TW") return "PoEDB 台服經濟";
  if (source.realm === "Global") return "poe.ninja（國際服備援）";
  return "PoEDB 台服經濟（部分分類使用 poe.ninja 備援）";
}

async function keepPreviousData(error: unknown) {
  const previousItems = await readJson<MarketItem[]>(marketDataPath);
  const previousMeta = await readJson<MarketDataMeta>(marketMetaPath);
  const message = error instanceof Error ? error.message : String(error);

  if (!previousItems?.length || !previousMeta) {
    throw new Error(`Market data build failed and no previous data exists: ${message}`);
  }

  await writeJson(marketMetaPath, {
    ...previousMeta,
    stale: true,
    errorMessage: `PoEDB 資料更新失敗，保留上一份成功資料：${message}`,
    itemCount: previousItems.length
  } satisfies MarketDataMeta);

  console.warn(`Market data build failed. Kept previous market.json. ${message}`);
}

async function main() {
  try {
    const bundle = await fetchMarketDataWithProviders();
    const source = {
      ...bundle.source,
      label: sourceLabel(bundle.source)
    };
    const updatedAt = new Date().toISOString();

    await writeJson(marketDataPath, bundle.items);
    await writeJson(marketMetaPath, {
      updatedAt,
      source,
      stale: false,
      itemCount: bundle.items.length
    } satisfies MarketDataMeta);

    console.log(`Wrote ${bundle.items.length} market items to ${marketDataPath}`);
    console.log(`Wrote metadata to ${marketMetaPath}`);
  } catch (error) {
    await keepPreviousData(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
