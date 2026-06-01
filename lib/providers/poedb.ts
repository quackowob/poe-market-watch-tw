import { getRefreshIntervalMinutes, marketCategories } from "../config";
import { normalizePoedbRow } from "../normalize";
import { getPoedbDivineChaosValue, parsePoedbEconomy, parsePoedbEconomyRows } from "../parsers/poedbParser";
import type { MarketCategory } from "../types";
import { getCrawlerUserAgent } from "../userAgent";
import type { MarketDataProvider } from "./provider";

const poedbBaseUrl = "https://poedb.tw/tw";
const requestTimeoutMs = 10000;
const maxAttempts = 3;

const categoryUrls: Record<MarketCategory, string> = {
  Currency: `${poedbBaseUrl}/Economy`,
  Fragment: `${poedbBaseUrl}/Economy`,
  Scarab: `${poedbBaseUrl}/Economy_Scarabs`,
  Beast: `${poedbBaseUrl}/Economy`,
  DeliriumOrb: `${poedbBaseUrl}/Economy_Delirium`,
  Omen: `${poedbBaseUrl}/Economy_Omens`,
  DivinationCard: `${poedbBaseUrl}/Economy_Divination_Cards`
};

const categorySpecificPages = new Set<MarketCategory>(["Scarab", "DeliriumOrb", "Omen", "DivinationCard"]);

async function fetchHtml(url: string) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const response = await fetch(url, {
        next: { revalidate: getRefreshIntervalMinutes() * 60 },
        signal: controller.signal,
        headers: {
          "user-agent": getCrawlerUserAgent(),
          accept: "text/html,application/xhtml+xml"
        }
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        throw new Error(`PoEDB request failed: ${response.status} ${response.statusText}`);
      }

      return response.text();
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`PoEDB request failed: ${url}`);
}

export class PoedbTwProvider implements MarketDataProvider {
  name = "PoEDB 台服經濟";
  realm = "TW" as const;

  async fetchCategory(category: MarketCategory) {
    const html = await fetchHtml(categoryUrls[category]);
    const divineChaosValue =
      categorySpecificPages.has(category) ? getPoedbDivineChaosValue(await fetchHtml(categoryUrls.Currency)) : undefined;
    const rows = categorySpecificPages.has(category)
      ? parsePoedbEconomyRows(html, { divineChaosValue })
      : parsePoedbEconomy(html, category, { divineChaosValue });
    return rows.map((row) => normalizePoedbRow(row, category));
  }

  async fetchAll() {
    const htmlByUrl = new Map<string, string>();
    const loadHtml = async (url: string) => {
      let html = htmlByUrl.get(url);
      if (!html) {
        html = await fetchHtml(url);
        htmlByUrl.set(url, html);
      }
      return html;
    };

    const economyHtml = await loadHtml(categoryUrls.Currency);
    const divineChaosValue = getPoedbDivineChaosValue(economyHtml);

    const items = await Promise.all(
      marketCategories.map(async (category) => {
        const url = categoryUrls[category];
        const html = await loadHtml(url);

        const rows = categorySpecificPages.has(category)
          ? parsePoedbEconomyRows(html, { divineChaosValue })
          : parsePoedbEconomy(html, category, { divineChaosValue });
        return rows.map((row) => normalizePoedbRow(row, category));
      })
    );

    return items.flat();
  }
}
