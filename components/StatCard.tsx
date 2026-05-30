type Props = {
  label: string;
  value: string;
  detail?: string;
};

export function StatCard({ label, value, detail }: Props) {
  return (
    <div className="rounded-lg border border-line bg-panel/80 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {detail ? <div className="mt-1 text-xs text-slate-500">{detail}</div> : null}
    </div>
  );
}
