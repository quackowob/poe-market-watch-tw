import { MarketTable } from "@/components/MarketTable";
import { StatCard } from "@/components/StatCard";
import { getLeague, getLeagueZh, getMinValueChaos, getRefreshIntervalMinutes } from "@/lib/config";
import { fetchAllMarketData } from "@/lib/poeNinja";
import { formatDateTime } from "@/lib/format";
import {
  getFavoriteItems,
  getHighValue,
  getStrongboxDrops,
  getTopVolume
} from "@/lib/ranking";

export default async function DashboardPage() {
  const { items, lastUpdated } = await fetchAllMarketData();

  const scarabs = getTopVolume(items, "Scarab", 10);
  const favorites = getFavoriteItems(items);
  const deliriumOrbs = items.filter((item) => item.category === "DeliriumOrb");
  const highValueBeasts = getHighValue(items, "Beast", 10);
  const highValueCards = getHighValue(items, "DivinationCard", 10);
  const strongboxDrops = getStrongboxDrops(items, "valueHeat", 25);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="目標聯盟" value={getLeagueZh()} detail={getLeague()} />
        <StatCard label="最低拾取門檻" value={`${getMinValueChaos()}c`} detail="保險箱掉落監控" />
        <StatCard label="快取刷新" value={`${getRefreshIntervalMinutes()} 分鐘`} detail="In-memory cache TTL" />
        <StatCard label="最後更新" value={formatDateTime(lastUpdated)} detail="台北時間" />
      </section>

      <MarketTable title="今日熱門甲蟲" items={scarabs} defaultSort="heat" pageSize={10} />
      <MarketTable title="我的最愛" items={favorites} defaultSort="heat" pageSize={10} />
      <MarketTable
        title="譫妄玉市場"
        items={deliriumOrbs}
        defaultSort="price"
        pageSize={10}
        sortOptions={[
          { key: "price", label: "價格" },
          { key: "change", label: "漲幅" },
          { key: "heat", label: "熱度" }
        ]}
      />
      <MarketTable title="高價野獸" items={highValueBeasts} defaultSort="price" pageSize={10} />
      <MarketTable title="高價命運卡" items={highValueCards} defaultSort="price" pageSize={10} />
      <MarketTable
        title="保險箱掉落監控"
        items={strongboxDrops}
        defaultSort="valueHeat"
        pageSize={25}
        sortOptions={[
          { key: "price", label: "價格" },
          { key: "change", label: "漲幅" },
          { key: "heat", label: "熱度" },
          { key: "valueHeat", label: "價格 x 熱度" }
        ]}
      />
    </div>
  );
}
