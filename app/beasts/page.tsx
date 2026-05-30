import beastNotes from "@/config/beast-notes.json";
import { MarketTable } from "@/components/MarketTable";
import { fetchAllMarketData } from "@/lib/poeNinja";

export default async function BeastsPage() {
  const { items } = await fetchAllMarketData();
  const beasts = items.filter((item) => item.category === "Beast");

  return (
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
  );
}
