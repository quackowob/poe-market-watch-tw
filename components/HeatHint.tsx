export function HeatHint() {
  return (
    <span
      className="inline-flex cursor-help items-center rounded-full border border-amber-400/40 px-2 py-0.5 text-xs text-amber-200"
      title="熱度優先使用目前資料來源提供的 24h volume traded / volumePrimaryValue，其次使用 count / listingCount。這是市場活動估算，不代表官方實際成交量，也不是價格加權交易額。"
    >
      估算熱度
    </span>
  );
}
