import { Lightbulb, Sun, CheckCircle } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function LightHours({ natural, lamp, total, target }) {
  const pct = target > 0 ? Math.min(100, (total / target) * 100) : 0;
  const done = pct >= 100;

  const blocks = [
    { icon: Sun,          label: "Alami",  value: natural, wrapClass: "bg-yellow-50", valClass: "text-yellow-800" },
    { icon: Lightbulb,    label: "Lampu",  value: lamp,    wrapClass: "bg-blue-50",   valClass: "text-blue-800"   },
    { icon: CheckCircle,  label: "Total",  value: total,   wrapClass: "bg-emerald-50",valClass: "text-emerald-800"},
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
        <Lightbulb size={18} strokeWidth={1.8} />
        <span>Durasi Cahaya</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {blocks.map(({ icon: Icon, label, value, wrapClass, valClass }) => (
          <div key={label} className={`${wrapClass} rounded-xl p-3 flex flex-col items-center gap-1`}>
            <Icon size={15} strokeWidth={1.8} className={valClass} />
            <span className={`text-xl font-bold ${valClass} tabular-nums`}>
              {value}<small className="text-xs font-normal">j</small>
            </span>
            <span className="text-[11px] text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
        <span>Target {target}j</span>
        <span className={`font-semibold ${done ? "text-emerald-600" : "text-blue-600"}`}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <ProgressBar value={total} max={target} barClass={done ? "bg-emerald-500" : "bg-blue-500"} />
    </div>
  );
}