export function HeatHint() {
  return (
    <span
      className="inline-flex cursor-help items-center rounded-full border border-amber-400/40 px-2 py-0.5 text-xs text-amber-200"
      title="熱度優先使用 poe.ninja 回傳的 volumePrimaryValue，其次使用 count / listingCount。這是掛單與價格追蹤資料推估，不是官方成交量，也不是價格加權交易額。"
    >
      估算熱度
    </span>
  );
}
