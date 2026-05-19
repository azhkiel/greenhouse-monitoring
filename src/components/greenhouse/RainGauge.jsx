"use client";

import { CloudRain, Info } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { getRainLabel } from "../../utils/greenhouse";

export default function RainGauge({ pct, status }) {
  const info = getRainLabel(pct);
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gh-blush">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gh-blush flex items-center justify-center">
          <CloudRain size={18} strokeWidth={1.8} className="text-gh-rose" />
        </div>
        <span className="text-sm font-semibold text-slate-700">Sensor Hujan</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl font-bold text-slate-800 tabular-nums">
          {pct}<span className="text-lg font-normal text-gh-pink">%</span>
        </span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${info.badge}`}>
          <span className={`w-2 h-2 rounded-full ${info.dot}`} />
          {info.label}
        </span>
      </div>

      <ProgressBar value={pct} barClass={info.bar} />

      <div className="flex items-start gap-1.5 mt-3 text-xs text-gh-pink">
        <Info size={12} className="mt-0.5 shrink-0" />
        <span>0–34% Tidak Hujan · 35–64% Gerimis · 65–100% Hujan</span>
      </div>
    </div>
  );
}