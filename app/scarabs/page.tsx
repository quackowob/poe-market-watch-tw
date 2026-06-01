import { DataSourceBanner } from "@/components/DataSourceBanner";
import { MarketTable } from "@/components/MarketTable";
import { readStaticMarketData } from "@/lib/marketData";

const scarabFilters = ["全部", "Ambush", "Breach", "Harbinger", "Expedition", "Domination", "Cartography"];

export default async function ScarabsPage() {
  const { items, source, warnings, meta } = await readStaticMarketData();
  const scarabs = items.filter((item) => item.category === "Scarab");

  return (
    <div className="space-y-4">
      <DataSourceBanner source={source} warnings={warnings} updatedAt={meta.updatedAt} stale={meta.stale} />
      <MarketTable
        title="聖甲蟲市場"
        items={scarabs}
        searchable
        pageSize={20}
        filters={scarabFilters}
        defaultSort="heat"
        sortOptions={[
          { key: "price", label: "價格" },
          { key: "change", label: "漲幅" },
          { key: "heat", label: "熱度" }
        ]}
      />
    </div>
  );
}
