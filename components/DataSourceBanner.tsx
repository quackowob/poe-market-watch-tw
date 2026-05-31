import type { MarketDataSource } from "@/lib/types";

type Props = {
  source: MarketDataSource;
  warnings?: string[];
};

export function DataSourceBanner({ source, warnings }: Props) {
  return (
    <section
      className={`rounded-lg border p-4 text-sm ${
        source.isFallback
          ? "border-amber-400/40 bg-amber-950/30 text-amber-100"
          : "border-cyan-400/30 bg-cyan-950/20 text-cyan-100"
      }`}
    >
      <div className="font-semibold text-white">資料來源：{source.label}</div>
      {source.realm === "Global" ? (
        <div className="mt-1 text-amber-100/85">
          目前使用 poe.ninja 國際服備援資料，價格可能與台服市場有明顯差異。
        </div>
      ) : source.realm === "Mixed" ? (
        <div className="mt-1 text-amber-100/85">
          部分分類使用 poe.ninja 國際服備援；同一分類內不混用不同市場資料。
        </div>
      ) : (
        <div className="mt-1 text-cyan-100/80">排行榜以同一個資料來源計算，不混用台服與國際服市場資料。</div>
      )}

      {warnings?.length ? (
        <ul className="mt-3 space-y-1 text-xs opacity-85">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
