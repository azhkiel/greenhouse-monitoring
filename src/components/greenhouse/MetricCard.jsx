export default function MetricCard({ icon: Icon, label, value, unit, sub, iconClass = "text-blue-600" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
      <div className={`mt-0.5 ${iconClass}`}>
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">{label}</p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">{value ?? "—"}</span>
          {unit && <span className="text-sm text-slate-500">{unit}</span>}
        </div>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}