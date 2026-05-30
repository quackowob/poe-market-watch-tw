import type { MarketItem } from "./types";

export function formatChaos(item: MarketItem) {
  if (item.divineValue && item.divineValue >= 1) {
    return `${formatNumber(item.divineValue)}d`;
  }

  return `${formatNumber(item.chaosValue)}c`;
}

export function formatNumber(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0$/, "").replace(/\.0$/, "");
}

export function formatPercent(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  return `${value > 0 ? "+" : ""}${formatNumber(value)}%`;
}

export function formatHeat(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  return Intl.NumberFormat("zh-TW").format(Math.round(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei"
  }).format(new Date(value));
}
