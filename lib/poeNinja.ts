import { cached } from "./cache";
import { getLeague, getRefreshIntervalMinutes } from "./config";
import { fetchMarketDataWithProviders } from "./providers";
import { fetchCurrencyOverview, fetchItemOverview } from "./providers/poeNinja";
import type { MarketBundle } from "./types";

export { fetchCurrencyOverview, fetchItemOverview };

export async function fetchAllMarketData(): Promise<MarketBundle> {
  const ttlMs = getRefreshIntervalMinutes() * 60 * 1000;
  return cached(`market:providers:v2:${getLeague()}`, ttlMs, fetchMarketDataWithProviders);
}
