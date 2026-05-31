import type { MarketCategory } from "../types";

export type ParsedPoedbEconomyRow = {
  name: string;
  detailsId?: string;
  icon?: string;
  chaosValue: number;
  change24h?: number;
  volume?: number;
};

type ParsedRatio = {
  leftAmount: number;
  leftId?: string;
  rightAmount: number;
  rightId?: string;
};

const categoryHints: Record<MarketCategory, string[]> = {
  Currency: [],
  Fragment: ["裂片", "碎片", "聖器", "祭品", "印記", "碑牌", "鑰匙"],
  Scarab: ["聖甲蟲"],
  Beast: ["野獸", "莫里根", "蜘蛛", "奇美拉", "禿鷹", "螃蟹", "狼"],
  DeliriumOrb: ["譫妄玉"],
  Omen: ["預兆"],
  DivinationCard: []
};

function decodeHtml(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function getCells(rowHtml: string) {
  return [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => match[1]);
}

function firstMatch(value: string, pattern: RegExp) {
  return value.match(pattern)?.[1];
}

function parseNumber(value?: string) {
  if (!value) return undefined;
  const number = Number(value.replace(/,/g, ""));
  return Number.isFinite(number) ? number : undefined;
}

function getEconomyLink(cellHtml: string) {
  const match = cellHtml.match(/<a\b[^>]*href=["']Economy_([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
  if (!match) return undefined;
  return {
    id: match[1],
    text: stripTags(match[2]),
    icon: firstMatch(match[2], /<img\b[^>]*src=["']([^"']+)["']/i)
  };
}

function parseRatio(cellHtml: string): ParsedRatio | undefined {
  const text = stripTags(cellHtml);
  const numbers = [...text.matchAll(/[\d,.]+/g)].map((match) => parseNumber(match[0])).filter(Boolean) as number[];
  const links = [...cellHtml.matchAll(/href=["']Economy_([^"']+)["']/gi)].map((match) => match[1]);

  if (numbers.length < 2 || links.length < 2) return undefined;

  return {
    leftAmount: numbers[0],
    leftId: links[0],
    rightAmount: numbers[1],
    rightId: links[1]
  };
}

function inferChaosValue(ratio: ParsedRatio, divineChaosValue?: number) {
  if (!ratio.leftId || !ratio.rightId || ratio.rightAmount <= 0) return undefined;
  if (ratio.leftId === "chaos") return ratio.leftAmount / ratio.rightAmount;
  if (ratio.rightId === "chaos") return ratio.rightAmount / ratio.leftAmount;
  if (ratio.leftId === "divine" && divineChaosValue) return (divineChaosValue * ratio.leftAmount) / ratio.rightAmount;
  if (ratio.rightId === "divine" && divineChaosValue) return (divineChaosValue * ratio.rightAmount) / ratio.leftAmount;
  return undefined;
}

function inferCategory(row: ParsedPoedbEconomyRow): MarketCategory {
  for (const [category, hints] of Object.entries(categoryHints) as Array<[MarketCategory, string[]]>) {
    if (hints.some((hint) => row.name.includes(hint))) return category;
  }
  return "Currency";
}

export function parsePoedbEconomyRows(html: string): ParsedPoedbEconomyRow[] {
  const candidates = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((match) => match[1])
    .map((rowHtml) => ({ rowHtml, cells: getCells(rowHtml) }))
    .filter(({ cells }) => cells.length >= 4);

  const ratiosById = new Map<string, ParsedRatio>();

  for (const { cells } of candidates) {
    const item = getEconomyLink(cells[0]);
    const ratio = parseRatio(cells[1]);
    if (item?.id && ratio) ratiosById.set(item.id, ratio);
  }

  const divineRatio = ratiosById.get("divine");
  const divineChaosValue =
    divineRatio && divineRatio.leftId === "chaos"
      ? divineRatio.leftAmount / divineRatio.rightAmount
      : divineRatio && divineRatio.rightId === "chaos"
        ? divineRatio.rightAmount / divineRatio.leftAmount
        : undefined;

  return candidates.flatMap(({ cells }) => {
    const item = getEconomyLink(cells[0]);
    const ratio = parseRatio(cells[1]);
    if (!item?.id || !item.text || !ratio) return [];

    const chaosValue = inferChaosValue(ratio, divineChaosValue);
    if (!chaosValue || chaosValue <= 0) return [];

    const change24h = parseNumber(firstMatch(cells[2], /([+-]?\d+(?:\.\d+)?)%/));
    const volume = parseNumber(stripTags(cells[3]).match(/[\d,]+/)?.[0]);

    return [
      {
        name: item.text,
        detailsId: item.id,
        icon: item.icon,
        chaosValue,
        change24h,
        volume
      }
    ];
  });
}

export function parsePoedbEconomy(html: string, category: MarketCategory) {
  const rows = parsePoedbEconomyRows(html);
  if (category === "Currency") {
    return rows.filter((row) => inferCategory(row) === "Currency");
  }
  return rows.filter((row) => inferCategory(row) === category);
}
