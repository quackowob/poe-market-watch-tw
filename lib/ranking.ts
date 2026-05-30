import favorites from "@/config/favorites.json";
import { getMinValueChaos } from "./config";
import type { MarketCategory, MarketItem, SortKey } from "./types";

const strongboxCategories: MarketCategory[] = [
  "Scarab",
  "Currency",
  "Fragment",
  "DeliriumOrb",
  "Omen",
  "DivinationCard"
];

function heat(item: MarketItem) {
  return item.volume ?? item.listingCount ?? 0;
}

function change(item: MarketItem) {
  return item.change24h ?? item.change7d ?? 0;
}

export function getHeat(item: MarketItem) {
  return heat(item);
}

export function sortMarketItems(items: MarketItem[], sortKey: SortKey) {
  return [...items].sort((a, b) => {
    if (sortKey === "price") return b.chaosValue - a.chaosValue;
    if (sortKey === "change") return change(b) - change(a);
    if (sortKey === "valueHeat") return b.chaosValue * heat(b) - a.chaosValue * heat(a);
    return heat(b) - heat(a);
  });
}

export function getTopVolume(items: MarketItem[], category?: MarketCategory, limit = 10) {
  const scoped = category ? items.filter((item) => item.category === category) : items;
  return sortMarketItems(scoped, "heat").slice(0, limit);
}

export function getTopGainers(items: MarketItem[], limit = 10) {
  return [...items].filter((item) => change(item) > 0).sort((a, b) => change(b) - change(a)).slice(0, limit);
}

export function getTopLosers(items: MarketItem[], limit = 10) {
  return [...items].filter((item) => change(item) < 0).sort((a, b) => change(a) - change(b)).slice(0, limit);
}

export function getHighValue(items: MarketItem[], category?: MarketCategory, limit?: number) {
  const min = getMinValueChaos();
  const result = sortMarketItems(
    items.filter((item) => (!category || item.category === category) && item.chaosValue >= min),
    "price"
  );
  return typeof limit === "number" ? result.slice(0, limit) : result;
}

export function getStrongboxDrops(items: MarketItem[], sortKey: SortKey = "valueHeat", limit?: number) {
  const min = getMinValueChaos();
  const scoped = items.filter((item) => strongboxCategories.includes(item.category) && item.chaosValue >= min);
  const sorted = sortMarketItems(tagStrongboxItems(scoped), sortKey);
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export function getFavoriteItems(items: MarketItem[]) {
  const favoriteNames = new Set(favorites as string[]);
  return items.filter((item) => favoriteNames.has(item.name));
}

export function tagStrongboxItems(items: MarketItem[]) {
  const heats = [...items].map(heat).sort((a, b) => b - a);
  const topHeatThreshold = heats[Math.max(0, Math.floor(heats.length * 0.2) - 1)] ?? Number.POSITIVE_INFINITY;

  return items.map((item) => {
    const tags = new Set(item.tags || []);
    if (item.chaosValue >= 100) tags.add("高價");
    if (change(item) >= 20) tags.add("暴漲");
    if (heat(item) >= topHeatThreshold && heat(item) > 0) tags.add("熱門");
    return { ...item, tags: [...tags] };
  });
}
