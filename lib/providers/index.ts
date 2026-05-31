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

function mixedSource(): MarketDataSource {
  return {
    provider: "PoEDB 台服經濟 + poe.ninja",
    realm: "Mixed",
    label: "PoEDB 台服經濟（部分分類使用 poe.ninja 備援）",
    isFallback: true
  };
}

async function loadProvider(provider: MarketDataProvider, isFallback: boolean): Promise<MarketBundle> {
  const items = await provider.fetchAll();
  return {
    items,
    lastUpdated: new Date().toISOString(),
    source: sourceFor(provider, isFallback)
  };
}

export async function fetchMarketDataWithProviders(): Promise<MarketBundle> {
  const items: MarketItem[] = [];
  const fallbackCategories: MarketCategory[] = [];
  const warnings: string[] = [];

  await Promise.all(
    marketCategories.map(async (category) => {
      try {
        const primaryItems = await primaryProvider.fetchCategory(category);
        if (primaryItems.length > 0) {
          items.push(...primaryItems);
          return;
        }
        warnings.push(`PoEDB 台服經濟的 ${category} 分類目前沒有可用資料。`);
      } catch (error) {
        warnings.push(
          `PoEDB 台服經濟的 ${category} 分類讀取失敗：${error instanceof Error ? error.message : "未知錯誤"}。`
        );
      }

      const fallbackItems = await fallbackProvider.fetchCategory(category);
      items.push(...fallbackItems);
      fallbackCategories.push(category);
    })
  );

  if (items.length === 0) {
    return {
      ...(await loadProvider(fallbackProvider, true)),
      warnings: [
        ...warnings,
        "目前使用 poe.ninja 國際服備援資料，價格可能與台服市場有明顯差異。"
      ]
    };
  }

  if (fallbackCategories.length === 0) {
    return {
      items,
      lastUpdated: new Date().toISOString(),
      source: sourceFor(primaryProvider, false)
    };
  }

  const allFallback = fallbackCategories.length === marketCategories.length;

  return {
    items,
    lastUpdated: new Date().toISOString(),
    source: allFallback ? sourceFor(fallbackProvider, true) : mixedSource(),
    warnings: [
      ...warnings,
      allFallback
        ? "目前使用 poe.ninja 國際服備援資料，價格可能與台服市場有明顯差異。"
        : `以下分類使用 poe.ninja 國際服備援資料：${fallbackCategories.join(", ")}。同一分類不混用不同市場資料。`
    ]
  };
}

export { PoedbTwProvider, PoeNinjaProvider };
export type { MarketDataProvider };
