import beastNotes from "@/config/beast-notes.json";
import { DataSourceBanner } from "@/components/DataSourceBanner";
import { MarketTable } from "@/components/MarketTable";
import { readStaticMarketData } from "@/lib/marketData";

export default async function BeastsPage() {
  const { items, source, warnings, meta } = await readStaticMarketData();
  const beasts = items.filter((item) => item.category === "Beast");

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
        title="野獸市場"
        items={beasts}
        searchable
        pageSize={20}
        defaultSort="price"
        notes={beastNotes}
        sortOptions={[
          { key: "price", label: "價格" },
          { key: "change", label: "漲幅" },
          { key: "heat", label: "熱度" }
        ]}
      />
    </div>
  );
}
