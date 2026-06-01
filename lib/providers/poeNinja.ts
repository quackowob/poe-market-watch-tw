import {
  currencyOverviewCategories,
  getLeague,
  getRefreshIntervalMinutes,
  itemOverviewCategories
} from "../config";
import { normalizeAll, normalizeCurrencyLine, normalizeItemLine } from "../normalize";
import type { MarketCategory } from "../types";
import { getCrawlerUserAgent } from "../userAgent";
import type { MarketDataProvider } from "./provider";

const exchangeBaseUrl = "https://poe.ninja/poe1/api/economy/exchange/current/overview";
const stashItemBaseUrl = "https://poe.ninja/poe1/api/economy/stash/current/item/overview";
const requestTimeoutMs = 8000;
const maxAttempts = 3;

type Overview = {
  lines: unknown[];
  items?: unknown[];
};

async function fetchJson<T>(url: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const response = await fetch(url, {
        next: { revalidate: getRefreshIntervalMinutes() * 60 },
        signal: controller.signal,
        headers: {
          "user-agent": getCrawlerUserAgent()
        }
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        throw new Error(`poe.ninja request failed: ${response.status} ${response.statusText}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`poe.ninja request failed: ${url}`);
}

function buildUrl(category: MarketCategory) {
  const league = encodeURIComponent(getLeague());
  const type = encodeURIComponent(category);
  const baseUrl = category === "Beast" ? stashItemBaseUrl : exchangeBaseUrl;
  return `${baseUrl}?league=${league}&type=${type}`;
}

export async function fetchCurrencyOverview(category: Extract<MarketCategory, "Currency" | "Fragment">) {
  return fetchJson<Overview>(buildUrl(category));
}

export async function fetchItemOverview(category: Exclude<MarketCategory, "Currency" | "Fragment">) {
  return fetchJson<Overview>(buildUrl(category));
}

export class PoeNinjaProvider implements MarketDataProvider {
  name = "poe.ninja";
  realm = "Global" as const;

  async fetchCategory(category: MarketCategory) {
    const overview =
      category === "Currency" || category === "Fragment"
        ? await fetchCurrencyOverview(category)
        : await fetchItemOverview(category);

    if (category === "Currency" || category === "Fragment") {
      return overview.lines.map((line) => normalizeCurrencyLine(line as never, category));
    }

    return overview.lines.map((line) => normalizeItemLine(line as never, category));
  }

  async fetchAll() {
    const requestedCategories = [...currencyOverviewCategories, ...itemOverviewCategories];
    const entries = await Promise.all(
      requestedCategories.map(async (category) => [category, await fetchJson<Overview>(buildUrl(category))] as const)
    );

    return normalizeAll(Object.fromEntries(entries));
  }
}
