import { cached } from "./cache";
import {
  currencyOverviewCategories,
  getLeague,
  getRefreshIntervalMinutes,
  itemOverviewCategories
} from "./config";
import { normalizeAll } from "./normalize";
import type { MarketBundle, MarketCategory } from "./types";

const baseUrl = "https://poe.ninja/api/data";
const requestTimeoutMs = 8000;

type Overview = {
  lines: unknown[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  const response = await fetch(url, {
    next: { revalidate: getRefreshIntervalMinutes() * 60 },
    signal: controller.signal,
    headers: {
      "user-agent": "POE Market Watch"
    }
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`poe.ninja request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchCurrencyOverview(category: Extract<MarketCategory, "Currency" | "Fragment">) {
  const league = encodeURIComponent(getLeague());
  const type = encodeURIComponent(category);
  return fetchJson<Overview>(`${baseUrl}/currencyoverview?league=${league}&type=${type}`);
}

export async function fetchItemOverview(
  category: Exclude<MarketCategory, "Currency" | "Fragment">
) {
  const league = encodeURIComponent(getLeague());
  const type = encodeURIComponent(category);
  return fetchJson<Overview>(`${baseUrl}/itemoverview?league=${league}&type=${type}`);
}

export async function fetchAllMarketData(): Promise<MarketBundle> {
  const ttlMs = getRefreshIntervalMinutes() * 60 * 1000;

  return cached(`market:${getLeague()}`, ttlMs, async () => {
    const requestedCategories = [...currencyOverviewCategories, ...itemOverviewCategories];
    const results = await Promise.allSettled(
      requestedCategories.map(async (category) => {
        const overview =
          category === "Currency" || category === "Fragment"
            ? await fetchCurrencyOverview(category)
            : await fetchItemOverview(category);
        return [category, overview] as const;
      })
    );

    const entries: Array<readonly [MarketCategory, Overview]> = [];
    const warnings: string[] = [];

    results.forEach((result, index) => {
      const category = requestedCategories[index];
      if (result.status === "fulfilled") {
        entries.push(result.value);
      } else {
        warnings.push(`${category} 資料暫時無法讀取：${result.reason instanceof Error ? result.reason.message : "未知錯誤"}`);
      }
    });

    return {
      items: normalizeAll(Object.fromEntries(entries)),
      lastUpdated: new Date().toISOString(),
      warnings
    };
  });
}
