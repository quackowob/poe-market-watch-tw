import { DashboardSections } from "@/components/DashboardSections";
import { StatCard } from "@/components/StatCard";
import { getLeague, getLeagueZh, getMinValueChaos, getRefreshIntervalMinutes } from "@/lib/config";
import { fetchAllMarketData } from "@/lib/poeNinja";
import { formatDateTime } from "@/lib/format";

export default async function DashboardPage() {
  const { items, lastUpdated, warnings } = await fetchAllMarketData();

  return (
    <div className="space-y-6">
      {warnings?.length ? (
        <section className="rounded-lg border border-amber-400/40 bg-amber-950/30 p-4 text-sm text-amber-100">
          <div className="font-semibold text-white">資料來源部分失敗</div>
          <div className="mt-1 text-amber-100/80">
            Dashboard 仍會顯示已成功取得的分類；若某個分類為空，通常代表 poe.ninja 目前沒有公開資料。
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="目標聯盟" value={getLeagueZh()} detail={getLeague()} />
        <StatCard label="撿取門檻" value={`${getMinValueChaos()}c`} detail="保險箱監控最低價格" />
        <StatCard label="刷新週期" value={`${getRefreshIntervalMinutes()} 分鐘`} detail="In-memory cache TTL" />
        <StatCard label="最後更新" value={formatDateTime(lastUpdated)} detail="伺服器抓取時間" />
      </section>

      <DashboardSections items={items} />
    </div>
  );
}
