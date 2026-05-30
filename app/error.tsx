"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-lg border border-rose-400/40 bg-rose-950/30 p-6">
      <h2 className="text-xl font-semibold text-white">資料讀取失敗</h2>
      <p className="mt-2 text-sm text-rose-100">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md border border-rose-300 px-4 py-2 text-sm text-rose-100"
      >
        重新載入
      </button>
    </div>
  );
}
