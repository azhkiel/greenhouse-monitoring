import { CloudRain, Info } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { getRainLabel } from "../../utils/greenhouse";

export default function RainGauge({ pct }) {
  const info = getRainLabel(pct);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
        <CloudRain size={18} strokeWidth={1.8} />
        <span>Sensor Hujan</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl font-bold text-slate-900 tabular-nums">
          {pct}<span className="text-lg font-normal text-slate-500">%</span>
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${info.badge}`}>
          <span className={`w-2 h-2 rounded-full ${info.dot}`} />
          {info.label}
        </span>
      </div>

      <ProgressBar value={pct} barClass={info.bar} />

      <div className="flex items-start gap-1.5 mt-3 text-[11px] text-slate-400 leading-relaxed">
        <Info size={12} className="mt-0.5 shrink-0" />
        <span>Kalibrasi: 0–34% Tidak Hujan · 35–64% Gerimis · 65–100% Hujan</span>
      </div>
    </div>
  );
}