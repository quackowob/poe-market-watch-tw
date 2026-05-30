import type { MarketCategory } from "./types";

export const marketCategories: MarketCategory[] = [
  "Currency",
  "Fragment",
  "Scarab",
  "Beast",
  "DeliriumOrb",
  "Omen",
  "DivinationCard"
];

export const itemOverviewCategories: MarketCategory[] = [
  "Scarab",
  "Beast",
  "DeliriumOrb",
  "Omen",
  "DivinationCard"
];

export const currencyOverviewCategories: MarketCategory[] = ["Currency", "Fragment"];

export function getLeague() {
  return process.env.LEAGUE || "Mirage";
}

export function getLeagueZh() {
  return process.env.LEAGUE_ZH || "遠古蜃景";
}

export function getMinValueChaos() {
  return Number(process.env.MIN_VALUE_CHAOS || 10);
}

export function getRefreshIntervalMinutes() {
  return Number(process.env.REFRESH_INTERVAL_MINUTES || 30);
}

export function isI18nEnabled() {
  return (process.env.ENABLE_I18N || "true") !== "false";
}
