"use client";

import { Lightbulb, Sun, CheckCircle } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function LightHours({ natural, lamp, total, target }) {
  const pct = target > 0 ? Math.min(100, (total / target) * 100) : 0;
  const done = pct >= 100;

  const blocks = [
    { icon: Sun,          label: "Alami",  value: natural, bg: "bg-gh-blush",     val: "text-gh-rose-700" },
    { icon: Lightbulb,   label: "Lampu",  value: lamp,    bg: "bg-gh-rose-50",   val: "text-gh-rose-700" },
    { icon: CheckCircle,  label: "Total",  value: total,   bg: "bg-gh-rose-100",  val: "text-gh-rose-700" },
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gh-blush">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gh-blush flex items-center justify-center">
          <Lightbulb size={18} strokeWidth={1.8} className="text-gh-rose" />
        </div>
        <span className="text-sm font-semibold text-slate-700">Durasi Cahaya</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {blocks.map(({ icon: Icon, label, value, bg, val }) => (
          <div key={label} className={`${bg} rounded-lg p-3 flex flex-col items-center gap-1`}>
            <Icon size={14} strokeWidth={1.8} className={val} />
            <span className={`text-xl font-bold ${val} tabular-nums`}>
              {value}<small className="text-xs font-normal">j</small>
            </span>
            <span className="text-[10px] text-gh-pink font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-gh-pink mb-1.5">
        <span>Target {target}j</span>
        <span className={`font-semibold ${done ? "text-gh-rose" : "text-gh-pink"}`}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <ProgressBar value={total} max={target} barClass={done ? "bg-gh-rose" : "bg-gh-pink"} />
    </div>
  );
}