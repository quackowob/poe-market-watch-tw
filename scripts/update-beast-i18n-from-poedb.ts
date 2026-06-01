import fs from "node:fs/promises";
import path from "node:path";
import { getCrawlerUserAgent } from "../lib/userAgent";

const sourceUrl = "https://poedb.tw/tw/Beast#Beast%E6%80%AA%E7%89%A9";
const poeNinjaBeastUrl = `https://poe.ninja/poe1/api/economy/stash/current/item/overview?league=${encodeURIComponent(
  process.env.LEAGUE || "Mirage"
)}&type=Beast`;
const root = process.cwd();
const beastMapPath = path.join(root, "config", "i18n", "beast-name-map.json");

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function toEnglishName(slug: string) {
  return decodeURIComponent(slug)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function sortObject(input: Record<string, string>) {
  return Object.fromEntries(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)));
}

async function readExistingMap() {
  try {
    return JSON.parse(await fs.readFile(beastMapPath, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": getCrawlerUserAgent()
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchCurrentBeastNames() {
  const response = await fetch(poeNinjaBeastUrl, {
    headers: {
      "user-agent": getCrawlerUserAgent()
    }
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as { lines?: Array<{ name?: string }> };
  return [...new Set((payload.lines || []).map((line) => line.name).filter(Boolean) as string[])];
}

function toPoedbMonsterUrl(englishName: string) {
  const slug = englishName.replace(/\s+/g, "_");
  return `https://poedb.tw/tw/${encodeURIComponent(slug).replace(/%2C/g, ",")}`;
}

async function fetchPoedbTitle(englishName: string) {
  try {
    const html = await fetchText(toPoedbMonsterUrl(englishName));
    const title = html.match(/<title>(.*?)\s+-\s+流亡編年史/i)?.[1];
    const zhName = title ? decodeHtml(title).trim() : undefined;
    if (!zhName || zhName === englishName || /^[\x00-\x7F]+$/.test(zhName)) return undefined;
    return zhName;
  } catch {
    return undefined;
  }
}

async function enrichCurrentMarketBeasts(map: Record<string, string>) {
  const names = await fetchCurrentBeastNames();
  const missingNames = names.filter((name) => !map[name] && !map[stripDiacritics(name)]);
  let enriched = 0;

  for (let index = 0; index < missingNames.length; index += 8) {
    const batch = missingNames.slice(index, index + 8);
    const titles = await Promise.all(batch.map((name) => fetchPoedbTitle(name)));
    titles.forEach((zhName, offset) => {
      if (!zhName) return;
      const englishName = batch[offset];
      map[englishName] = zhName;
      const asciiAlias = stripDiacritics(englishName);
      if (asciiAlias !== englishName) map[asciiAlias] = zhName;
      enriched += 1;
    });
  }

  return { currentMarketNames: names.length, enriched };
}

async function main() {
  const html = await fetchText(sourceUrl);
  const generated: Record<string, string> = {};
  const linkPattern =
    /<a\b(?=[^>]*\bdata-hover=["'][^"']*Poe_Data_MonsterVarieties_hover[^"']*["'])(?=[^>]*\bhref=["']\/tw\/([^"']+)["'])[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(linkPattern)) {
    const englishName = toEnglishName(match[1]);
    const zhName = decodeHtml(match[2].replace(/<[^>]+>/g, "")).trim();

    if (!englishName || !zhName || /[<>]/.test(englishName)) continue;
    generated[englishName] = zhName;

    const asciiAlias = stripDiacritics(englishName);
    if (asciiAlias !== englishName) generated[asciiAlias] = zhName;
  }

  if (Object.keys(generated).length < 100) {
    throw new Error(`PoEDB Beast parser found too few names: ${Object.keys(generated).length}`);
  }

  const existing = await readExistingMap();
  const merged = { ...existing, ...generated };
  const marketStats = await enrichCurrentMarketBeasts(merged);
  const sorted = sortObject(merged);
  await fs.writeFile(beastMapPath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");

  console.log(`Updated ${beastMapPath}`);
  console.log(`Merged ${Object.keys(generated).length} PoEDB beast monster names.`);
  console.log(`Checked ${marketStats.currentMarketNames} current market beasts, enriched ${marketStats.enriched} names from PoEDB pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
