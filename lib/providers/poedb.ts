import { getRefreshIntervalMinutes, marketCategories } from "../config";
import { normalizePoedbRow } from "../normalize";
import { parsePoedbEconomy, parsePoedbEconomyRows } from "../parsers/poedbParser";
import type { MarketCategory } from "../types";
import type { MarketDataProvider } from "./provider";

const poedbBaseUrl = "https://poedb.tw/tw";
const requestTimeoutMs = 10000;

const categoryUrls: Record<MarketCategory, string> = {
  Currency: `${poedbBaseUrl}/Economy`,
  Fragment: `${poedbBaseUrl}/Economy`,
  Scarab: `${poedbBaseUrl}/Economy`,
  Beast: `${poedbBaseUrl}/Economy`,
  DeliriumOrb: `${poedbBaseUrl}/Economy_Delirium`,
  Omen: `${poedbBaseUrl}/Economy_Omens`,
  DivinationCard: `${poedbBaseUrl}/Economy_Divination_Cards`
};

const categorySpecificPages = new Set<MarketCategory>(["DeliriumOrb", "Omen", "DivinationCard"]);

async function fetchHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  const response = await fetch(url, {
    next: { revalidate: getRefreshIntervalMinutes() * 60 },
    signal: controller.signal,
    headers: {
      "user-agent": "POE Market Watch",
      accept: "text/html,application/xhtml+xml"
    }
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`PoEDB request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export class PoedbTwProvider implements MarketDataProvider {
  name = "PoEDB 台服經濟";
  realm = "TW" as const;

  async fetchCategory(category: MarketCategory) {
    const html = await fetchHtml(categoryUrls[category]);
    const rows = categorySpecificPages.has(category)
      ? parsePoedbEconomyRows(html)
      : parsePoedbEconomy(html, category);
    return rows.map((row) => normalizePoedbRow(row, category));
  }

  async fetchAll() {
    const htmlByUrl = new Map<string, string>();
    const items = await Promise.all(
      marketCategories.map(async (category) => {
        const url = categoryUrls[category];
        let html = htmlByUrl.get(url);
        if (!html) {
          html = await fetchHtml(url);
          htmlByUrl.set(url, html);
        }

        const rows = categorySpecificPages.has(category)
          ? parsePoedbEconomyRows(html)
          : parsePoedbEconomy(html, category);
        return rows.map((row) => normalizePoedbRow(row, category));
      })
    );

    return items.flat();
  }
}
