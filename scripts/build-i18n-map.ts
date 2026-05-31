import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const itemMapPath = path.join(root, "config", "i18n", "item-name-map.json");
const beastMapPath = path.join(root, "config", "i18n", "beast-name-map.json");
const categoryMapPath = path.join(root, "config", "i18n", "category-name-map.json");

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, string>;
}

function sortObject(input: Record<string, string>) {
  return Object.fromEntries(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)));
}

for (const filePath of [itemMapPath, beastMapPath, categoryMapPath]) {
  const sorted = sortObject(readJson(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
}

console.log("i18n maps normalized.");
