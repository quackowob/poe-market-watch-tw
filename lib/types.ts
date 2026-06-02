export type MarketCategory =
  | "Currency"
  | "Fragment"
  | "Scarab"
  | "Beast"
  | "DeliriumOrb"
  | "Omen"
  | "DivinationCard";

export type MarketItem = {
  id: string;
  name: string;
  zhName?: string;
  displayName: string;
  category: MarketCategory;
  chaosValue: number;
  divineValue?: number;
  change24h?: number;
  change7d?: number;
  volume?: number;
  listingCount?: number;
  icon?: string;
  detailsId?: string;
  confidence?: "high" | "low";
  tags?: string[];
};

export type SortKey = "price" | "change" | "heat" | "valueHeat";

export type DataRealm = "TW" | "Global" | "Mixed";

export type MarketDataSource = {
  provider: string;
  realm: DataRealm;
  label: string;
  isFallback: boolean;
};

export type CategorySourceMap = Partial<Record<MarketCategory, MarketDataSource>>;

export type MarketBundle = {
  items: MarketItem[];
  lastUpdated: string;
  source: MarketDataSource;
  categorySources?: CategorySourceMap;
  warnings?: string[];
};

export type MarketDataMeta = {
  updatedAt: string;
  source: MarketDataSource;
  categorySources?: CategorySourceMap;
  stale: boolean;
  errorMessage?: string;
  itemCount?: number;
};
