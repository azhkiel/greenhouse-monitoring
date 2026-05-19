"use client";

import { Sprout, Info } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { getSoilLabel } from "../../utils/greenhouse";

export default function SoilMoisture({ pct, pct2 }) {
  const info = getSoilLabel(pct);
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gh-blush">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gh-rose-50 flex items-center justify-center">
          <Sprout size={18} strokeWidth={1.8} className="text-gh-rose" />
        </div>
        <span className="text-sm font-semibold text-slate-700">Kelembapan Tanah</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs text-gh-pink font-medium">Sensor 1</span>
            <span className="text-2xl font-bold text-slate-800 tabular-nums">
              {pct}<span className="text-sm font-normal text-gh-pink">%</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${info.badge}`}>
              {info.label}
            </span>
          </div>
          <ProgressBar value={pct} barClass={info.bar} />
        </div>

        {pct2 !== undefined && pct2 !== null && (
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xs text-gh-pink font-medium">Sensor 2</span>
              <span className="text-2xl font-bold text-slate-800 tabular-nums">
                {pct2}<span className="text-sm font-normal text-gh-pink">%</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSoilLabel(pct2).badge}`}>
                {getSoilLabel(pct2).label}
              </span>
            </div>
            <ProgressBar value={pct2} barClass={getSoilLabel(pct2).bar} />
          </div>
        )}
      </div>

      <div className="flex items-start gap-1.5 mt-3 text-xs text-gh-pink">
        <Info size={12} className="mt-0.5 shrink-0" />
        <span>0% = sensor di udara, 100% = tanah terendam</span>
      </div>
    </div>
  );
}