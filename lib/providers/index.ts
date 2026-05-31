import { marketCategories } from "../config";
import type { MarketBundle, MarketCategory, MarketDataSource, MarketItem } from "../types";
import { PoedbTwProvider } from "./poedb";
import { PoeNinjaProvider } from "./poeNinja";
import type { MarketDataProvider } from "./provider";

const primaryProvider = new PoedbTwProvider();
const fallbackProvider = new PoeNinjaProvider();

function sourceFor(provider: MarketDataProvider, isFallback: boolean): MarketDataSource {
  return {
    provider: provider.name,
    realm: provider.realm,
    label: provider.realm === "TW" ? "PoEDB 台服經濟" : "poe.ninja（國際服備援）",
    isFallback
  };
}

function getMissingCategories(items: MarketItem[]) {
  const found = new Set(items.map((item) => item.category));
  return marketCategories.filter((category) => !found.has(category));
}

async function loadProvider(provider: MarketDataProvider, isFallback: boolean): Promise<MarketBundle> {
  const items = await provider.fetchAll();
  return {
    items,
    lastUpdated: new Date().toISOString(),
    source: sourceFor(provider, isFallback)
  };
}

function formatMissing(missing: MarketCategory[]) {
  return missing.join(", ");
}

export async function fetchMarketDataWithProviders(): Promise<MarketBundle> {
  const warnings: string[] = [];

  try {
    const bundle = await loadProvider(primaryProvider, false);
    const missing = getMissingCategories(bundle.items);

    if (bundle.items.length > 0 && missing.length === 0) {
      return bundle;
    }

    warnings.push(
      `PoEDB 台服經濟資料缺少分類：${formatMissing(missing)}。已切換整包資料來源，避免不同市場資料混在同一個排行榜。`
    );
  } catch (error) {
    warnings.push(
      `PoEDB 台服經濟讀取失敗：${error instanceof Error ? error.message : "未知錯誤"}。已切換整包備援資料來源。`
    );
  }

  const fallback = await loadProvider(fallbackProvider, true);
  return {
    ...fallback,
    warnings: [
      ...warnings,
      "目前使用 poe.ninja 國際服備援資料，價格可能與台服市場有明顯差異。"
    ]
  };
}

export { PoedbTwProvider, PoeNinjaProvider };
export type { MarketDataProvider };
