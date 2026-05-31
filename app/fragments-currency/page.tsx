import { DataSourceBanner } from "@/components/DataSourceBanner";
import { MarketTable } from "@/components/MarketTable";
import { fetchAllMarketData } from "@/lib/poeNinja";

export default async function FragmentsCurrencyPage() {
  const { items, source, warnings } = await fetchAllMarketData();
  const combined = items.filter((item) => item.category === "Currency" || item.category === "Fragment");

  return (
    <div className="space-y-4">
      <DataSourceBanner source={source} warnings={warnings} />
      <MarketTable
        title="碎片與通貨"
        items={combined}
        searchable
        pageSize={20}
        categoryTabs={["Currency", "Fragment"]}
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
