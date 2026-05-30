import itemNameMap from "../config/i18n/item-name-map.json";
import { fetchAllMarketData } from "../lib/poeNinja";

const mappedNames = new Set(Object.keys(itemNameMap as Record<string, string>).map((name) => name.toLowerCase()));

async function main() {
  const { items } = await fetchAllMarketData();
  const missing = items
    .filter((item) => !mappedNames.has(item.name.toLowerCase()))
    .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));

  console.log(`Total items: ${items.length}`);
  console.log(`Missing i18n: ${missing.length}`);
  console.log("");
  console.log(["Category", "English name", "Chaos", "Estimated heat"].join("\t"));

  for (const item of missing) {
    console.log([item.category, item.name, item.chaosValue, item.volume ?? "N/A"].join("\t"));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
