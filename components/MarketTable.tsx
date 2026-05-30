"use client";

import { useMemo, useState } from "react";
import { getCategoryName } from "@/lib/i18n";
import { formatChaos, formatHeat, formatPercent } from "@/lib/format";
import { getHeat, sortMarketItems } from "@/lib/ranking";
import type { MarketCategory, MarketItem, SortKey } from "@/lib/types";
import { HeatHint } from "./HeatHint";

type Props = {
  items: MarketItem[];
  title?: string;
  searchable?: boolean;
  pageSize?: number;
  sortOptions?: Array<{ key: SortKey; label: string }>;
  defaultSort?: SortKey;
  filters?: string[];
  categoryTabs?: MarketCategory[];
  minValueToggle?: boolean;
  notes?: Record<string, { zhName?: string; notes?: string[] }>;
};

function matchesFilter(item: MarketItem, filter: string) {
  if (filter === "全部") return true;
  return item.name.toLowerCase().includes(filter.toLowerCase()) || item.displayName.includes(filter);
}

export function MarketTable({
  items,
  title,
  searchable = false,
  pageSize = 10,
  sortOptions = [
    { key: "price", label: "價格" },
    { key: "change", label: "漲幅" },
    { key: "heat", label: "熱度" }
  ],
  defaultSort = "price",
  filters,
  categoryTabs,
  minValueToggle = false,
  notes
}: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(defaultSort);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState(filters?.[0] || "全部");
  const [category, setCategory] = useState<MarketCategory | "全部">("全部");
  const [minOnly, setMinOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortMarketItems(
      items.filter((item) => {
        const searchableText = `${item.name} ${item.zhName || ""} ${item.displayName}`.toLowerCase();
        return (
          (!q || searchableText.includes(q)) &&
          matchesFilter(item, filter) &&
          (category === "全部" || item.category === category) &&
          (!minOnly || item.chaosValue >= 10)
        );
      }),
      sortKey
    );
  }, [category, filter, items, minOnly, query, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function resetPage(next: () => void) {
    next();
    setPage(1);
  }

  return (
    <section className="rounded-lg border border-line bg-panel/80 p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {title ? <h2 className="text-lg font-semibold text-white">{title}</h2> : <span />}
        <HeatHint />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        {searchable ? (
          <input
            className="focus-ring min-h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-white placeholder:text-slate-500 sm:w-72"
            placeholder="搜尋中文或英文"
            value={query}
            onChange={(event) => resetPage(() => setQuery(event.target.value))}
          />
        ) : null}

        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`focus-ring min-h-10 rounded-md border px-3 text-sm transition ${
                sortKey === option.key
                  ? "border-amber-300 bg-amber-400 text-slate-950"
                  : "border-line bg-slate-950 text-slate-200 hover:border-amber-400/70"
              }`}
              onClick={() => resetPage(() => setSortKey(option.key))}
            >
              {option.label}
            </button>
          ))}
        </div>

        {minValueToggle ? (
          <label className="focus-within:ring-2 focus-within:ring-amber-400/70 flex min-h-10 items-center gap-2 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={minOnly}
              onChange={(event) => resetPage(() => setMinOnly(event.target.checked))}
              className="h-4 w-4 accent-amber-400"
            />
            只看 >=10c
          </label>
        ) : null}
      </div>

      {filters ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {filters.map((itemFilter) => (
            <button
              key={itemFilter}
              type="button"
              className={`focus-ring whitespace-nowrap rounded-md border px-3 py-2 text-sm ${
                filter === itemFilter ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-line text-slate-200"
              }`}
              onClick={() => resetPage(() => setFilter(itemFilter))}
            >
              {itemFilter}
            </button>
          ))}
        </div>
      ) : null}

      {categoryTabs ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {(["全部", ...categoryTabs] as Array<MarketCategory | "全部">).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`focus-ring whitespace-nowrap rounded-md border px-3 py-2 text-sm ${
                category === tab ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-line text-slate-200"
              }`}
              onClick={() => resetPage(() => setCategory(tab))}
            >
              {tab === "全部" ? "全部" : getCategoryName(tab)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-slate-400">
            <tr>
              <th className="py-3 pr-4">名稱</th>
              <th className="py-3 pr-4">分類</th>
              <th className="py-3 pr-4">價格</th>
              <th className="py-3 pr-4">漲跌</th>
              <th className="py-3 pr-4">熱度</th>
              <th className="py-3 pr-4">標籤 / 備註</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/80">
            {visible.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="py-3 pr-4">
                  <div className="font-medium text-white">{item.displayName}</div>
                  {item.zhName ? <div className="text-xs text-slate-400">{item.name}</div> : null}
                </td>
                <td className="py-3 pr-4 text-slate-300">{getCategoryName(item.category)}</td>
                <td className="py-3 pr-4 font-semibold text-amber-200">{formatChaos(item)}</td>
                <td className={`py-3 pr-4 ${Number(item.change24h) >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatPercent(item.change24h)}
                </td>
                <td className="py-3 pr-4 text-cyan-200">{formatHeat(getHeat(item))}</td>
                <td className="py-3 pr-4">
                  <div className="flex max-w-md flex-wrap gap-2">
                    {item.tags?.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200">
                        {tag}
                      </span>
                    ))}
                    {notes?.[item.name]?.notes?.map((note) => (
                      <span key={note} className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">
                        {note}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <span>
          顯示 {visible.length} / {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="focus-ring rounded-md border border-line px-3 py-2 disabled:opacity-40"
            disabled={safePage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            上一頁
          </button>
          <span>
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            className="focus-ring rounded-md border border-line px-3 py-2 disabled:opacity-40"
            disabled={safePage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            下一頁
          </button>
        </div>
      </div>
    </section>
  );
}
