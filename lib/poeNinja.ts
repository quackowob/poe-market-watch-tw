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

type Overview = {
  lines: unknown[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: getRefreshIntervalMinutes() * 60 },
    headers: {
      "user-agent": "POE Market Watch"
    }
  });

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
    const currencyEntries = await Promise.all(
      currencyOverviewCategories.map(async (category) => [category, await fetchCurrencyOverview(category)] as const)
    );
    const itemEntries = await Promise.all(
      itemOverviewCategories.map(async (category) => [category, await fetchItemOverview(category)] as const)
    );

    return {
      items: normalizeAll(Object.fromEntries([...currencyEntries, ...itemEntries])),
      lastUpdated: new Date().toISOString()
    };
  });
}
