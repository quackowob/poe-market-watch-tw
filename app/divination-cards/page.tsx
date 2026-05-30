import { MarketTable } from "@/components/MarketTable";
import { fetchAllMarketData } from "@/lib/poeNinja";

export default async function DivinationCardsPage() {
  const { items } = await fetchAllMarketData();
  const cards = items.filter((item) => item.category === "DivinationCard");

  return (
    <MarketTable
      title="命運卡市場"
      items={cards}
      searchable
      pageSize={20}
      minValueToggle
      defaultSort="valueHeat"
      sortOptions={[
        { key: "price", label: "價格" },
        { key: "change", label: "漲幅" },
        { key: "heat", label: "熱度" },
        { key: "valueHeat", label: "價格 x 熱度" }
      ]}
    />
  );
}
