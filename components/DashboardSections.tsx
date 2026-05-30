"use client";

import { useMemo } from "react";
import { MarketTable } from "@/components/MarketTable";
import { getHighValue, getStrongboxDrops, sortMarketItems } from "@/lib/ranking";
import type { MarketItem } from "@/lib/types";
import { DASHBOARD_ORDER_KEY, useFavoriteNames, useStoredOrder } from "./preferences";

const dashboardSections = [
  "favorites",
  "scarabs",
  "delirium",
  "beasts",
  "cards",
  "strongbox"
] as const;

type DashboardSectionId = (typeof dashboardSections)[number];

type Props = {
  items: MarketItem[];
};

const sectionNames: Record<DashboardSectionId, string> = {
  favorites: "我的最愛",
  scarabs: "今日熱門甲蟲",
  delirium: "譫妄玉市場",
  beasts: "高價野獸",
  cards: "高價命運卡",
  strongbox: "保險箱掉落監控"
};

export function DashboardSections({ items }: Props) {
  const { favoriteSet } = useFavoriteNames();
  const { order, move, reset } = useStoredOrder(DASHBOARD_ORDER_KEY, dashboardSections);

  const sectionItems = useMemo(() => {
    return {
      favorites: items.filter((item) => favoriteSet.has(item.name)),
      scarabs: sortMarketItems(items.filter((item) => item.category === "Scarab"), "heat"),
      delirium: items.filter((item) => item.category === "DeliriumOrb"),
      beasts: getHighValue(items, "Beast", 50),
      cards: getHighValue(items, "DivinationCard", 50),
      strongbox: getStrongboxDrops(items, "valueHeat", 100)
    } satisfies Record<DashboardSectionId, MarketItem[]>;
  }, [favoriteSet, items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel/70 p-3 text-sm text-slate-300">
        <span>Dashboard 區塊可用每張表右上角的 ↑ ↓ 依照你的刷圖習慣排序。</span>
        <button type="button" className="focus-ring rounded-md border border-line px-3 py-2 text-slate-200" onClick={reset}>
          重設 Dashboard 順序
        </button>
      </div>

      {order.map((sectionId) => (
        <DashboardSection
          key={sectionId}
          sectionId={sectionId}
          items={sectionItems[sectionId]}
          canMoveUp={order.indexOf(sectionId) > 0}
          canMoveDown={order.indexOf(sectionId) < order.length - 1}
          onMoveUp={() => move(sectionId, -1)}
          onMoveDown={() => move(sectionId, 1)}
        />
      ))}
    </div>
  );
}

function DashboardSection({
  sectionId,
  items,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown
}: {
  sectionId: DashboardSectionId;
  items: MarketItem[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const actions = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="focus-ring rounded-md border border-line px-2 py-1 text-xs text-slate-300 disabled:opacity-30"
        disabled={!canMoveUp}
        onClick={onMoveUp}
        title="往上移動區塊"
      >
        ↑
      </button>
      <button
        type="button"
        className="focus-ring rounded-md border border-line px-2 py-1 text-xs text-slate-300 disabled:opacity-30"
        disabled={!canMoveDown}
        onClick={onMoveDown}
        title="往下移動區塊"
      >
        ↓
      </button>
    </div>
  );

  if (sectionId === "delirium") {
    return (
      <MarketTable
        title={sectionNames[sectionId]}
        items={items}
        defaultSort="price"
        pageSize={10}
        actions={actions}
        sortOptions={[
          { key: "price", label: "價格" },
          { key: "change", label: "漲幅" },
          { key: "heat", label: "熱度" }
        ]}
      />
    );
  }

  if (sectionId === "strongbox") {
    return (
      <MarketTable
        title={sectionNames[sectionId]}
        items={items}
        defaultSort="valueHeat"
        pageSize={25}
        actions={actions}
        sortOptions={[
          { key: "price", label: "價格" },
          { key: "change", label: "漲幅" },
          { key: "heat", label: "熱度" },
          { key: "valueHeat", label: "價格 x 熱度" }
        ]}
      />
    );
  }

  return (
    <MarketTable
      title={sectionNames[sectionId]}
      items={items}
      defaultSort={sectionId === "scarabs" || sectionId === "favorites" ? "heat" : "price"}
      pageSize={sectionId === "scarabs" ? 10 : 10}
      actions={actions}
    />
  );
}
