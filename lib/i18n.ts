import categoryNameMap from "@/config/i18n/category-name-map.json";
import itemNameMap from "@/config/i18n/item-name-map.json";
import { isI18nEnabled } from "./config";
import type { MarketCategory } from "./types";

const itemMap = itemNameMap as Record<string, string>;
const categoryMap = categoryNameMap as Record<MarketCategory, string>;

export function getZhItemName(name: string) {
  if (!isI18nEnabled()) return undefined;
  return itemMap[name];
}

export function getCategoryName(category: MarketCategory) {
  return categoryMap[category] || category;
}

export function getDisplayName(name: string) {
  return getZhItemName(name) || name;
}
