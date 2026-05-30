import { MarketTable } from "@/components/MarketTable";
import { fetchAllMarketData } from "@/lib/poeNinja";

export default async function DeliriumOrbsPage() {
  const { items } = await fetchAllMarketData();
  const deliriumOrbs = items.filter((item) => item.category === "DeliriumOrb");

  return (
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
  );
}
