import { DataSourceBanner } from "@/components/DataSourceBanner";
import { MarketTable } from "@/components/MarketTable";
import { fetchAllMarketData } from "@/lib/poeNinja";

export default async function DeliriumOrbsPage() {
  const { items, source, warnings } = await fetchAllMarketData();
  const deliriumOrbs = items.filter((item) => item.category === "DeliriumOrb");

  return (
    <div className="space-y-4">
      <DataSourceBanner source={source} warnings={warnings} />
      <MarketTable
        title="譫妄玉市場"
        items={deliriumOrbs}
        searchable
        pageSize={20}
        defaultSort="price"
        sortOptions={[
          { key: "price", label: "價格" },
          { key: "change", label: "漲幅" },
          { key: "heat", label: "熱度" }
        ]}
      />
    </div>
  );
}
