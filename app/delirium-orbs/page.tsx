import { DataSourceBanner } from "@/components/DataSourceBanner";
import { MarketTable } from "@/components/MarketTable";
import { readStaticMarketData } from "@/lib/marketData";

export default async function DeliriumOrbsPage() {
  const { items, source, warnings, meta } = await readStaticMarketData();
  const deliriumOrbs = items.filter((item) => item.category === "DeliriumOrb");

  return (
    <div className="space-y-4">
      <DataSourceBanner
        source={source}
        categorySources={meta.categorySources}
        warnings={warnings}
        updatedAt={meta.updatedAt}
        stale={meta.stale}
      />
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
