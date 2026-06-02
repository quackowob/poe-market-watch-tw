import fs from "node:fs/promises";
import path from "node:path";
import type { MarketBundle, MarketDataMeta, MarketDataSource, MarketItem } from "./types";

const dataDir = path.join(process.cwd(), "public", "data");
const marketDataPath = path.join(dataDir, "market.json");
const marketMetaPath = path.join(dataDir, "meta.json");

const fallbackSource: MarketDataSource = {
  provider: "static",
  realm: "TW",
  label: "PoEDB 台服經濟",
  isFallback: false
};

export function isMarketDataStale(updatedAt: string, now = new Date()) {
  const updatedAtMs = new Date(updatedAt).getTime();
  if (!Number.isFinite(updatedAtMs)) return true;
  return now.getTime() - updatedAtMs > 2 * 60 * 60 * 1000;
}

async function readJson<T>(filePath: string): Promise<T | undefined> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch {
    return undefined;
  }
}

export async function readStaticMarketData(): Promise<MarketBundle & { meta: MarketDataMeta }> {
  const items = (await readJson<MarketItem[]>(marketDataPath)) || [];
  const meta = await readJson<MarketDataMeta>(marketMetaPath);
  const updatedAt = meta?.updatedAt || new Date(0).toISOString();
  const stale = meta?.stale || isMarketDataStale(updatedAt);

  return {
    items,
    lastUpdated: updatedAt,
    source: meta?.source || fallbackSource,
    warnings: [
      ...(meta?.errorMessage ? [meta.errorMessage] : []),
      ...(stale ? ["資料可能過期"] : [])
    ],
    meta: {
      updatedAt,
      source: meta?.source || fallbackSource,
      categorySources: meta?.categorySources,
      stale,
      errorMessage: meta?.errorMessage,
      itemCount: meta?.itemCount ?? items.length
    }
  };
}
