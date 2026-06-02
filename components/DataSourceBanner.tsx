import { formatDateTime } from "@/lib/format";
import { marketCategories } from "@/lib/config";
import type { CategorySourceMap, MarketCategory, MarketDataSource } from "@/lib/types";

const categoryLabels: Record<MarketCategory, string> = {
  Currency: "通貨",
  Fragment: "碎片",
  Scarab: "聖甲蟲",
  Beast: "野獸",
  DeliriumOrb: "譫妄玉",
  Omen: "預兆",
  DivinationCard: "命運卡"
};

type Props = {
  source: MarketDataSource;
  categorySources?: CategorySourceMap;
  warnings?: string[];
  updatedAt?: string;
  stale?: boolean;
};

export function DataSourceBanner({ source, categorySources, warnings, updatedAt, stale }: Props) {
  const isWarning = source.isFallback || stale;
  const fallbackCategories = marketCategories.filter((category) => categorySources?.[category]?.isFallback);

  return (
    <section
      className={`rounded-lg border p-4 text-sm ${
        isWarning
          ? "border-amber-400/40 bg-amber-950/30 text-amber-100"
          : "border-cyan-400/30 bg-cyan-950/20 text-cyan-100"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-white">資料來源：{source.label}</div>
        {updatedAt ? <div className="text-xs opacity-80">最後更新：{formatDateTime(updatedAt)}</div> : null}
      </div>

      <div className={`mt-1 ${isWarning ? "text-amber-100/85" : "text-cyan-100/80"}`}>
        {source.realm === "Global"
          ? "目前使用 poe.ninja 國際服備援資料，價格可能與台服市場有明顯差異。"
          : source.realm === "Mixed"
            ? "部分分類使用 poe.ninja 備援資料，該分類價格可能與台服市場有差異。"
            : "市場資料來自 PoEDB 台服經濟，價格僅供參考，非保證成交價。"}
      </div>

      {stale ? <div className="mt-2 font-semibold text-amber-100">資料可能過期</div> : null}

      {categorySources ? (
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
          {marketCategories.map((category) => {
            const categorySource = categorySources[category];
            if (!categorySource) return null;

            return (
              <div
                key={category}
                className={`rounded border px-2 py-1 ${
                  categorySource.isFallback ? "border-amber-300/30 bg-amber-950/30" : "border-cyan-300/20 bg-cyan-950/20"
                }`}
              >
                <span className="font-semibold text-white">{categoryLabels[category]}：</span>
                {categorySource.isFallback ? "poe.ninja 備援" : "PoEDB TW"}
              </div>
            );
          })}
        </div>
      ) : null}

      {fallbackCategories.length ? (
        <div className="mt-2 text-xs font-semibold text-amber-100">
          使用 poe.ninja 備援分類：{fallbackCategories.map((category) => categoryLabels[category]).join("、")}
        </div>
      ) : null}

      {warnings?.length ? (
        <ul className="mt-3 space-y-1 text-xs opacity-85">
          {[...new Set(warnings)].map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
