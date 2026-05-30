import { getDisplayName, getZhItemName } from "./i18n";
import type { MarketCategory, MarketItem } from "./types";

type PoeNinjaCurrencyLine = {
  currencyTypeName: string;
  chaosEquivalent?: number;
  receive?: { value?: number; count?: number };
  pay?: { value?: number; count?: number };
  detailsId?: string;
  icon?: string;
  lowConfidencePaySparkLine?: { totalChange?: number };
  receiveSparkLine?: { totalChange?: number };
  paySparkLine?: { totalChange?: number };
};

type PoeNinjaItemLine = {
  id?: number;
  name: string;
  chaosValue?: number;
  divineValue?: number;
  exaltedValue?: number;
  count?: number;
  listingCount?: number;
  icon?: string;
  detailsId?: string;
  lowConfidenceSparkLine?: { totalChange?: number };
  sparkline?: { totalChange?: number };
};

function stableId(category: MarketCategory, name: string, detailsId?: string) {
  return `${category}:${detailsId || name}`.toLowerCase().replace(/[^a-z0-9:]+/g, "-");
}

function heatFromCounts(...counts: Array<number | undefined>) {
  const found = counts.find((count) => typeof count === "number" && Number.isFinite(count));
  return found;
}

export function normalizeCurrencyLine(
  line: PoeNinjaCurrencyLine,
  category: Extract<MarketCategory, "Currency" | "Fragment">
): MarketItem {
  const name = line.currencyTypeName;
  const change24h =
    line.receiveSparkLine?.totalChange ??
    line.paySparkLine?.totalChange ??
    line.lowConfidencePaySparkLine?.totalChange;

  return {
    id: stableId(category, name, line.detailsId),
    name,
    zhName: getZhItemName(name),
    displayName: getDisplayName(name),
    category,
    chaosValue: line.chaosEquivalent ?? line.receive?.value ?? line.pay?.value ?? 0,
    change24h,
    volume: heatFromCounts(line.receive?.count, line.pay?.count),
    listingCount: heatFromCounts(line.pay?.count, line.receive?.count),
    icon: line.icon,
    detailsId: line.detailsId,
    confidence: line.lowConfidencePaySparkLine ? "low" : "high"
  };
}

export function normalizeItemLine(line: PoeNinjaItemLine, category: MarketCategory): MarketItem {
  const name = line.name;

  return {
    id: stableId(category, name, line.detailsId || String(line.id || "")),
    name,
    zhName: getZhItemName(name),
    displayName: getDisplayName(name),
    category,
    chaosValue: line.chaosValue ?? 0,
    divineValue: line.divineValue,
    change24h: line.sparkline?.totalChange ?? line.lowConfidenceSparkLine?.totalChange,
    volume: heatFromCounts(line.count, line.listingCount),
    listingCount: line.listingCount,
    icon: line.icon,
    detailsId: line.detailsId,
    confidence: line.lowConfidenceSparkLine ? "low" : "high"
  };
}

export function normalizeAll(
  payloads: Partial<Record<MarketCategory, { lines: unknown[] }>>
): MarketItem[] {
  const normalized = Object.entries(payloads).flatMap(([category, payload]) => {
    const typedCategory = category as MarketCategory;
    const lines = payload?.lines || [];
    if (typedCategory === "Currency" || typedCategory === "Fragment") {
      return lines.map((line) => normalizeCurrencyLine(line as PoeNinjaCurrencyLine, typedCategory));
    }
    return lines.map((line) => normalizeItemLine(line as PoeNinjaItemLine, typedCategory));
  });

  const divineRate = normalized.find((item) => item.name === "Divine Orb")?.chaosValue;
  if (!divineRate || divineRate <= 0) return normalized;

  return normalized.map((item) => {
    if (item.divineValue || item.chaosValue < divineRate) return item;
    return {
      ...item,
      divineValue: item.chaosValue / divineRate
    };
  });
}
