"use client";

export default function MetricCard({ icon: Icon, label, value, unit, sub, iconClass = "text-gh-rose", accent }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gh-blush transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent || "bg-gh-rose-50"}`}>
          <Icon size={18} strokeWidth={1.8} className={iconClass} />
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-800 tabular-nums">{value ?? "—"}</span>
        {unit && <span className="text-sm text-slate-500 font-medium">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}