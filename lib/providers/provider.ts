import type { DataRealm, MarketCategory, MarketItem } from "../types";

export interface MarketDataProvider {
  name: string;
  realm: DataRealm;
  fetchCategory(category: MarketCategory): Promise<MarketItem[]>;
  fetchAll(): Promise<MarketItem[]>;
}
