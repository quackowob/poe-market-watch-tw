import { getDisplayName, getZhItemName, getEnglishItemName } from "./i18n";
import type { MarketCategory, MarketItem } from "./types";
import type { ParsedPoedbEconomyRow } from "./parsers/poedbParser";

type PoeNinjaCurrencyLine = {
  id?: string;
  currencyTypeName: string;
  name?: string;
  primaryValue?: number;
  volumePrimaryValue?: number;
  chaosEquivalent?: number;
  receive?: { value?: number; count?: number };
  pay?: { value?: number; count?: number };
  detailsId?: string;
  icon?: string;
  lowConfidencePaySparkLine?: { totalChange?: number };
  receiveSparkLine?: { totalChange?: number };
  paySparkLine?: { totalChange?: number };
  sparkline?: { totalChange?: number };
};

type PoeNinjaItemLine = {
  id?: number | string;
  name: string;
  primaryValue?: number;
  volumePrimaryValue?: number;
  chaosValue?: number;
  divineValue?: number;
  exaltedValue?: number;
  count?: number;
  listingCount?: number;
  icon?: string;
  detailsId?: string;
  lowConfidenceSparkLine?: { totalChange?: number };
  sparkline?: { totalChange?: number };
  sparkLine?: { totalChange?: number };
};

type PoeNinjaExchangeItem = {
  id: string;
  name: string;
  image?: string;
  detailsId?: string;
};

type PoeNinjaExchangePayload = {
  lines: Array<PoeNinjaCurrencyLine | PoeNinjaItemLine>;
  items?: PoeNinjaExchangeItem[];
};

function stableId(category: MarketCategory, name: string, detailsId?: string) {
  return `${category}:${detailsId || name}`.toLowerCase().replace(/[^a-z0-9:]+/g, "-");
}

function heatFromCounts(...counts: Array<number | undefined>) {
  const found = counts.find((count) => typeof count === "number" && Number.isFinite(count));
  return found;
}

function fixMojibake(value: string) {
  if (!/[ÃÂ]/.test(value)) return value;
  return Buffer.from(value, "latin1").toString("utf8");
}

export function normalizeCurrencyLine(
  line: PoeNinjaCurrencyLine,
  category: Extract<MarketCategory, "Currency" | "Fragment">,
  exchangeItem?: PoeNinjaExchangeItem
): MarketItem {
  const name = fixMojibake(line.currencyTypeName || line.name || exchangeItem?.name || line.id || "Unknown");
  const change24h =
    line.sparkline?.totalChange ??
    line.receiveSparkLine?.totalChange ??
    line.paySparkLine?.totalChange ??
    line.lowConfidencePaySparkLine?.totalChange;

  return {
    id: stableId(category, name, line.detailsId || exchangeItem?.detailsId || line.id),
    name,
    zhName: getZhItemName(name),
    displayName: getDisplayName(name),
    category,
    chaosValue: line.primaryValue ?? line.chaosEquivalent ?? line.receive?.value ?? line.pay?.value ?? 0,
    change24h,
    volume: heatFromCounts(line.volumePrimaryValue, line.receive?.count, line.pay?.count),
    listingCount: heatFromCounts(line.volumePrimaryValue, line.pay?.count, line.receive?.count),
    icon: line.icon || exchangeItem?.image,
    detailsId: line.detailsId || exchangeItem?.detailsId,
    confidence: line.lowConfidencePaySparkLine ? "low" : "high"
  };
}

export function normalizeItemLine(line: PoeNinjaItemLine, category: MarketCategory, exchangeItem?: PoeNinjaExchangeItem): MarketItem {
  const name = fixMojibake(line.name || exchangeItem?.name || String(line.id || "Unknown"));

  return {
    id: stableId(category, name, line.detailsId || exchangeItem?.detailsId || String(line.id || "")),
    name,
    zhName: getZhItemName(name),
    displayName: getDisplayName(name),
    category,
    chaosValue: line.primaryValue ?? line.chaosValue ?? 0,
    divineValue: line.divineValue,
    change24h: line.sparkline?.totalChange ?? line.sparkLine?.totalChange ?? line.lowConfidenceSparkLine?.totalChange,
    volume: heatFromCounts(line.volumePrimaryValue, line.count, line.listingCount),
    listingCount: line.listingCount ?? line.volumePrimaryValue,
    icon: line.icon || exchangeItem?.image,
    detailsId: line.detailsId || exchangeItem?.detailsId,
    confidence: line.lowConfidenceSparkLine ? "low" : "high"
  };
}

export function normalizePoedbRow(row: ParsedPoedbEconomyRow, category: MarketCategory): MarketItem {
  const englishName = getEnglishItemName(row.name);
  const name = englishName || row.name;
  const zhName = englishName ? row.name : getZhItemName(name);
  const displayName = zhName || getDisplayName(name);

  return {
    id: stableId(category, name, row.detailsId),
    name,
    zhName,
    displayName,
    category,
    chaosValue: row.chaosValue,
    change24h: row.change24h,
    volume: row.volume,
    listingCount: row.volume,
    icon: row.icon,
    detailsId: row.detailsId,
    confidence: "high"
  };
}

function getExchangeItemMap(payload?: PoeNinjaExchangePayload) {
  return new Map((payload?.items || []).map((item) => [item.id, item]));
}

export function normalizeAll(
  payloads: Partial<Record<MarketCategory, { lines: unknown[] }>>
): MarketItem[] {
  const normalized = Object.entries(payloads).flatMap(([category, payload]) => {
    const typedCategory = category as MarketCategory;
    const typedPayload = payload as PoeNinjaExchangePayload | undefined;
    const lines = typedPayload?.lines || [];
    const exchangeItems = getExchangeItemMap(typedPayload);
    if (typedCategory === "Currency" || typedCategory === "Fragment") {
      return lines.map((line) =>
        normalizeCurrencyLine(
          line as PoeNinjaCurrencyLine,
          typedCategory,
          exchangeItems.get(String((line as PoeNinjaCurrencyLine).id || ""))
        )
      );
    }
    return lines.map((line) =>
      normalizeItemLine(
        line as PoeNinjaItemLine,
        typedCategory,
        exchangeItems.get(String((line as PoeNinjaItemLine).id || ""))
      )
    );
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
