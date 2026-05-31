import { DashboardSections } from "@/components/DashboardSections";
import { DataSourceBanner } from "@/components/DataSourceBanner";
import { StatCard } from "@/components/StatCard";
import { getLeague, getLeagueZh, getMinValueChaos, getRefreshIntervalMinutes } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import { fetchAllMarketData } from "@/lib/poeNinja";

export default async function DashboardPage() {
  const { items, lastUpdated, source, warnings } = await fetchAllMarketData();

  return (
    <div className="space-y-6">
      <DataSourceBanner source={source} warnings={warnings} />

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="目標聯盟" value={getLeagueZh()} detail={getLeague()} />
        <StatCard label="撿取門檻" value={`${getMinValueChaos()}c`} detail="保險箱監控最低價值" />
        <StatCard label="刷新間隔" value={`${getRefreshIntervalMinutes()} 分鐘`} detail="In-memory cache TTL" />
        <StatCard label="最後更新" value={formatDateTime(lastUpdated)} detail="伺服器快取時間" />
      </section>

      <DashboardSections items={items} />
    </div>
  );
}
